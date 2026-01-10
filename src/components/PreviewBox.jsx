function PreviewBox({ outputPreview, loading, downloadIcon }) {
  return (
    <div className="preview-box">
      <div className="preview-label">Output Preview</div>
      {outputPreview ? (
        <>
          <img src={outputPreview} alt="Output preview" />
          <div className="download-actions">
            <span>Download</span>
            <button className="download-btn compact" onClick={() => downloadIcon('svg')}>SVG</button>
            <button className="download-btn compact" onClick={() => downloadIcon('png')}>PNG</button>
            <button className="download-btn compact" onClick={() => downloadIcon('webp')}>WEBP</button>
            <button className="download-btn compact" onClick={() => downloadIcon('ico')}>ICO</button>
          </div>
        </>
      ) : (
        <div className="preview-placeholder">
          {loading ? 'Generating...' : 'Click "Generate Icon" to see output'}
        </div>
      )}
    </div>
  );
}

export default PreviewBox;