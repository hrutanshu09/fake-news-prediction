import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const response = await fetch('http://localhost:3000/history', {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
          setHistory(data);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="container">
      <h1>Prediction History</h1>
      <Link to="/predictor">← Back to Predictor</Link>
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
          {history.map(item => (
            <tr key={item.id}>
              <td>{item.headline}</td>
              <td className={item.prediction === 'Real News' ? 'real' : 'fake'}>{item.prediction}</td>
              <td>{`${(item.confidence * 100).toFixed(1)}%`}</td>
              <td>{new Date(item.timestamp).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default History;