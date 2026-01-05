import React, { useState } from 'react';
import './ImageGenerator.css';

function ImageGenerator({ apiToken, setShowApiKeyInput }) {
  const [prompt, setPrompt] = useState('Deep-sea city with merfolk and submerged ruins, channeling underwater fantasy anime.');
  const [numImages, setNumImages] = useState(1);
  const [resolution, setResolution] = useState('1K');
  const [loading, setLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('');
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  const generateImage = async () => {
    if (!apiToken || apiToken === 'your_token_here') {
      setError('Please enter your Krea AI API token');
      setShowApiKeyInput(true);
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
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          batchSize: 1,
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
    const maxAttempts = 60;
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const options = {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiToken}`
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
            setTimeout(checkStatus, 5000);
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
    <div className="tab-content">
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
  );
}

export default ImageGenerator;
