const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const bcrypt = require('bcrypt');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = 3000;
const PYTHON_API_URL = 'http://127.0.0.1:5000/predict';

// --- Middleware ---
app.use(cors({
    origin: 'http://localhost:3001', // Allow requests from your React app
    credentials: true
}));
app.use(express.json());
app.use(session({
    secret: 'your-very-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

// --- Database Setup ---
const db = new sqlite3.Database('./history.db', (err) => {
    if (err) console.error(err.message);
    else console.log('Connected to the history.db SQLite database.');
});
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL)`);
    db.run(`CREATE TABLE IF NOT EXISTS predictions (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER NOT NULL, headline TEXT NOT NULL, prediction TEXT NOT NULL, confidence REAL NOT NULL, explanation TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (user_id) REFERENCES users (id))`);
});

// --- API-Friendly Auth Middleware ---
const checkAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized: Please log in.' });
    }
};

// --- Authentication Routes ---
app.post('/signup', async (req, res) => {
    const { username, password, confirmPassword } = req.body;
    if (!username || !password || !confirmPassword) { return res.status(400).json({ success: false, message: 'All fields are required.' }); }
    if (password !== confirmPassword) { return res.status(400).json({ success: false, message: 'Passwords do not match.' }); }
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
        if (err) { return res.status(400).json({ success: false, message: 'Username already exists.' }); }
        res.json({ success: true, message: 'Signup successful! Please log in.' });
    });
});

app.post('/login', (req, res) => {
    console.log('✅ /login endpoint was hit!');
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err || !user || !await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ success: false, message: 'Invalid username or password.' });
        }
        req.session.user = { id: user.id, username: user.username };
        res.json({ success: true });
    });
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Could not log out.' });
        }
        res.clearCookie('connect.sid');
        return res.json({ success: true, message: 'Logged out successfully.' });
    });
});

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
    try {
        const { input, type } = req.body;
        if (!input) return res.status(400).json({ error: 'Input is required' });

        let headline = input;

        if (type === 'url') {
            const url = input.startsWith('http') ? input : `https://${input}`;
            const response = await axios.get(url, { timeout: 5000 });
            const $ = cheerio.load(response.data);
            let scrapedTitle = $('meta[property="og:title"]').attr('content') || $('meta[name="twitter:title"]').attr('content') || $('title').text() || $('h1').first().text();
            if (!scrapedTitle || scrapedTitle.trim() === '') {
                throw new Error("Could not find a title for this URL.");
            }
            headline = scrapedTitle.split(/\||-|–/)[0].trim();
        }
        
        predictionData.headline = headline;
        const initialPredictionResponse = await axios.post(PYTHON_API_URL, { news: headline });
        const { prediction, confidence } = initialPredictionResponse.data;

        res.json({ prediction, confidence });

    } catch (error) {
        console.error('Error in /predict route:', error.message);
        if (!res.headersSent) {
             res.status(500).json({ error: 'An internal error occurred.' });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Node.js server running at http://localhost:${PORT}`);
});