document.addEventListener('DOMContentLoaded', () => {
    const predictBtn = document.getElementById('predictBtn');
    const clearBtn = document.getElementById('clearBtn');
    const newsText = document.getElementById('newsText');
    const resultDiv = document.getElementById('result');
    const explanationDiv = document.getElementById('explanation');
    const chartContainer = document.getElementById('confidence-chart-container');
    const fakeBar = document.getElementById('fake-bar');
    const realBar = document.getElementById('real-bar');
    const fakePercent = document.getElementById('fake-percent');
    const realPercent = document.getElementById('real-percent');

    // --- NEW: Holds the controller for the current fetch request ---
    let controller = null;

    // Hide elements on page load
    explanationDiv.classList.add('hidden');
    chartContainer.classList.add('hidden');

    predictBtn.addEventListener('click', async function() {
        if (newsText.value.trim() === '') {
            resultDiv.textContent = 'Please enter some news text.';
            resultDiv.className = 'fake';
            return;
        }

        // --- NEW: Abort any previous request before starting a new one ---
        if (controller) {
            controller.abort();
        }
        // Create a new controller for the new request
        controller = new AbortController();
        const signal = controller.signal;

        clearUI(true); 
        resultDiv.textContent = 'Analyzing...';
        
        try {
            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ news: newsText.value }),
                signal: signal // --- Pass the signal to the fetch request ---
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    explanationDiv.classList.remove('typing');
                    break;
                }

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop();

                for (const line of lines) {
                    if (!line.trim()) continue;
                    try {
                        const data = JSON.parse(line);
                        
                        if (data.prediction && data.confidence) {
                            resultDiv.textContent = data.prediction;
                            resultDiv.className = (data.prediction === 'Real News') ? 'real' : 'fake';
                            updateChart(data.prediction, data.confidence);
                        }

                        if (data.explanationChunk) {
                            explanationDiv.classList.remove('hidden'); 
                            explanationDiv.classList.add('typing');
                            await typeEffectChars(explanationDiv, data.explanationChunk, 15);
                        }
                    } catch (e) {
                        console.error("Failed to parse JSON line:", line);
                    }
                }
            }
        } catch (error) {
            // --- NEW: Gracefully handle the abort error ---
            if (error.name === 'AbortError') {
                console.log('Fetch aborted.');
                // The UI is already cleared, so we just stop.
                return;
            }
            console.error('Error:', error);
            resultDiv.textContent = 'An error occurred. Check the server logs.';
            resultDiv.className = 'fake';
            clearUI();
        }
    });
    
    clearBtn.addEventListener('click', () => {
        // --- NEW: Abort the fetch request when clearing ---
        if (controller) {
            controller.abort();
        }
        clearUI(false);
    });

    function clearUI(keepInput = false) {
        if (!keepInput) {
            newsText.value = '';
        }
        resultDiv.textContent = '';
        explanationDiv.textContent = '';
        resultDiv.className = '';
        explanationDiv.classList.remove('typing');
        explanationDiv.classList.add('hidden');
        
        chartContainer.classList.add('hidden');
        fakeBar.style.height = '0%';
        realBar.style.height = '0%';
        fakePercent.textContent = '0%';
        realPercent.textContent = '0%';
    }

    function updateChart(prediction, confidence) {
        const confidencePercent = confidence * 100;
        let fakeVal = 0;
        let realVal = 0;

        if (prediction === 'Fake News') {
            fakeVal = confidencePercent;
            realVal = 100 - confidencePercent;
        } else {
            realVal = confidencePercent;
            fakeVal = 100 - confidencePercent;
        }

        fakeBar.style.height = `${fakeVal}%`;
        realBar.style.height = `${realVal}%`;
        fakePercent.textContent = `${fakeVal.toFixed(1)}%`;
        realPercent.textContent = `${realVal.toFixed(1)}%`;
        
        chartContainer.classList.remove('hidden');
    }
});

async function typeEffectChars(element, text, delay = 15) {
    for (let i = 0; i < text.length; i++) {
        element.textContent += text.charAt(i);
        await sleep(delay);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}