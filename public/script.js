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
    const inputTypeRadios = document.querySelectorAll('input[name="inputType"]');
    const errorModal = document.getElementById('error-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalMessage = document.getElementById('modal-message');

    let controller = null;

    if (errorModal) {
        errorModal.style.display = 'none';
    }

    if(closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            errorModal.style.display = 'none';
        });
    }

    // --- NEW: Auto-resize textarea function ---
    const autoResizeTextarea = () => {
        newsText.style.height = 'auto'; // Reset height to shrink if needed
        newsText.style.height = (newsText.scrollHeight) + 'px'; // Set to content height
    };

    // --- NEW: Add event listener for input ---
    newsText.addEventListener('input', autoResizeTextarea);


    inputTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'url') {
                newsText.placeholder = 'Enter article URL here... (e.g., https://...)';
            } else {
                newsText.placeholder = 'Enter news title here...';
            }
            newsText.value = '';
            // Trigger resize after clearing
            autoResizeTextarea();
        });
    });

    predictBtn.addEventListener('click', async function() {
        const inputText = newsText.value;
        if (inputText.trim() === '') {
            resultDiv.textContent = 'Please enter a title or URL.';
            resultDiv.className = 'fake';
            return;
        }

        if (controller) { controller.abort(); }
        controller = new AbortController();
        const signal = controller.signal;

        clearUI(true);
        resultDiv.textContent = 'Analyzing...';
        
        try {
            const selectedType = document.querySelector('input[name="inputType"]:checked').value;
            const response = await fetch('/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: inputText, type: selectedType }),
                signal: signal
            });

            if (!response.ok) {
                const errorData = await response.json();
                
                if (errorData.error && errorData.error.includes("legal or regional restrictions")) {
                    modalMessage.textContent = errorData.error + " Please switch to 'Title' mode and enter the headline manually.";
                    errorModal.style.display = 'flex';
                    resultDiv.textContent = ''; 
                    resultDiv.className = '';
                    return;
                }
                
                if (errorData.error && errorData.error.includes("Could not find a valid headline")) {
                    modalMessage.textContent = "Could not find a valid headline at that URL. Please try entering the title manually.";
                    errorModal.style.display = 'flex';
                    resultDiv.textContent = ''; 
                    resultDiv.className = '';
                    return;
                }

                throw new Error(errorData.error || `Server responded with status: ${response.status}`);
            }

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
            if (error.name === 'AbortError') {
                console.log('Fetch aborted.');
                return;
            }
            console.error('Error:', error);
            resultDiv.textContent = error.message;
            resultDiv.className = 'fake';
            clearUI(true);
        }
    });
    
    clearBtn.addEventListener('click', () => {
        if (controller) { controller.abort(); }
        clearUI(false);
        // Trigger resize after clearing
        autoResizeTextarea();
    });

    function clearUI(keepInput = false) {
        if (!keepInput) { newsText.value = ''; }
        resultDiv.textContent = '';
        explanationDiv.textContent = '';
        resultDiv.className = '';
        explanationDiv.classList.remove('typing');
        explanationDiv.classList.add('hidden');
        chartContainer.classList.add('hidden');
        if(fakeBar) fakeBar.style.height = '0%';
        if(realBar) realBar.style.height = '0%';
        if(fakePercent) fakePercent.textContent = '0%';
        if(realPercent) realPercent.textContent = '0%';
    }

    function updateChart(prediction, confidence) {
        const confidencePercent = confidence * 100;
        let fakeVal = 0, realVal = 0;
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