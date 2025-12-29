import { useState } from 'react';
import './App.css';

function App() {
  const [prompt, setPrompt] = useState('Deep-sea city with merfolk and submerged ruins, channeling underwater fantasy anime.');
  const [batchSize, setBatchSize] = useState(1);
  const [numImages, setNumImages] = useState(1);
  const [resolution, setResolution] = useState('1K');
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  const API_TOKEN = process.env.REACT_APP_KREA_API_TOKEN;

  const generateImage = async () => {
    if (!API_TOKEN || API_TOKEN === 'your_token_here') {
      setError('Please set your Krea AI API token in the .env file');
      return;
    }

    setLoading(true);
    setError(null);
    setImageUrl(null);
    setStatus('Generating...');

    try {
      const options = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          batchSize: batchSize,
          numImages: numImages,
          resolution: resolution
        })
      };

      const response = await fetch('https://api.krea.ai/generate/image/google/nano-banana-pro', options);
      const data = await response.json();

      if (data.job_id) {
        setJobId(data.job_id);
        setStatus(`Job created: ${data.status}`);
        pollJobStatus(data.job_id);
      } else {
        throw new Error('Failed to create job');
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  const pollJobStatus = async (id) => {
    const maxAttempts = 60; // Poll for up to 5 minutes (60 * 5 seconds)
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const options = {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${API_TOKEN}`
          }
        };

        const response = await fetch(`https://api.krea.ai/jobs/${id}`, options);
        const data = await response.json();

        setStatus(`Status: ${data.status}`);

        if (data.status === 'completed') {
          if (data.result && data.result.urls && data.result.urls.length > 0) {
            setImageUrl(data.result.urls[0]);
            setStatus('Completed!');
          } else {
            setError('Job completed but no image URL found');
          }
          setLoading(false);
        } else if (data.status === 'failed') {
          setError('Job failed');
          setLoading(false);
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 5000); // Poll every 5 seconds
          } else {
            setError('Timeout: Job took too long to complete');
            setLoading(false);
          }
        }
      } catch (err) {
        setError(`Error checking status: ${err.message}`);
        setLoading(false);
      }
    };

    checkStatus();
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Krea AI Image Generator</h1>
        
        <div className="form-group">
          <label htmlFor="prompt">Prompt:</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the image you want to generate..."
            rows="4"
            disabled={loading}
          />
        </div>

        <div className="settings-row">
          <div className="form-group">
            <label htmlFor="batchSize">Batch Size:</label>
            <input
              type="number"
              id="batchSize"
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value))}
              min="1"
              max="10"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="numImages">Number of Images:</label>
            <input
              type="number"
              id="numImages"
              value={numImages}
              onChange={(e) => setNumImages(parseInt(e.target.value))}
              min="1"
              max="10"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="resolution">Resolution:</label>
            <select
              id="resolution"
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
              disabled={loading}
            >
              <option value="1K">1K</option>
              <option value="2K">2K</option>
              <option value="4K">4K</option>
            </select>
          </div>
        </div>

        <button 
          onClick={generateImage} 
          disabled={loading || !prompt}
          className="generate-button"
        >
          {loading ? 'Generating...' : 'Generate Image'}
        </button>

        {status && (
          <div className="status-message">
            <p>{status}</p>
            {jobId && <p className="job-id">Job ID: {jobId}</p>}
          </div>
        )}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        )}

        {imageUrl && (
          <div className="image-container">
            <h2>Generated Image</h2>
            <img src={imageUrl} alt="Generated by Krea AI" />
            <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="download-link">
              Open Full Size
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
