const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

// Python model endpoint (your classifier)
const PYTHON_API_URL = 'http://127.0.0.1:5000/predict';

// Ollama endpoint
const OLLAMA_API_URL = 'http://127.0.0.1:11434/api/generate';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// --- Main prediction route with streaming ---
app.post('/predict', async (req, res) => {
    try {
        const { news } = req.body;
        if (!news) {
            return res.status(400).json({ error: 'News text is required' });
        }

        // Step 1: Get prediction from Python classifier
        const initialPredictionResponse = await axios.post(PYTHON_API_URL, { news });
        const initialPrediction = initialPredictionResponse.data.prediction;

        // Step 2: Build prompt for explanation
        const prompt = `
            A news headline has been classified as "${initialPrediction}".
            The headline is: "${news}"

            Based on this classification, provide a brief, 2-3 sentence explanation for why this headline might be considered ${initialPrediction}.
            - If FAKE, focus on sensational language, emotional triggers, or unverifiable claims.
            - If REAL, focus on objective tone, factual language, and specific details.
            Do not question the initial classification. Just explain it.
        `;

        // Step 3: Set headers for streaming response
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Transfer-Encoding', 'chunked');

        // Send the prediction immediately
        res.write(JSON.stringify({ prediction: initialPrediction }) + "\n");

        // Step 4: Stream explanation from Ollama
        const ollamaResponse = await axios.post(
            OLLAMA_API_URL,
            {
                model: "tinyllama",
                prompt: prompt,
                stream: true
            },
            { responseType: 'stream' }
        );

        ollamaResponse.data.on('data', chunk => {
            try {
                const lines = chunk.toString().split("\n");
                for (const line of lines) {
                    if (line.trim() === "") continue;
                    const parsed = JSON.parse(line);
                    if (parsed.response) {
                        // Send each chunk progressively
                        res.write(JSON.stringify({ explanationChunk: parsed.response }) + "\n");
                    }
                }
            } catch (err) {
                console.error("Streaming parse error:", err.message);
            }
        });

        ollamaResponse.data.on('end', () => {
            res.end(); // close stream when done
        });

    } catch (error) {
        console.error('Error in /predict route:', error.message);
        if (error.code === 'ECONNREFUSED') {
            res.status(500).json({ error: 'Failed to connect to Ollama or Python API.' });
        } else {
            res.status(500).json({ error: 'Failed to get prediction/explanation.' });
        }
    }
});

// --- Start server ---
app.listen(PORT, () => {
    console.log(`Node.js server running at http://localhost:${PORT}`);
});
