document.getElementById('predictBtn').addEventListener('click', async function() {
    const newsText = document.getElementById('newsText').value;
    const resultDiv = document.getElementById('result');
    const explanationDiv = document.getElementById('explanation');

    if (newsText.trim() === '') {
        resultDiv.textContent = 'Please enter some news text.';
        resultDiv.className = 'fake';
        explanationDiv.textContent = '';
        return;
    }

    resultDiv.textContent = 'Analyzing...';
    resultDiv.className = '';
    explanationDiv.textContent = '';

    const response = await fetch('/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ news: newsText })
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep last partial line

        for (const line of lines) {
            if (!line.trim()) continue;
            const data = JSON.parse(line);

            if (data.prediction) {
                resultDiv.textContent = data.prediction;
                resultDiv.className = (data.prediction === 'Real News') ? 'real' : 'fake';
            }

            if (data.explanationChunk) {
                // Character-by-character typing effect
                await typeEffectChars(explanationDiv, data.explanationChunk, 25); 
                // 25ms per character is faster than previous 30-40ms word-by-word
            }
        }
    }
});

// Character-by-character typing function
async function typeEffectChars(element, text, delay = 25) {
    for (let i = 0; i < text.length; i++) {
        element.textContent += text.charAt(i);
        await sleep(delay);
        element.scrollTop = element.scrollHeight; // auto scroll
    }
}

// Helper sleep function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
