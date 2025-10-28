// client/src/components/History.jsx - FINAL CORRECTED VERSION

import React, { useState, useEffect } from 'react';
import './History.css';

function History() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      const response = await fetch('/history', {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok) {
          setHistory(data);
      }
    };
    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to delete your entire prediction history? This action cannot be undone.')) {
        try {
            const response = await fetch('/history/clear', {
                method: 'DELETE',
                credentials: 'include'
            });

            if (response.ok) {
                setHistory([]); // Immediately clear the history in the UI
            } else {
                alert('Failed to clear history. Please try again.');
            }
        } catch (error) {
            console.error('Error clearing history:', error);
            alert('An error occurred while clearing history.');
        }
    }
  };

  return (
    <div className="container history-page-container">
      <div className="history-header">
        <h1>Prediction History</h1>
        <button 
            onClick={handleClearHistory} 
            className="clear-history-btn"
            disabled={history.length === 0}
        >
            Clear History
        </button>
      </div>
      
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
          {history.length > 0 ? (
            history.map(item => (
              <tr key={item.id}>
                <td>{item.headline}</td>
                <td className={item.prediction === 'Real News' ? 'real' : 'fake'}>{item.prediction}</td>
                <td>{`${(item.confidence * 100).toFixed(1)}%`}</td>
                <td>{new Date(item.timestamp).toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" style={{ textAlign: 'center' }}>Your history is empty.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default History;