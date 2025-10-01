document.getElementById('predictBtn').addEventListener('click', function() {
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

    fetch('/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ news: newsText })
    })
    .then(response => response.json())
    .then(data => {
        if (data.prediction) {
            // Display the initial prediction
            resultDiv.textContent = data.prediction;
            resultDiv.className = (data.prediction === 'Real News') ? 'real' : 'fake';

            // Display the LLM's explanation
            explanationDiv.textContent = data.explanation;
        } else {
            resultDiv.textContent = 'Error: ' + (data.error || 'Unknown error');
            resultDiv.className = 'fake';
            explanationDiv.textContent = '';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        resultDiv.textContent = 'An error occurred. Check the server logs.';
        resultDiv.className = 'fake';
        explanationDiv.textContent = '';
    });
});