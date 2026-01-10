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
        <div className="section">
          <label>
            Icon Name
            <a href="https://icon-sets.iconify.design" target="_blank" rel="noopener noreferrer">
              Browse Icons →
            </a>
          </label>
          <input
            type="text"
            placeholder="simple-icons:openai"
            value={iconName}
            onChange={(e) => setIconName(e.target.value)}
          />
          <small>Format: collection:icon-name</small>
        </div>
      )}
      {inputType === 'url' && (
        <div className="section">
          <label>Direct URL</label>
          <input
            type="url"
            placeholder="https://upload.wikimedia.org/wikipedia/commons/b/b0/Claude_AI_symbol.svg"
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