import React, { useState } from 'react';
import './Predictor.css';

// Helper function to create a delay
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function Predictor() {
  const [inputType, setInputType] = useState('title');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTypeChange = (newType) => {
    setInputType(newType);
    setInputText('');
    setResult(null);
    setError('');
    setExplanation('');
  };

  const getExplanation = async (headline, prediction) => {
    const response = await fetch('/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline, prediction }),
        credentials: 'include'
    });

    if (!response.body) return;
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    
    // Read the stream and apply the typewriter effect
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        // Process each chunk character by character with a delay
        for (const char of value) {
            setExplanation((prev) => prev + char);
            await sleep(30); // Adjust this value to control typing speed (e.g., 50 for slower, 20 for faster)
        }
    }
  };

  const handlePredict = async () => {
    if (!inputText.trim()) {
        setError("Please enter a title or URL.");
        return;
    }
    setIsLoading(true);
    setResult(null);
    setExplanation('');
    setError('');

    try {
      const response = await fetch(`/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputText, type: inputType }),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) {
          throw new Error(data.error || 'An unknown error occurred.');
      }
      setResult(data);
      getExplanation(data.headline, data.prediction);
    } catch (err) {
        console.error("Prediction error:", err);
        setError(err.message);
    } finally {
        setIsLoading(false);
    }
  };

  const handleClear = () => {
     setInputText('');
     setResult(null);
     setExplanation('');
     setError('');
  };
  
  const fakePercent = result && !error ? (result.prediction === 'Fake News' ? result.confidence * 100 : (1 - result.confidence) * 100) : 0;
  const realPercent = result && !error ? 100 - fakePercent : 0;

  return (
    <div className="page-wrapper predictor-page-container">
      <div className="main-content">
        <div className="container">
          <h1>Fake News Predictor</h1>
          <p>Enter a news headline or URL to check if it's real or fake.</p>
          
          <div className="toggle-switch">
            <div className={`slider ${inputType === 'url' ? 'url' : 'title'}`}></div>
            <button 
              className={`toggle-btn ${inputType === 'title' ? 'active' : ''}`} 
              onClick={() => handleTypeChange('title')}
            >
              Title
            </button>
            <button 
              className={`toggle-btn ${inputType === 'url' ? 'active' : ''}`} 
              onClick={() => handleTypeChange('url')}
            >
              URL
            </button>
          </div>

          <textarea 
            value={inputText} 
            onChange={(e) => setInputText(e.target.value)} 
            placeholder={`Enter news ${inputType === 'title' ? 'title' : 'url'} here...`}
          ></textarea>
          
          <div className="button-group">
            <button onClick={handlePredict} disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Predict'}
            </button>
            <button onClick={handleClear}>Clear</button>
          </div>
          
          <div id="result-container">
            {error && <div id="result" className="fake">{error}</div>}
            {result && !error && <div id="result" className={result.prediction === 'Real News' ? 'real' : 'fake'}>{result.prediction}</div>}
            {explanation && !error && <div id="explanation" className="explanation-box"><p>{explanation}</p></div>}
          </div>
        </div>
      </div>

      <div id="confidence-chart-container">
          <h3>Confidence</h3>
          <div className="chart-vertical-bar-wrapper">
            <div className="chart-bar vertical">
              <div id="fake-bar" className="bar-fill fake-bar" style={{ height: `${fakePercent}%` }}></div>
              <div id="real-bar" className="bar-fill real-bar" style={{ height: `${realPercent}%` }}></div>
            </div>
          </div>
          <div className="chart-labels">
            <div className="label-group">
              <span className="dot fake-dot"></span>
              <span>Fake: <b id="fake-percent">{fakePercent.toFixed(1)}%</b></span>
            </div>
            <div className="label-group">
              <span className="dot real-dot"></span>
              <span>Real: <b id="real-percent">{realPercent.toFixed(1)}%</b></span>
            </div>
          </div>
        </div>
    </div>
  );
}

export default Predictor;