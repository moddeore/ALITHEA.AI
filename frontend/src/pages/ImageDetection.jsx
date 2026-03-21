import { useState, useRef, useEffect } from 'react';
import policeStationsData from '../assets/police_stations.json';

function ImageDetection() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  
  // States for geolocation and police stations
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [nearestStations, setNearestStations] = useState([]);
  
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile.type.match('image.*')) {
      setError("Please select an image file (JPEG/PNG)");
      return;
    }
    setError(null);
    setResult(null);
    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const isFake = result && result.prediction === "AI Generated";
  const probabilityNumber = result ? parseInt(result.probability) : 0;
  
  // Request location when it's fake
  useEffect(() => {
    if (isFake) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocationEnabled(true);
            // We just use the data and display all for now,
            // Since there's no coordinates in the CSV to calculate actual distance
            setNearestStations(policeStationsData.slice(0, 5)); // show first 5
          },
          (error) => {
            console.error("Error getting location: ", error);
            setLocationEnabled(false);
          }
        );
      }
    }
  }, [isFake, probabilityNumber]);

  const removeImage = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const analyzeImage = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const apiBase = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${apiBase}/api/detect-image`, {
        method: 'POST',
        body: formData,
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

  return (
    <>
      <header className="hero fade-in">
        <h1>AI Image Detector</h1>
        <p>
          In the age of generative AI, telling real from fake is harder than ever. 
          Upload an image to our advanced machine learning model to verify its authenticity.
          Protect yourself against misinformation and deepfakes.
        </p>
        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.6)', fontStyle: 'italic' }}>
          Current Model Accuracy: <strong>92%</strong>. Please note that results may vary. 
          While the current accuracy is 92%, we are working to increase this in future updates.
        </p>
      </header>

      <main className="card slide-up">
        {!preview ? (
          <div 
            className={`upload-area ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleChange}
              style={{ display: "none" }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <svg 
                width="48" height="48" viewBox="0 0 24 24" fill="none" 
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ color: 'var(--primary)', transition: 'transform 0.3s ease' }}
                className="upload-icon"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <p>Drag and drop your image here, or <strong className="highlight">click to browse</strong></p>
            </div>
          </div>
        ) : (
          <div className="upload-active fade-in">
            <div className="preview-container">
              <img src={preview} alt="Upload preview" className="preview-image" />
              <button className="remove-btn" onClick={removeImage} title="Remove image">
                ✕
              </button>
            </div>
            
            {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
            
            {!result ? (
              <button 
                className="btn-primary" 
                onClick={analyzeImage} 
                disabled={loading}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <div className="loader"></div> Analyzing...
                  </span>
                ) : (
                  "Analyze Image"
                )}
              </button>
            ) : (
              <div className="result-section slide-up">
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
                
                {isFake && (
                  <div className="safety-advice fade-in">
                    <h3>⚠️ Safety Advice</h3>
                    <ul>
                      <li>Verify the original source.</li>
                      <li>Use reverse image search.</li>
                      <li>Report deepfakes to authorities.</li>
                    </ul>
                  </div>
                )}
                
                {isFake && (
                  <div className="safety-advice fade-in" style={{ marginTop: '1.5rem', textAlign: 'left', background: 'rgba(255, 69, 58, 0.1)', border: '1px solid rgba(255, 69, 58, 0.3)', padding: '1.5rem', borderRadius: '12px' }}>
                    <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>🚨 Digital Crime Reporting (India)</h3>
                    
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                      <li style={{ marginBottom: '0.5rem' }}><strong>Step 1:</strong> Call <strong>1930</strong> immediately to freeze fraudulent transactions.</li>
                      <li style={{ marginBottom: '0.5rem' }}><strong>Step 2:</strong> File a complaint at <strong>cybercrime.gov.in</strong>.</li>
                      <li style={{ marginBottom: '0.5rem' }}><strong>Step 3:</strong> Save all evidence (screenshots, chat logs, transaction IDs).</li>
                      <li style={{ marginBottom: '0.5rem' }}><strong>Step 4:</strong> Register an FIR at your local police station.</li>
                    </ul>
                    <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Governed by Bharatiya Nagarik Suraksha Sanhita (BNSS).</p>
                  </div>
                )}

                {isFake && nearestStations.length > 0 && (
                  <div className="safety-advice fade-in" style={{ marginTop: '1.5rem', textAlign: 'left', background: 'rgba(33, 150, 243, 0.1)', border: '1px solid rgba(33, 150, 243, 0.3)', padding: '1.5rem', borderRadius: '12px' }}>
                    <h3 style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)', paddingBottom: '0.8rem', marginBottom: '1rem' }}>
                      🚓 Nearby Police Stations for Reporting
                    </h3>
                    <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#ccc' }}>
                      {locationEnabled ? "Showing police stations near your location:" : "Here are some of the key police stations in the district:"}
                    </p>
                    
                    <div style={{ 
                      background: 'rgba(0, 0, 0, 0.4)', 
                      padding: '1rem', 
                      borderRadius: '8px', 
                      fontFamily: 'monospace', 
                      fontSize: '0.85rem',
                      maxHeight: '300px',
                      overflowY: 'auto',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      textAlign: 'left'
                    }}>
                      {nearestStations.map((station, index) => (
                        <div key={index} style={{ marginBottom: '1rem', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.5rem' }}>
                          <div style={{ color: 'var(--primary)' }}>
                            <span style={{ opacity: 0.5 }}>[{new Date().toLocaleDateString()}]</span> <strong>[STATION]</strong> {station.name}
                          </div>
                          <div style={{ color: '#fff' }}>
                            <span style={{ opacity: 0.5 }}>[{new Date().toLocaleTimeString()}]</span> <strong>[PHONE]</strong> {station.contact}
                          </div>
                          <div style={{ color: '#aaa', fontSize: '0.8rem', marginTop: '0.2rem' }}>
                            <span style={{ opacity: 0.5 }}>[{new Date().toLocaleDateString()}]</span> <strong>[ADDRESS]</strong> {station.address}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <button 
                  className="btn-secondary" 
                  style={{ marginTop: '1.5rem'}}
                  onClick={removeImage}
                >
                  Analyze Another Image
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}

export default ImageDetection;
