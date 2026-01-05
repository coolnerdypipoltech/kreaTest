import { useState } from 'react';
import './App.css';
import ApiKeySection from './components/ApiKeySection';
import Tabs from './components/Tabs';
import ImageGenerator from './components/ImageGenerator';
import BatchImageGenerator from './components/BatchImageGenerator';
import VideoGenerator from './components/VideoGenerator';

function App() {
  // Tab state
  const [activeTab, setActiveTab] = useState('image');
  
  // API Key state
  const [apiKey, setApiKey] = useState(localStorage.getItem('krea_api_key') || '');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const API_TOKEN = apiKey || process.env.REACT_APP_KREA_API_TOKEN;

  return (
    <div className="App">
      <div className="container">
        <h1>Krea AI Generator</h1>
        
        {/* API Key Section */}
        <ApiKeySection 
          apiKey={apiKey}
          setApiKey={setApiKey}
          showApiKeyInput={showApiKeyInput}
          setShowApiKeyInput={setShowApiKeyInput}
        />

        {/* Tabs */}
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Image Generation Tab */}
        {activeTab === 'image' && (
          <ImageGenerator 
            apiToken={API_TOKEN}
            setShowApiKeyInput={setShowApiKeyInput}
          />
        )}

        {/* Batch Image Generation Tab */}
        {activeTab === 'batch' && (
          <BatchImageGenerator 
            apiToken={API_TOKEN}
            setShowApiKeyInput={setShowApiKeyInput}
          />
        )}

        {/* Video Generation Tab */}
        {activeTab === 'video' && (
          <VideoGenerator 
            apiToken={API_TOKEN}
            setShowApiKeyInput={setShowApiKeyInput}
          />
        )}
      </div>
    </div>
  );
}

export default App;
