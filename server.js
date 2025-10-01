const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;
const PYTHON_API_URL = 'http://127.0.0.1:5000/predict';

// Middleware to parse JSON bodies and serve static files
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Route to serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Proxy route for predictions
app.post('/predict', async (req, res) => {
    try {
        const newsText = req.body;
        
        // Forward the request to the Python Flask API
        const response = await axios.post(PYTHON_API_URL, newsText, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        // Send the prediction result back to the client
        res.json(response.data);
    } catch (error) {
        console.error('Error proxying request:', error.message);
        res.status(500).json({ error: 'Failed to get prediction from model' });
    }
});

app.listen(PORT, () => {
    console.log(`Node.js server running at http://localhost:${PORT}`);
});