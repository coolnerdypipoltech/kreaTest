import React from 'react';
import './ApiKeySection.css';

function ApiKeySection({ apiKey, setApiKey, showApiKeyInput, setShowApiKeyInput }) {
  const saveApiKey = () => {
    localStorage.setItem('krea_api_key', apiKey);
    setShowApiKeyInput(false);
    alert('API Key saved successfully!');
  };

  const clearApiKey = () => {
    setApiKey('');
    localStorage.removeItem('krea_api_key');
    alert('API Key cleared');
  };

  return (
    <div className="api-key-section">
      <button 
        className="api-key-toggle"
        onClick={() => setShowApiKeyInput(!showApiKeyInput)}
      >
        {showApiKeyInput ? '🔒 Hide API Key' : '🔑 Configure API Key'}
      </button>
      
      {showApiKeyInput && (
        <div className="api-key-form">
          <div className="form-group">
            <label htmlFor="apiKey">Krea AI API Key:</label>
            <div className="api-key-input-group">
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key here..."
                className="api-key-input"
              />
              <button onClick={saveApiKey} className="save-button" disabled={!apiKey}>
                💾 Save
              </button>
              {apiKey && (
                <button onClick={clearApiKey} className="clear-button">
                  🗑️ Clear
                </button>
              )}
            </div>
            <p className="api-key-hint">
              {apiKey ? '✅ API Key configured' : '⚠️ No API Key configured'}
              {apiKey && ' (saved in localStorage)'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApiKeySection;
