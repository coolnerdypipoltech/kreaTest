import React, { useState } from 'react';
import './VideoGenerator.css';

function VideoGenerator({ apiToken, setShowApiKeyInput }) {
  const [videoPrompt, setVideoPrompt] = useState('A tranquil bay with colorful fishing boats anchored, their reflections mirrored in the still water.');
  const [videoModel, setVideoModel] = useState('seedance-1.0-pro-fast');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [duration, setDuration] = useState(5);
  const [videoResolution, setVideoResolution] = useState('720p');
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoJobId, setVideoJobId] = useState(null);
  const [videoStatus, setVideoStatus] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoError, setVideoError] = useState(null);

  const videoModels = {
    'seedance-1.0-pro-fast': {
      name: 'Seedance 1.0 Pro Fast',
      provider: 'bytedance',
      endpoint: 'bytedance/seedance-1.0-pro-fast'
    },
    'kling-2.5': {
      name: 'Kling 2.5',
      provider: 'kling',
      endpoint: 'kling/kling-2.5'
    }
  };

  const generateVideo = async () => {
    if (!apiToken || apiToken === 'your_token_here') {
      setVideoError('Please enter your Krea AI API token');
      setShowApiKeyInput(true);
      return;
    }

    setVideoLoading(true);
    setVideoError(null);
    setVideoUrl(null);
    setVideoStatus('Generating video...');

    try {
      const selectedModel = videoModels[videoModel];
      const options = {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: videoPrompt,
          aspectRatio: aspectRatio,
          duration: duration,
          resolution: videoResolution
        })
      };

      const response = await fetch(`https://api.krea.ai/generate/video/${selectedModel.endpoint}`, options);
      const data = await response.json();

      if (data.job_id) {
        setVideoJobId(data.job_id);
        setVideoStatus(`Job created: ${data.status}`);
        pollVideoJobStatus(data.job_id);
      } else {
        throw new Error('Failed to create video job');
      }
    } catch (err) {
      setVideoError(`Error: ${err.message}`);
      setVideoLoading(false);
    }
  };

  const pollVideoJobStatus = async (id) => {
    const maxAttempts = 120;
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

        setVideoStatus(`Status: ${data.status}`);

        if (data.status === 'completed') {
          if (data.result && data.result.urls && data.result.urls.length > 0) {
            setVideoUrl(data.result.urls[0]);
            setVideoStatus('Video completed!');
          } else {
            setVideoError('Job completed but no video URL found');
          }
          setVideoLoading(false);
        } else if (data.status === 'failed') {
          setVideoError('Video generation failed');
          setVideoLoading(false);
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(checkStatus, 5000);
          } else {
            setVideoError('Timeout: Video generation took too long to complete');
            setVideoLoading(false);
          }
        }
      } catch (err) {
        setVideoError(`Error checking status: ${err.message}`);
        setVideoLoading(false);
      }
    };

    checkStatus();
  };

  return (
    <div className="tab-content">
      <div className="form-group">
        <label htmlFor="videoPrompt">Prompt:</label>
        <textarea
          id="videoPrompt"
          value={videoPrompt}
          onChange={(e) => setVideoPrompt(e.target.value)}
          placeholder="Describe the video you want to generate..."
          rows="4"
          disabled={videoLoading}
        />
      </div>

      {/* Model Selector */}
      <div className="form-group model-selector-container">
        <label htmlFor="videoModel">🎬 Video Model:</label>
        <select
          id="videoModel"
          value={videoModel}
          onChange={(e) => setVideoModel(e.target.value)}
          disabled={videoLoading}
          className="model-selector"
        >
          {Object.entries(videoModels).map(([key, model]) => (
            <option key={key} value={key}>
              {model.name} ({model.provider})
            </option>
          ))}
        </select>
        <p className="model-info">
          {videoModels[videoModel].name} - Provider: {videoModels[videoModel].provider}
        </p>
      </div>

      <div className="settings-row">
        <div className="form-group">
          <label htmlFor="aspectRatio">Aspect Ratio:</label>
          <select
            id="aspectRatio"
            value={aspectRatio}
            onChange={(e) => setAspectRatio(e.target.value)}
            disabled={videoLoading}
          >
            <option value="16:9">16:9</option>
            <option value="9:16">9:16</option>
            <option value="1:1">1:1</option>
            <option value="4:3">4:3</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="duration">Duration (seconds):</label>
          <input
            type="number"
            id="duration"
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value))}
            min="1"
            max="10"
            disabled={videoLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="videoResolution">Resolution:</label>
          <select
            id="videoResolution"
            value={videoResolution}
            onChange={(e) => setVideoResolution(e.target.value)}
            disabled={videoLoading}
          >
            <option value="720p">720p</option>
            <option value="1080p">1080p</option>
          </select>
        </div>
      </div>

      <button 
        onClick={generateVideo} 
        disabled={videoLoading || !videoPrompt}
        className="generate-button"
      >
        {videoLoading ? 'Generating Video...' : 'Generate Video'}
      </button>

      {videoStatus && (
        <div className="status-message">
          <p>{videoStatus}</p>
          {videoJobId && <p className="job-id">Job ID: {videoJobId}</p>}
        </div>
      )}

      {videoError && (
        <div className="error-message">
          <p>{videoError}</p>
        </div>
      )}

      {videoLoading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p className="loading-text">Video generation may take a few minutes...</p>
        </div>
      )}

      {videoUrl && (
        <div className="video-container">
          <h2>Generated Video</h2>
          <video controls src={videoUrl} className="generated-video">
            Your browser does not support the video tag.
          </video>
          <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="download-link">
            Open Full Size
          </a>
        </div>
      )}
    </div>
  );
}

export default VideoGenerator;
