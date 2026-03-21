import { useState } from 'react';

function TextDetection() {
  const [text, setText] = useState('');
  const [modelType, setModelType] = useState('unigram');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyzeText = async () => {
    if (!text.trim()) {
      setError("Please enter some text to analyze.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      const apiBase = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiBase}/api/detect-text`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text, model: modelType }),
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      
      setResult(data);
    } catch (err) {
      setError(err.message || 'Error connecting to the server. Is the backend running?');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isFake = result && result.prediction === "AI Generated Content";
  const probabilityNumber = result ? parseInt(result.probability) : 0;

  return (
    <>
      <header className="hero fade-in">
        <h1>AI Text Detector</h1>
        <p>
          Detect whether an article, essay, or snippet was written by a human or an AI. 
          Use our NLP-powered models to flag synthetical texts quickly.
        </p>
      </header>

      <main className="card slide-up">
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <textarea 
            style={{ 
              width: '100%', 
              minHeight: '200px', 
              padding: '1rem', 
              borderRadius: '8px',
              border: '2px solid var(--border)',
              backgroundColor: 'var(--card-bg)',
              color: 'var(--text)',
              fontSize: '1rem',
              resize: 'vertical'
            }}
            placeholder="Paste your text here (at least a few sentences for best results)..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="model-select" style={{ fontWeight: 600 }}>Model:</label>
              <select 
                id="model-select"
                value={modelType}
                onChange={(e) => setModelType(e.target.value)}
                style={{
                  padding: '0.5rem',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--card-bg)',
                  color: 'var(--text)'
                }}
              >
                <option value="unigram">Unigram (Fast & Broad)</option>
                <option value="bigram">Bigram (Detailed Context)</option>
              </select>
            </div>
            
            <button 
              className="btn-primary" 
              onClick={analyzeText} 
              disabled={loading || !text.trim()}
              style={{ width: 'auto', padding: '0.8rem 2rem' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                  <div className="loader" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></div> Analyzing...
                </span>
              ) : (
                "Analyze Text"
              )}
            </button>
          </div>
        </div>

        {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem', padding: '1rem', backgroundColor: 'var(--danger-glow)', borderRadius: '8px' }}>{error}</div>}

        {result && (
          <div className="result-section slide-up" style={{ marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
            <div className={`result-badge ${isFake ? 'fake' : 'real'}`}>
              {result.prediction}
            </div>
            
            <h2>{result.probability} Confidence</h2>
            
            <div className="progress-bar-container">
              <div 
                className={`progress-bar ${isFake ? 'fake' : 'real'}`} 
                style={{ width: `${probabilityNumber}%` }}
              ></div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export default TextDetection;
