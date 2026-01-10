import { useState, useEffect } from 'react';
import { generateIcon } from './api';
import { trackIconDownload } from "./analytics";

import './App.css';

function App() {
  const [inputType, setInputType] = useState('iconify'); // 'iconify', 'url', 'upload'
  const [iconName, setIconName] = useState('simple-icons:openai');
  const [directUrl, setDirectUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [inputPreview, setInputPreview] = useState(null);
  
  const [config, setConfig] = useState({
    color: 'white',
    colorGradient: false,
    iconGradientDirection: "horizontal", 
    color1: '#7B68EE',
    color2: '#FF1493',
    size: 256,
    bg_color: '',
    bgGradient: false,
    bgGradientDirection: "horizontal",
    bg_color1: '#7B68EE',
    bg_color2: '#FF1493',
    border_radius: 0,
    outline_width: 0,
    outline_color: ''
  });

  const gradientDirections = [
    { value: "horizontal", symbol: "→" },
    { value: "vertical", symbol: "↓" },
    { value: "diagonal", symbol: "↘" },
  ];

  const cycleIconGradientDirection = () => {
    const index = gradientDirections.findIndex(
      d => d.value === config.iconGradientDirection
    );
    const next = gradientDirections[(index + 1) % gradientDirections.length];
    setConfig({ ...config, iconGradientDirection: next.value });
  };

  const cycleBgGradientDirection = () => {
    const index = gradientDirections.findIndex(
      d => d.value === config.bgGradientDirection
    );
    const next = gradientDirections[(index + 1) % gradientDirections.length];
    setConfig({ ...config, bgGradientDirection: next.value });
  }; 
  
  const [outputPreview, setOutputPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // JPEG/JPG cannot change icon color
  const isJpegInput =
    (inputType === 'upload' &&
      uploadedFile &&
      ['image/jpeg', 'image/jpg'].includes(uploadedFile.type)) ||
    (inputType === 'url' &&
      directUrl &&
      /\.(jpe?g)(\?|$)/i.test(directUrl));

  // Load input preview
  useEffect(() => {
    const loadInputPreview = async () => {
      if (inputType === 'iconify' && iconName) {
        setInputPreview(`https://api.iconify.design/${iconName}.svg`);
      } else if (inputType === 'url' && directUrl) {
        setInputPreview(directUrl);
      } else if (inputType === 'upload' && uploadedFile) {
        const reader = new FileReader();
        reader.onload = (e) => setInputPreview(e.target.result);
        reader.readAsDataURL(uploadedFile);
      }
    };
    loadInputPreview();
  }, [inputType, iconName, directUrl, uploadedFile]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && (
      file.type === 'image/svg+xml' || 
      file.type === 'image/png' || 
      file.type === 'image/webp' || 
      file.type === 'image/jpeg' || 
      file.type === 'image/jpg'
    )) {
      setUploadedFile(file);
    } else {
      setError('Please upload SVG, PNG, WebP, or JPEG file');
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');

    // Block icon color change ONLY for JPEG/JPG
    if (
      isJpegInput &&
      (config.colorGradient || config.color !== 'white')
    ) {
      setError(
        'JPEG/JPG icons cannot change icon color. Background color is still supported.'
      );
      setLoading(false);
      return;
    }


    try {
      const formData = new FormData();

      // input source
      if (inputType === 'iconify') {
        formData.append('icon_name', iconName);
      } else if (inputType === 'url') {
        formData.append('direct_url', directUrl);
      } else if (inputType === 'upload') {
        formData.append('file', uploadedFile);
      }

      // styling options
      formData.append('size', config.size);

      if (!isJpegInput) {
        if (config.colorGradient) {
          // Send color as gradient string
          formData.append("color", `(${config.color1},${config.color2})`);
          // Send direction explicitly
          formData.append("direction", config.iconGradientDirection || "horizontal");
        } else {
          // Always send a solid color
          formData.append("color", config.color || "white");
        }
      }

      // Background color
      if (config.bgGradient) {
        formData.append("bg_color", `(${config.bg_color1},${config.bg_color2})`);
        formData.append("bg_direction", config.bgGradientDirection || "horizontal");
      } else if (config.bg_color) {
        formData.append("bg_color", config.bg_color);
      }

      if (config.border_radius > 0) {
        formData.append('border_radius', config.border_radius);
      }

      if (config.outline_width > 0) {
        formData.append('outline_width', config.outline_width);
        if (config.outline_color) {
          formData.append('outline_color', config.outline_color);
        }
      }

      const blob = await generateIcon(formData);
      const url = URL.createObjectURL(blob);
      setOutputPreview(url);

    } catch (err) {
      setError(err.message || 'Failed to generate icon');
    } finally {
      setLoading(false);
    }
  };


  const downloadIcon = async (format) => {
    if (!outputPreview) return;

    trackIconDownload({
      format,
      inputType,
      size: config.size,
      hasBg: config.bgGradient || !!config.bg_color,
    });

    // SVG, PNG, WEBP use the preview directly
    if (format === 'svg') {
      const a = document.createElement('a');
      a.href = outputPreview;
      a.download = `icon-${Date.now()}.svg`;
      a.click();
      return;
    }

    if (format === 'png' || format === 'webp') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = outputPreview;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        canvas.toBlob(
          (blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `icon-${Date.now()}.${format}`;
            a.click();
            URL.revokeObjectURL(url);
          },
          format === 'png' ? 'image/png' : 'image/webp'
        );
      };
      return;
    }

    // ICO must call backend with original parameters
    if (format === 'ico') {
      try {
        const formData = new FormData();

        // input source
        if (inputType === 'iconify') {
          formData.append('icon_name', iconName);
        } else if (inputType === 'url') {
          formData.append('direct_url', directUrl);
        } else if (inputType === 'upload') {
          formData.append('file', uploadedFile);
        }

        // styling options
        formData.append('size', config.size);
        formData.append('border_radius', config.border_radius);
        formData.append('outline_width', config.outline_width);
        if (config.outline_color) formData.append('outline_color', config.outline_color);
        
        // colors
        if (!isJpegInput) {
          formData.append(
            "color",
            config.colorGradient
              ? `(${config.color1},${config.color2})`
              : config.color
          );
        }

        formData.append(
          "bg_color",
          config.bgGradient
            ? `(${config.bg_color1},${config.bg_color2})`
            : config.bg_color
        );

        formData.append("direction", config.iconGradientDirection || "horizontal");
        formData.append("bg_direction", config.bgGradientDirection || "horizontal");

        // format
        formData.append("format", "ico");

        const blob = await generateIcon(formData);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `icon-${Date.now()}.ico`;
        a.click();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error('Download error:', err);
        alert('ICO download failed');
      }
    }

  };


  return (
    <div className="app">
      <header>
        <h1>Icon Gen AI – Playground</h1>
        <p>Generate pixel-perfect icons with custom color, background, border radius, and outline. Export to svg, png, webp, and ico</p>
      </header>

      <div className="container">
        {/* Left Side - Input */}
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

        {/* Right Side - Output */}
        <div className="panel output-panel">
          <h2>Output</h2>

        {/* Icon Color */}
        <div className="section">
          <div className="label-row">
            <label>Icon Color</label>

            <label className="checkbox-inline">
              <input
                type="checkbox"
                checked={config.colorGradient}
                onChange={(e) =>
                  setConfig({ ...config, colorGradient: e.target.checked })
                }
              />
              <span>
                Gradient
                {config.colorGradient && (
                  <span className="gradient-direction">
                    {" "}(
                    direction{" "}
                    <span
                      className="direction-toggle"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        cycleIconGradientDirection();
                      }}
                    >
                      {
                        gradientDirections.find(
                          d => d.value === config.iconGradientDirection
                        )?.symbol
                      }
                    </span>
                    )
                  </span>
                )}
              </span>
            </label>
          </div>

          {config.colorGradient ? (
            <div className="color-gradient">
              <input
                type="text"
                placeholder="#8B76E9"
                value={config.color1}
                onChange={(e) =>
                  setConfig({ ...config, color1: e.target.value })
                }
              />
              <span>
                {
                  gradientDirections.find(
                    (d) => d.value === config.iconGradientDirection
                  )?.symbol
                }
              </span>
              <input
                type="text"
                placeholder="#FF1493"
                value={config.color2}
                onChange={(e) =>
                  setConfig({ ...config, color2: e.target.value })
                }
              />
            </div>
          ) : (
            <input
              type="text"
              placeholder="white, #FF0000, dodgerblue"
              value={config.color}
              onChange={(e) =>
                setConfig({ ...config, color: e.target.value })
              }
            />
          )}
        </div>


          {/* Size */}
          <div className="section">
            <label>Size (px)</label>
            <input
              type="number"
              min="16"
              max="512"
              value={config.size}
              onChange={(e) => setConfig({...config, size: parseInt(e.target.value)})}
            />
          </div>

          {/* Background Color */}
          <div className="section">
            <div className="label-row">
              <label>Background</label>

              <label className="checkbox-inline">
                <input
                  type="checkbox"
                  checked={config.bgGradient}
                  onChange={(e) =>
                    setConfig({ ...config, bgGradient: e.target.checked })
                  }
                />
                <span>
                  Gradient
                  {config.bgGradient && (
                    <span className="gradient-direction">
                      {" "}(
                      direction{" "}
                      <span
                        className="direction-toggle"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          cycleBgGradientDirection();
                        }}
                      >
                        {
                          gradientDirections.find(
                            d => d.value === config.bgGradientDirection
                          )?.symbol
                        }
                      </span>
                      )
                    </span>
                  )}
                </span>
              </label>
            </div>

            {config.bgGradient ? (
              <div className="color-gradient">
                <input
                  type="text"
                  placeholder="#7B68EE"
                  value={config.bg_color1}
                  onChange={(e) =>
                    setConfig({ ...config, bg_color1: e.target.value })
                  }
                />
                <span>
                  {
                    gradientDirections.find(
                      (d) => d.value === config.bgGradientDirection
                    )?.symbol
                  }
                </span>
                <input
                  type="text"
                  placeholder="#FF1493"
                  value={config.bg_color2}
                  onChange={(e) =>
                    setConfig({ ...config, bg_color2: e.target.value })
                  }
                />
              </div>
            ) : (
              <input
                type="text"
                placeholder="transparent, #7B68EE"
                value={config.bg_color}
                onChange={(e) =>
                  setConfig({ ...config, bg_color: e.target.value })
                }
              />
            )}
          </div>


          {/* Border Radius */}
          <div className="section">
            <label>Border Radius (0=square, size/2=circle)</label>
            <input
              type="number"
              min="0"
              max={config.size / 2}
              value={config.border_radius}
              onChange={(e) => setConfig({...config, border_radius: parseInt(e.target.value)})}
            />
          </div>

          {/* Outline */}
          <div className="section">
            <label>Outline Width (px)</label>
            <input
              type="number"
              min="0"
              max="20"
              value={config.outline_width}
              onChange={(e) => setConfig({...config, outline_width: parseInt(e.target.value)})}
            />
          </div>

          {config.outline_width > 0 && (
            <div className="section">
              <label>Outline Color</label>
              <input
                type="text"
                placeholder="white, #FF0000"
                value={config.outline_color}
                onChange={(e) => setConfig({...config, outline_color: e.target.value})}
              />
            </div>
          )}

          <button 
            className="generate-btn"
            onClick={handleGenerate}
            disabled={loading || !inputPreview}
          >
            {loading ? 'Generating...' : 'Generate Icon'}
          </button>

          {error && <div className="error">{error}</div>}

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
        </div>
      </div>

      <footer>
        <p style={{ fontFamily: "monospace" }}>
          pip install{" "}
          <a
            href="https://pypi.org/project/icon-gen-ai/"
            target="_blank"
            rel="noopener noreferrer"
          >
            icon-gen-ai
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;