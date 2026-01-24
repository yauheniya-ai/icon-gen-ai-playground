import { Icon } from '@iconify/react';

function PreviewBox({ outputPreview, loading, downloadIcon, onSaveIcon, onViewCollections, user }) {
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
          {user && (
            <div className="collection-actions">
              <button 
                className="collection-btn"
                onClick={onSaveIcon}
                title="Save to collection"
                style={{ background: 'mediumslateblue' }}
              >
                <Icon icon="ic:round-bookmark-add" width="18" height="18" />
                Save to Collection
              </button>
              <button 
                className="collection-btn"
                onClick={onViewCollections}
                title="View collections"
                style={{ background: 'deeppink' }}
              >
                <Icon icon="ic:round-collections-bookmark" width="18" height="18" />
                View Collections
              </button>
            </div>
          )}
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