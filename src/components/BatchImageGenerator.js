import React, { useState } from 'react';
import './BatchImageGenerator.css';

function BatchImageGenerator({ apiToken, setShowApiKeyInput }) {
  const [promptsList, setPromptsList] = useState('');
  const [resolution, setResolution] = useState('1K');
  const [width, setWidth] = useState(1024);
  const [height, setHeight] = useState(1024);
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [generatedImages, setGeneratedImages] = useState([]);
  const [error, setError] = useState(null);
  const [overallStatus, setOverallStatus] = useState('');

  // Aspect ratio presets
  const aspectRatioPresets = {
    '1:1': { width: 1024, height: 1024 },
    '4:3': { width: 1024, height: 768 },
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    'custom': { width: width, height: height }
  };

  const handleAspectRatioChange = (ratio) => {
    setAspectRatio(ratio);
    if (ratio !== 'custom') {
      setWidth(aspectRatioPresets[ratio].width);
      setHeight(aspectRatioPresets[ratio].height);
    }
  };

  const parsePrompts = (text) => {
    return text
      .split(',')
      .map(p => p.trim())
      .filter(p => p.length > 0);
  };

  const generateBatchImages = async () => {
    if (!apiToken || apiToken === 'your_token_here') {
      setError('Please enter your Krea AI API token');
      setShowApiKeyInput(true);
      return;
    }

    const prompts = parsePrompts(promptsList);
    
    if (prompts.length === 0) {
      setError('Please enter at least one prompt');
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedImages([]);
    setJobs([]);
    setOverallStatus(`Starting generation of ${prompts.length} image(s)...`);

    const jobsArray = [];

    try {
      // Create jobs for all prompts
      for (let i = 0; i < prompts.length; i++) {
        const prompt = prompts[i];
        setOverallStatus(`Creating job ${i + 1}/${prompts.length}: "${prompt.substring(0, 50)}..."`);

        const options = {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            prompt: prompt,
            batchSize: 1,
            numImages: 1,
            resolution: resolution,
            width: width,
            height: height
          })
        };

        const response = await fetch('https://api.krea.ai/generate/image/google/nano-banana-pro', options);
        const data = await response.json();

        if (data.job_id) {
          jobsArray.push({
            id: data.job_id,
            prompt: prompt,
            status: data.status,
            imageUrl: null,
            error: null
          });
        } else {
          jobsArray.push({
            id: null,
            prompt: prompt,
            status: 'failed',
            imageUrl: null,
            error: 'Failed to create job'
          });
        }
      }

      setJobs(jobsArray);
      setOverallStatus(`${prompts.length} jobs created. Checking status...`);
      
      // Poll all jobs
      pollAllJobs(jobsArray);

    } catch (err) {
      setError(`Error: ${err.message}`);
      setLoading(false);
    }
  };

  const pollAllJobs = async (jobsArray) => {
    const maxAttempts = 60;
    let attempts = 0;
    let completedCount = 0;

    const checkAllJobs = async () => {
      attempts++;
      const updatedJobs = [];
      let allCompleted = true;

      for (const job of jobsArray) {
        if (!job.id || job.status === 'completed' || job.status === 'failed') {
          updatedJobs.push(job);
          if (job.status === 'completed') completedCount++;
          continue;
        }

        try {
          const options = {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${apiToken}`
            }
          };

          const response = await fetch(`https://api.krea.ai/jobs/${job.id}`, options);
          const data = await response.json();

          if (data.status === 'completed') {
            if (data.result && data.result.urls && data.result.urls.length > 0) {
              updatedJobs.push({
                ...job,
                status: 'completed',
                imageUrl: data.result.urls[0]
              });
              completedCount++;
            } else {
              updatedJobs.push({
                ...job,
                status: 'failed',
                error: 'No image URL found'
              });
            }
          } else if (data.status === 'failed') {
            updatedJobs.push({
              ...job,
              status: 'failed',
              error: 'Job failed'
            });
          } else {
            updatedJobs.push({
              ...job,
              status: data.status
            });
            allCompleted = false;
          }
        } catch (err) {
          updatedJobs.push({
            ...job,
            status: 'error',
            error: err.message
          });
        }
      }

      setJobs(updatedJobs);
      setOverallStatus(`Completed: ${completedCount}/${jobsArray.length}`);

      // Extract completed images
      const completed = updatedJobs.filter(j => j.status === 'completed' && j.imageUrl);
      setGeneratedImages(completed);

      if (allCompleted) {
        setLoading(false);
        setOverallStatus(`Process completed! ${completedCount}/${jobsArray.length} images generated.`);
      } else if (attempts < maxAttempts) {
        setTimeout(checkAllJobs, 5000);
      } else {
        setLoading(false);
        setError('Timeout: Some jobs took too long');
        setOverallStatus(`Timeout reached. ${completedCount}/${jobsArray.length} completed.`);
      }
    };

    checkAllJobs();
  };

  const downloadAllImages = () => {
    generatedImages.forEach((img, index) => {
      const link = document.createElement('a');
      link.href = img.imageUrl;
      link.download = `image_${index + 1}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  return (
    <div className="tab-content">
      <div className="batch-header">
        <h2>🎨 Batch Image Generation</h2>
        <p className="batch-description">
          Generate multiple images with different prompts using the same parameters.
        </p>
      </div>

      <div className="form-group">
        <label htmlFor="promptsList">
          Prompt List (comma separated):
        </label>
        <textarea
          id="promptsList"
          value={promptsList}
          onChange={(e) => setPromptsList(e.target.value)}
          placeholder="prompt1, prompt2, prompt3..."
          rows="6"
          disabled={loading}
          className="prompts-textarea"
        />
        <p className="helper-text">
          📝 {parsePrompts(promptsList).length} prompt(s) detected
        </p>
      </div>

      <div className="batch-params-section">
        <h3>Shared Parameters</h3>
        
        <div className="settings-row">
          <div className="form-group">
            <label htmlFor="aspectRatio">Aspect Ratio:</label>
            <select
              id="aspectRatio"
              value={aspectRatio}
              onChange={(e) => handleAspectRatioChange(e.target.value)}
              disabled={loading}
            >
              <option value="1:1">1:1 (Square)</option>
              <option value="4:3">4:3 (Standard)</option>
              <option value="16:9">16:9 (Widescreen)</option>
              <option value="9:16">9:16 (Vertical)</option>
              <option value="custom">Custom</option>
            </select>
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

        <div className="settings-row">
          <div className="form-group">
            <label htmlFor="width">Width (px):</label>
            <input
              type="number"
              id="width"
              value={width}
              onChange={(e) => {
                setWidth(parseInt(e.target.value));
                setAspectRatio('custom');
              }}
              min="256"
              max="2048"
              step="64"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="height">Height (px):</label>
            <input
              type="number"
              id="height"
              value={height}
              onChange={(e) => {
                setHeight(parseInt(e.target.value));
                setAspectRatio('custom');
              }}
              min="256"
              max="2048"
              step="64"
              disabled={loading}
            />
          </div>
        </div>

        <div className="dimension-preview">
          📐 Dimensions: {width} x {height} px
        </div>
      </div>

      <button 
        onClick={generateBatchImages} 
        disabled={loading || !promptsList}
        className="generate-button"
      >
        {loading ? '⏳ Generating...' : `🚀 Generate ${parsePrompts(promptsList).length} Image(s)`}
      </button>

      {overallStatus && (
        <div className="status-message">
          <p>{overallStatus}</p>
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
          <p className="loading-text">Generating batch images...</p>
        </div>
      )}

      {/* Jobs Progress */}
      {jobs.length > 0 && (
        <div className="jobs-progress">
          <h3>Jobs Progress</h3>
          <div className="jobs-list">
            {jobs.map((job, index) => (
              <div key={index} className={`job-item ${job.status}`}>
                <div className="job-number">#{index + 1}</div>
                <div className="job-details">
                  <div className="job-prompt">{job.prompt}</div>
                  <div className="job-status">
                    {job.status === 'completed' && '✅ Completed'}
                    {job.status === 'failed' && '❌ Failed'}
                    {job.status === 'backlogged' && '⏳ Queued'}
                    {job.status === 'processing' && '⚙️ Processing'}
                    {job.error && ` - ${job.error}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generated Images Gallery */}
      {generatedImages.length > 0 && (
        <div className="batch-results">
          <div className="results-header">
            <h2>✨ Generated Images ({generatedImages.length})</h2>
            <button onClick={downloadAllImages} className="download-all-button">
              📥 Download All
            </button>
          </div>
          
          <div className="images-gallery">
            {generatedImages.map((img, index) => (
              <div key={index} className="gallery-item">
                <img src={img.imageUrl} alt={`Generated ${index + 1}`} />
                <div className="gallery-item-info">
                  <p className="gallery-prompt">{img.prompt}</p>
                  <a 
                    href={img.imageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="download-link"
                  >
                    🔗 Open
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BatchImageGenerator;
