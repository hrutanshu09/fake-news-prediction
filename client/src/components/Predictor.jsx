import React, { useState, useEffect } from 'react';

function Predictor() {
  const [inputType, setInputType] = useState('title');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [explanation, setExplanation] = useState(''); // State for the explanation
  const [isLoading, setIsLoading] = useState(false);

  const getExplanation = async (headline, prediction) => {
    const response = await fetch('http://localhost:3000/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ headline, prediction }),
        credentials: 'include'
    });

    if (!response.body) return;
    const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
    
    // Read the stream and update the explanation state
    while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        setExplanation((prev) => prev + value);
    }
  };

  const handlePredict = async () => {
    if (!inputText.trim()) {
        setResult({ prediction: "Please enter a title or URL.", confidence: 0 });
        return;
    }
    setIsLoading(true);
    setResult(null);
    setExplanation(''); // Clear previous explanation

    try {
      const response = await fetch('http://localhost:3000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputText, type: inputType }),
        credentials: 'include'
      });

      const data = await response.json();
      if (!response.ok) {
          throw new Error(data.message || 'An error occurred.');
      }
      setResult(data);
      // After getting the prediction, get the explanation
      getExplanation(data.headline, data.prediction);

    } catch (error) {
        setResult({ prediction: error.message, confidence: 0 });
    } finally {
        setIsLoading(false);
    }
  };

  const handleClear = () => {
      setInputText('');
      setResult(null);
      setExplanation('');
  }

  const fakePercent = result ? (result.prediction === 'Fake News' ? result.confidence * 100 : (1 - result.confidence) * 100) : 0;
  const realPercent = result ? 100 - fakePercent : 0;

  return (
    <div className="page-wrapper">
      <div className="main-content">
        <div className="container">
          <h1>Fake News Predictor</h1>
          <p>Enter a news headline or URL to check if it's real or fake.</p>
          
          <div className="input-type-selector">
              <label><input type="radio" name="inputType" value="title" checked={inputType === 'title'} onChange={() => setInputType('title')} /> Title</label>
              <label><input type="radio" name="inputType" value="url" checked={inputType === 'url'} onChange={() => setInputType('url')} /> URL</label>
          </div>

          <textarea value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder="Enter news title or URL here..."></textarea>
          
          <div className="button-group">
            <button onClick={handlePredict} disabled={isLoading}>
              {isLoading ? 'Analyzing...' : 'Predict'}
            </button>
            <button onClick={handleClear}>Clear</button>
          </div>
          
          <div id="result-container">
            {result && (
              <div id="result" className={result.prediction === 'Real News' ? 'real' : 'fake'}>
                {result.prediction}
              </div>
            )}
            {/* --- NEW: Explanation Display --- */}
            {explanation && (
                <div id="explanation" className="explanation-box">
                    <p>{explanation}</p>
                </div>
            )}
          </div>
        </div>
      </div>

      {result && (
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
      )}
    </div>
  );
}

export default Predictor;