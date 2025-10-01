const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;
const PYTHON_API_URL = 'http://127.0.0.1:5000/predict';
// --- THIS LINE HAS BEEN UPDATED to use the IPv4 address ---
const OLLAMA_API_URL = 'http://127.0.0.1:11434/api/generate'; 

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Main prediction route
app.post('/predict', async (req, res) => {
    try {
        const { news } = req.body;
        if (!news) {
            return res.status(400).json({ error: 'News text is required' });
        }

        const initialPredictionResponse = await axios.post(PYTHON_API_URL, { news });
        const initialPrediction = initialPredictionResponse.data.prediction;

        const prompt = `
            A news headline has been classified as "${initialPrediction}".
            The headline is: "${news}"

            Based on this classification, provide a brief, 2-3 sentence explanation for why this headline might be considered ${initialPrediction}.
            - If FAKE, focus on sensational language, emotional triggers, or unverifiable claims.
            - If REAL, focus on objective tone, factual language, and specific details.
            Do not question the initial classification. Just explain it.
        `;

        const ollamaResponse = await axios.post(OLLAMA_API_URL, {
            model: "tinyllama", 
            prompt: prompt,
            stream: false
        });
        
        const explanation = ollamaResponse.data.response;

        res.json({
            prediction: initialPrediction,
            explanation: explanation.trim()
        });

    } catch (error) {
        console.error('Error in /predict route:', error.message);
        if (error.code === 'ECONNREFUSED') {
            res.status(500).json({ error: 'Failed to get a complete prediction. Is the Ollama server running?' });
        } else {
            res.status(500).json({ error: 'Failed to get a complete prediction.' });
        }
    }
});

app.listen(PORT, () => {
    console.log(`Node.js server running at http://localhost:${PORT}`);
});