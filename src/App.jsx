import { useState, useEffect, useRef } from 'react';
import { generateIcon } from './api';
import { trackIconDownload } from "./analytics";
import InputPanel from './components/InputPanel.jsx';
import OutputPanel from './components/OutputPanel.jsx';
import './App.css';

function App() {
  const [inputType, setInputType] = useState('iconify');
  const [iconName, setIconName] = useState('emojione-monotone:optical-disk');
  const [directUrl, setDirectUrl] = useState('https://upload.wikimedia.org/wikipedia/commons/f/f6/Builder_icon_hicolor.png');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [inputPreview, setInputPreview] = useState(null);
  const [config, setConfig] = useState({
    color: 'white',
    colorGradient: false,
    iconGradientDirection: "horizontal", 
    color1: '#7B68EE',
    color2: '#FF1493',
    size: 256,
    scale: 1.0,
    bg_color: '',
    bgGradient: false,
    bgGradientDirection: "horizontal",
    bg_color1: '#7B68EE',
    bg_color2: '#FF1493',
    border_radius: 0,
    outline_width: 0,
    outline_color: '',
    animationEnabled: false,
    animationType: 'spin',
    animationDuration: 4
  });
  const [outputPreview, setOutputPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Track previous background state to detect when it changes
  const prevHasBackgroundRef = useRef(false);
  
  // Auto-adjust scale when background is toggled
  useEffect(() => {
    const hasBackground = config.bgGradient || (config.bg_color && config.bg_color.trim() !== '');
    const prevHasBackground = prevHasBackgroundRef.current;
    
    // Only adjust scale when background state changes (toggled on/off)
    if (hasBackground !== prevHasBackground) {
      const newScale = hasBackground ? 0.7 : 1.0;
      setConfig(prev => ({ ...prev, scale: newScale }));
      prevHasBackgroundRef.current = hasBackground;
    }
  }, [config.bgGradient, config.bg_color]);

  const isJpegInput =
    (inputType === 'upload' &&
      uploadedFile &&
      ['image/jpeg', 'image/jpg'].includes(uploadedFile.type)) ||
    (inputType === 'url' &&
      directUrl &&
      /\.(jpe?g)(\?|$)/i.test(directUrl));

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
      if (inputType === 'iconify') {
        formData.append('icon_name', iconName);
      } else if (inputType === 'url') {
        formData.append('direct_url', directUrl);
      } else if (inputType === 'upload') {
        formData.append('file', uploadedFile);
      }
      formData.append('size', config.size);
      formData.append('scale', config.scale);
      if (!isJpegInput) {
        if (config.colorGradient) {
          formData.append("color", `(${config.color1},${config.color2})`);
          formData.append("direction", config.iconGradientDirection || "horizontal");
        } else if (config.color && config.color.trim() !== '') {
          formData.append("color", config.color);
        }
      }
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
      if (config.animationEnabled) {
        formData.append('animation', `${config.animationType}:${config.animationDuration}s`);
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
    if (format === 'svg') {
      const a = document.createElement('a');
      a.href = outputPreview;
      a.download = `icon-${Date.now()}.svg`;
      a.click();
      return;
    }
    if (format === 'png' || format === 'webp') {
      // If animated and requesting WebP, delegate to backend (server-side animated WebP)
      if (format === 'webp' && config.animationEnabled) {
        try {
          const formData = new FormData();
          if (inputType === 'iconify') {
            formData.append('icon_name', iconName);
          } else if (inputType === 'url') {
            formData.append('direct_url', directUrl);
          } else if (inputType === 'upload') {
            formData.append('file', uploadedFile);
          }
          formData.append('size', config.size);
          formData.append('scale', config.scale);
          formData.append('border_radius', config.border_radius);
          formData.append('outline_width', config.outline_width);
          if (config.outline_color) formData.append('outline_color', config.outline_color);
          if (!isJpegInput) {
            if (config.colorGradient) {
              formData.append('color', `(${config.color1},${config.color2})`);
            } else if (config.color && config.color.trim() !== '') {
              formData.append('color', config.color);
            }
          }
          formData.append(
            'bg_color',
            config.bgGradient ? `(${config.bg_color1},${config.bg_color2})` : config.bg_color
          );
          formData.append('direction', config.iconGradientDirection || 'horizontal');
          formData.append('bg_direction', config.bgGradientDirection || 'horizontal');
          // Pass animation and request server-side webp
          formData.append('animation', `${config.animationType}:${config.animationDuration}s`);
          formData.append('format', 'webp');

          const blob = await generateIcon(formData);
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `icon-${Date.now()}.webp`;
          a.click();
          URL.revokeObjectURL(url);
        } catch (err) {
          console.error('WEBP download error:', err);
          alert('WEBP download failed');
        }
        return;
      }

      // Static PNG/WebP generation client-side (fallback for non-animated WebP)
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
    if (format === 'ico') {
      try {
        const formData = new FormData();
        if (inputType === 'iconify') {
          formData.append('icon_name', iconName);
        } else if (inputType === 'url') {
          formData.append('direct_url', directUrl);
        } else if (inputType === 'upload') {
          formData.append('file', uploadedFile);
        }
        formData.append('size', config.size);
        formData.append('border_radius', config.border_radius);
        formData.append('outline_width', config.outline_width);
        if (config.outline_color) formData.append('outline_color', config.outline_color);
        if (!isJpegInput) {
          if (config.colorGradient) {
            formData.append("color", `(${config.color1},${config.color2})`);
          } else if (config.color && config.color.trim() !== '') {
            formData.append("color", config.color);
          }
        }
        formData.append(
          "bg_color",
          config.bgGradient
            ? `(${config.bg_color1},${config.bg_color2})`
            : config.bg_color
        );
        formData.append("direction", config.iconGradientDirection || "horizontal");
        formData.append("bg_direction", config.bgGradientDirection || "horizontal");
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
        <InputPanel
          inputType={inputType}
          setInputType={setInputType}
          iconName={iconName}
          setIconName={setIconName}
          directUrl={directUrl}
          setDirectUrl={setDirectUrl}
          handleFileUpload={handleFileUpload}
          inputPreview={inputPreview}
        />
        <OutputPanel
          config={config}
          setConfig={setConfig}
          handleGenerate={handleGenerate}
          loading={loading}
          error={error}
          inputPreview={inputPreview}
          outputPreview={outputPreview}
          downloadIcon={downloadIcon}
        />
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