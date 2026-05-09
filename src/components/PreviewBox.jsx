import { Icon } from '@iconify/react';
import { useState, useEffect } from 'react';

function PreviewBox({ outputPreview, loading, downloadIcon, onSaveIcon, onViewCollections, user }) {
  const [showSvgCode, setShowSvgCode] = useState(false);
  const [svgCode, setSvgCode] = useState(null);

  useEffect(() => {
    setSvgCode(null);
    setShowSvgCode(false);
    if (!outputPreview) return;
    const extract = async () => {
      try {
        if (outputPreview.startsWith('data:image/svg+xml;base64,')) {
          setSvgCode(atob(outputPreview.slice('data:image/svg+xml;base64,'.length)));
        } else if (outputPreview.startsWith('data:image/svg+xml,')) {
          setSvgCode(decodeURIComponent(outputPreview.slice('data:image/svg+xml,'.length)));
        } else {
          // blob: or remote URL — fetch and check content type
          const res = await fetch(outputPreview);
          const ct = res.headers.get('content-type') || '';
          if (ct.includes('svg')) {
            const text = await res.text();
            setSvgCode(text);
          }
        }
      } catch {
        setSvgCode(null);
      }
    };
    extract();
  }, [outputPreview]);

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
            {svgCode && (
              <>
                <span className="svg-code-label">SVG code</span>
                <button
                  className="svg-toggle-btn"
                  onClick={() => setShowSvgCode((v) => !v)}
                >
                  {showSvgCode ? 'hide' : 'show'}
                </button>
              </>
            )}
          </div>
          {showSvgCode && svgCode && (
            <pre className="svg-code-block"><code>{svgCode}</code></pre>
          )}
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