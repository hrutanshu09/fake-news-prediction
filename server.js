const express = require('express');
const axios = require('axios');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;
const PYTHON_API_URL = 'http://127.0.0.1:5000/predict';
const OLLAMA_API_URL = 'http://127.0.0.1:11434/api/generate';

// --- Database Setup ---
const db = new sqlite3.Database('./history.db', (err) => {
    if (err) console.error(err.message);
    else console.log('Connected to the history.db SQLite database.');
});

db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);
    db.run(`CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        headline TEXT NOT NULL,
        prediction TEXT NOT NULL,
        confidence REAL NOT NULL,
        explanation TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
});

// --- Middleware ---
app.use(express.json());
app.use(session({
    secret: 'your-very-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// Middleware to check if user is authenticated
const checkAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login.html');
    }
};

// --- Authentication Routes ---
app.post('/signup', async (req, res) => {
    const { username, password, confirmPassword } = req.body;
    if (!username || !password || !confirmPassword) {
        return res.status(400).json({ success: false, message: 'All fields are required.' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
        if (err) {
            return res.status(400).json({ success: false, message: 'Username already exists.' });
        }
        res.json({ success: true, message: 'Signup successful! Please log in.' });
    });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err || !user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }
        req.session.user = { id: user.id, username: user.username };
        res.json({ success: true });
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/login.html');
    });
});


// --- Protected Page Routes ---
app.get('/', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/index.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/history.html', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'history.html'));
});

// --- Public static files (CSS, auth pages, client-side JS) ---
app.use(express.static(path.join(__dirname, 'public')));


// --- Protected API Routes ---
app.get('/history', checkAuth, (req, res) => {
    const userId = req.session.user.id;
    db.all("SELECT * FROM predictions WHERE user_id = ? ORDER BY timestamp DESC", [userId], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/predict', checkAuth, async (req, res) => {
    let predictionData = { userId: req.session.user.id };
    let fullExplanation = "";
    try {
        const { news } = req.body;
        predictionData.headline = news;
        const { prediction, confidence } = (await axios.post(PYTHON_API_URL, { news })).data;
        predictionData.prediction = prediction;
        predictionData.confidence = confidence;

        const prompt = `A news headline has been classified as "${prediction}". The headline is: "${news}". Based on this classification, provide a brief, 2-3 sentence explanation for why this headline might be considered ${prediction}.`;
        
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.write(JSON.stringify({ prediction, confidence }) + "\n");

        const ollamaResponse = await axios.post(
            OLLAMA_API_URL,
            { model: "tinyllama", prompt: prompt, stream: true },
            { responseType: 'stream' }
        );

        ollamaResponse.data.on('data', chunk => {
            const lines = chunk.toString().split("\n");
            for (const line of lines) {
                if (!line.trim()) continue;
                const parsed = JSON.parse(line);
                if (parsed.response) {
                    fullExplanation += parsed.response;
                    res.write(JSON.stringify({ explanationChunk: parsed.response }) + "\n");
                }
            }
        });

        ollamaResponse.data.on('end', () => {
            db.run(`INSERT INTO predictions (user_id, headline, prediction, confidence, explanation) VALUES (?, ?, ?, ?, ?)`,
                [predictionData.userId, predictionData.headline, predictionData.prediction, predictionData.confidence, fullExplanation],
                (err) => {
                    if (err) return console.error("DB Error:", err.message);
                });
            res.end();
        });
    } catch (error) {
        console.error('Error in /predict route:', error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Node.js server running at http://localhost:${PORT}`);
});