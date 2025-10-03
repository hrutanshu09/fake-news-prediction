document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('history-table-body');

    fetch('/history')
        .then(response => response.json())
        .then(data => {
            if (data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="4">No history found.</td></tr>';
                return;
            }

            // Clear loading state
            tableBody.innerHTML = '';

            data.forEach(item => {
                const row = document.createElement('tr');

                const headlineCell = document.createElement('td');
                headlineCell.textContent = item.headline;

                const predictionCell = document.createElement('td');
                predictionCell.textContent = item.prediction;
                predictionCell.className = item.prediction === 'Real News' ? 'real' : 'fake';

                const confidenceCell = document.createElement('td');
                confidenceCell.textContent = `${(item.confidence * 100).toFixed(1)}%`;
                
                const dateCell = document.createElement('td');
                dateCell.textContent = new Date(item.timestamp).toLocaleString();

                row.appendChild(headlineCell);
                row.appendChild(predictionCell);
                row.appendChild(confidenceCell);
                row.appendChild(dateCell);

                tableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error('Error fetching history:', error);
            tableBody.innerHTML = '<tr><td colspan="4">Error loading history.</td></tr>';
        });
});