document.getElementById('predictBtn').addEventListener('click', function() {
    const newsText = document.getElementById('newsText').value;
    const resultDiv = document.getElementById('result');

    if (newsText.trim() === '') {
        resultDiv.textContent = 'Please enter some news text.';
        resultDiv.className = 'fake';
        return;
    }

    resultDiv.textContent = 'Analyzing...';
    resultDiv.className = '';

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
            resultDiv.textContent = data.prediction;
            if (data.prediction === 'Real News') {
                resultDiv.className = 'real';
            } else {
                resultDiv.className = 'fake';
            }
        } else {
            resultDiv.textContent = 'Error: ' + (data.error || 'Unknown error');
            resultDiv.className = 'fake';
        }
    })
    .catch(error => {
        console.error('Error:', error);
        resultDiv.textContent = 'An error occurred while making the prediction.';
        resultDiv.className = 'fake';
    });
});