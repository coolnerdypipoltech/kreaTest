import React from 'react';
import './Tabs.css';

function Tabs({ activeTab, setActiveTab }) {
  return (
    <div className="tabs">
      <button 
        className={`tab ${activeTab === 'image' ? 'active' : ''}`}
        onClick={() => setActiveTab('image')}
      >
        🖼️ Single Image
      </button>
      <button 
        className={`tab ${activeTab === 'batch' ? 'active' : ''}`}
        onClick={() => setActiveTab('batch')}
      >
        🎨 Batch Images
      </button>
      <button 
        className={`tab ${activeTab === 'video' ? 'active' : ''}`}
        onClick={() => setActiveTab('video')}
      >
        🎬 Video
      </button>
    </div>
  );
}

export default Tabs;
