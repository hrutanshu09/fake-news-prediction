// server.js - FINAL VERSION
const express = require('express');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const session = require('express-session');
const bcrypt = require('bcrypt');
const cheerio = require('cheerio');
const cors = require('cors');
require('dotenv').config(); // <-- Add this line to load .env variables

// --- Add Gemini AI Setup ---
const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// -------------------------

const app = express();
const PORT = 3000;
const PYTHON_API_URL = 'http://127.0.0.1:5000/predict';

// --- Middleware ---
app.use(cors({
    origin: 'http://localhost:3001',
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

// --- Auth Middleware ---
const checkAuth = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized: Please log in.' });
    }
};

// --- Authentication Routes (Login, Signup, Logout) ---
// (These routes remain the same as the previous version)
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
        if (err) { return res.status(500).json({ success: false, message: 'Could not log out.' }); }
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
    // This route now only returns the prediction and confidence
    try {
        const { input, type } = req.body;
        let headline = input;

        if (type === 'url') {
            const url = input.startsWith('http') ? input : `https://${input}`;
            const response = await axios.get(url, { timeout: 5000 });
            const $ = cheerio.load(response.data);
            headline = ($('meta[property="og:title"]').attr('content') || $('title').text() || $('h1').first().text()).split(/\||-|–/)[0].trim();
        }
        
        const predictionResponse = await axios.post(PYTHON_API_URL, { news: headline });
        const { prediction, confidence } = predictionResponse.data;

        db.run(`INSERT INTO predictions (user_id, headline, prediction, confidence) VALUES (?, ?, ?, ?)`,
            [req.session.user.id, headline, prediction, confidence]);

        res.json({ prediction, confidence, headline });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get prediction.' });
    }
});

// --- NEW: Gemini Explanation Route ---
app.post('/explain', checkAuth, async (req, res) => {
    try {
        const { headline, prediction } = req.body;
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const prompt = `A news headline, "${headline}", was classified as "${prediction}". Provide a brief, 2-3 sentence explanation for why this might be the case in simple and understandable words. Focus on common characteristics of such headlines.`;

        const result = await model.generateContentStream(prompt);

        res.setHeader('Content-Type', 'text/plain');
        res.setHeader('Transfer-Encoding', 'chunked');

        for await (const chunk of result.stream) {
            res.write(chunk.text());
        }
        res.end();

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        res.status(500).end("Failed to get explanation.");
    }
});


app.listen(PORT, () => {
    console.log(`Node.js server running at http://localhost:${PORT}`);
});