import React, { useState } from 'react';

function Predictor() {
  const [inputType, setInputType] = useState('title');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePredict = async () => {
    if (inputText.trim() === '') {
      setResult({ prediction: 'Please enter a title or URL.', className: 'fake' });
      return;
    }
    setIsLoading(true);
    setResult(null);
    setExplanation('');

    try {
      const response = await fetch('http://localhost:3000/predict',{
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: inputText, type: inputType }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server responded with status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.prediction && data.confidence) {
              setResult({
                prediction: data.prediction,
                confidence: data.confidence,
                className: data.prediction === 'Real News' ? 'real' : 'fake'
              });
            }
            if (data.explanationChunk) {
              setExplanation(prev => prev + data.explanationChunk);
            }
          } catch (e) {
            console.error("Failed to parse JSON line:", line);
          }
        }
      }
    } catch (error) {
      setResult({ prediction: error.message, className: 'fake' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClear = () => {
    setInputText('');
    setResult(null);
    setExplanation('');
  }

  return (
    <div className="page-wrapper">
      <div className="main-content">
        <div className="container">
          <h1>Fake News Predictor</h1>
          <p>Enter the title of a news article or the article's URL to check if it's real or fake.</p>

          <div className="input-type-selector">
            <label>
              <input type="radio" name="inputType" value="title" checked={inputType === 'title'} onChange={() => setInputType('title')} />
              <span>Title</span>
            </label>
            <label>
              <input type="radio" name="inputType" value="url" checked={inputType === 'url'} onChange={() => setInputType('url')} />
              <span>URL</span>
            </label>
          </div>

          <textarea id="newsText" value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={`Enter ${inputType === 'title' ? 'news title' : 'article URL'} here...`}></textarea>

          <div className="button-group">
            <button id="predictBtn" onClick={handlePredict} disabled={isLoading}>{isLoading ? 'Analyzing...' : 'Predict'}</button>
            <button id="clearBtn" onClick={handleClear}>Clear</button>
          </div>

          <div id="result-container">
            {result && <div id="result" className={result.className}>{result.prediction}</div>}
            {explanation && <div id="explanation">{explanation}</div>}
          </div>
        </div>
      </div>

      {result && result.confidence && (
        <div id="confidence-chart-container">
          <h3>Confidence</h3>
          <div className="chart-vertical-bar-wrapper">
            <div className="chart-bar vertical">
              <div id="fake-bar" className="bar-fill fake-bar" style={{ height: `${result.prediction === 'Fake News' ? result.confidence * 100 : (1 - result.confidence) * 100}%` }}></div>
              <div id="real-bar" className="bar-fill real-bar" style={{ height: `${result.prediction === 'Real News' ? result.confidence * 100 : (1 - result.confidence) * 100}%` }}></div>
            </div>
          </div>
          <div className="chart-labels">
            <div className="label-group">
              <span className="dot fake-dot"></span>
              <span>Fake: <b id="fake-percent">{`${(result.prediction === 'Fake News' ? result.confidence * 100 : (1 - result.confidence) * 100).toFixed(1)}%`}</b></span>
            </div>
            <div className="label-group">
              <span className="dot real-dot"></span>
              <span>Real: <b id="real-percent">{`${(result.prediction === 'Real News' ? result.confidence * 100 : (1 - result.confidence) * 100).toFixed(1)}%`}</b></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Predictor;