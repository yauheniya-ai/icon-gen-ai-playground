import { useState } from 'react';
import { discoverIcons } from '../api';

function InputPanel({
  inputType,
  setInputType,
  iconName,
  setIconName,
  directUrl,
  setDirectUrl,
  handleFileUpload,
  inputPreview
}) {
  const [aiQuery, setAiQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleAiSearch = async () => {
    if (!aiQuery.trim()) return;
    
    setIsSearching(true);
    console.log('Starting AI search for:', aiQuery);
    try {
      const results = await discoverIcons(aiQuery);
      console.log('AI search results:', results);
      setSuggestions(results);
    } catch (error) {
      console.error('AI search error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      setSuggestions([]);
      
      const errorMsg = error.response?.data?.detail || error.message;
      alert(`AI search failed: ${errorMsg}`);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputType('iconify');
    setIconName(suggestion);
  };

  return (
    <div className="panel input-panel">
      <h2>Input</h2>
      
      <div className="section">
        <label>Source Type</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="iconify"
              checked={inputType === 'iconify'}
              onChange={(e) => setInputType(e.target.value)}
            />
            Iconify
          </label>
          <label>
            <input
              type="radio"
              value="url"
              checked={inputType === 'url'}
              onChange={(e) => setInputType(e.target.value)}
            />
            URL
          </label>
          <label>
            <input
              type="radio"
              value="upload"
              checked={inputType === 'upload'}
              onChange={(e) => setInputType(e.target.value)}
            />
            Upload
          </label>
        </div>
      </div>
      {inputType === 'iconify' && (
        <>
          <div className="section">
            <label>
              Icon Name
              <a href="https://icon-sets.iconify.design" target="_blank" rel="noopener noreferrer">
                Browse Icons →
              </a>
            </label>
            <input
              type="text"
              placeholder="emojione-monotone:optical-disk"
              value={iconName}
              onChange={(e) => setIconName(e.target.value)}
            />
            <small>Format: collection:icon-name</small>
          </div>
          
          {/* AI Icon Discovery */}
          <div className="section ai-discovery">
            <label>AI Icon Discovery</label>
            <div className="ai-search-box">
              <input
                type="text"
                placeholder="Describe what icons you need..."
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
              />
              <button 
                onClick={handleAiSearch}
                disabled={isSearching || !aiQuery.trim()}
                className="ai-search-btn"
              >
                {isSearching ? '...' : '✨'}
              </button>
            </div>
            {isSearching && (
              <div className="ai-loading-message">
                Finding Iconify icons... This may take a moment.
              </div>
            )}
            {suggestions.length > 0 && (
              <div className="ai-suggestions">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    className="suggestion-chip"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
      {inputType === 'url' && (
        <div className="section">
          <label>Direct URL</label>
          <input
            type="url"
            placeholder="https://upload.wikimedia.org/wikipedia/commons/f/f6/Builder_icon_hicolor.png"
            value={directUrl}
            onChange={(e) => setDirectUrl(e.target.value)}
          />
        </div>
      )}
      {inputType === 'upload' && (
        <div className="section">
          <label>Upload File (SVG, PNG, WebP, or JPEG)</label>
          <input
            type="file"
            accept=".svg,.png,.webp,.jpg,.jpeg,image/svg+xml,image/png,image/webp,image/jpeg"
            onChange={handleFileUpload}
          />
        </div>
      )}
      <div className="preview-box">
        <div className="preview-label">Input Preview</div>
        {inputPreview ? (
          <img src={inputPreview} alt="Input preview" />
        ) : (
          <div className="preview-placeholder">No input selected</div>
        )}
      </div>
    </div>
  );
}

export default InputPanel;