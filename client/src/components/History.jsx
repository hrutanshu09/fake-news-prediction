import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('http://localhost:3000/history');
        const data = await response.json();
        setHistory(data);
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="container history-container">
      <h1>Prediction History</h1>
      <Link to="/predictor" className="back-link">← Back to Predictor</Link>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Headline</th>
              <th>Prediction</th>
              <th>Confidence</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4">Loading history...</td></tr>
            ) : history.length > 0 ? (
              history.map(item => (
                <tr key={item.id}>
                  <td>{item.headline}</td>
                  <td className={item.prediction === 'Real News' ? 'real' : 'fake'}>{item.prediction}</td>
                  <td>{`${(item.confidence * 100).toFixed(1)}%`}</td>
                  <td>{new Date(item.timestamp).toLocaleString()}</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4">No history found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default History;