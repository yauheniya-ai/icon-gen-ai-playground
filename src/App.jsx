import { useState, useEffect, useRef } from 'react';
import { generateIcon, getSettings, saveSettings } from './api';
import { trackIconDownload } from "./analytics";
import { onAuthChange, logout } from './firebase';
import InputPanel from './components/InputPanel.jsx';
import OutputPanel from './components/OutputPanel.jsx';
import LoginButton from './components/LoginButton.jsx';
import AuthModal from './components/AuthModal.jsx';
import SavedCollections from './components/SavedCollections.jsx';
import SaveToCollection from './components/SaveToCollection.jsx';
import SaveSettings from './components/SaveSettings.jsx';
import ViewSettings from './components/ViewSettings.jsx';
import GradientWarningModal from './components/GradientWarningModal.jsx';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCollections, setShowCollections] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSaveSettings, setShowSaveSettings] = useState(false);
  const [showViewSettings, setShowViewSettings] = useState(false);
  const [showGradientWarning, setShowGradientWarning] = useState(false);
  const [inputType, setInputType] = useState('iconify');
  const [iconName, setIconName] = useState('emojione-monotone:optical-disk');
  const [directUrl, setDirectUrl] = useState('https://upload.wikimedia.org/wikipedia/commons/f/f6/Builder_icon_hicolor.png');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [inputPreview, setInputPreview] = useState(null);
  const [config, setConfig] = useState({
    color: '#ffffff',
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
  const [warning, setWarning] = useState('');

  // Track previous background state and whether scale was manually changed
  const prevHasBackgroundRef = useRef(false);
  const scaleManuallyChangedRef = useRef(false);
  
  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      // User authentication state changed
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Save current settings to Firestore
  const handleSaveSettings = async () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    setShowSaveSettings(true);
  };

  // Load settings from a saved configuration
  const handleLoadSettings = (settings) => {
    setConfig({
      color: settings.iconColor || '#ffffff',
      colorGradient: settings.iconGradient || false,
      color1: settings.iconColor1 || '#7B68EE',
      color2: settings.iconColor2 || '#FF1493',
      iconGradientDirection: settings.iconGradientDirection || 'horizontal',
      bg_color: settings.bgColor || '',
      bgGradient: settings.bgGradient || false,
      bg_color1: settings.bgColor1 || '#7B68EE',
      bg_color2: settings.bgColor2 || '#FF1493',
      bgGradientDirection: settings.bgGradientDirection || 'horizontal',
      border_radius: settings.borderRadius || 0,
      outline_width: settings.outlineWidth || 0,
      outline_color: settings.outlineColor || '',
      animationEnabled: settings.animationEnabled || false,
      animationType: settings.animationType || 'spin',
      animationDuration: settings.animationDuration || 4,
      size: settings.size || 256,
      scale: settings.scale || 1.0,
    });
    if (settings.lastQuery) {
      setIconName(settings.lastQuery);
    }
  };
  
  // Auto-adjust scale when background is toggled (only if not manually changed)
  useEffect(() => {
    const hasBackground = config.bgGradient || (config.bg_color && config.bg_color.trim() !== '');
    const prevHasBackground = prevHasBackgroundRef.current;
    
    // Only adjust scale when background state changes AND scale wasn't manually changed
    if (hasBackground !== prevHasBackground && !scaleManuallyChangedRef.current) {
      const newScale = hasBackground ? 0.7 : 1.0;
      setConfig(prev => ({ ...prev, scale: newScale }));
    }
    
    prevHasBackgroundRef.current = hasBackground;
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
    setWarning('');
    if (
      isJpegInput &&
      (config.colorGradient || config.color !== 'white')
    ) {
      setWarning(
        'JPEG/JPG icons cannot change icon color. Background color is still supported.'
      );
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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleSaveIcon = async () => {
    if (!outputPreview) {
      alert('Please generate an icon first');
      return;
    }
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    
    // Check if icon uses gradient colors
    if (config.colorGradient) {
      setShowGradientWarning(true);
      return;
    }
    
    setShowSaveModal(true);
  };

  const getIconSvg = async () => {
    if (!outputPreview) return null;
    try {
      const response = await fetch(outputPreview);
      const svgText = await response.text();
      return svgText;
    } catch (err) {
      console.error('Failed to get SVG:', err);
      return null;
    }
  };

  const getIconName = () => {
    if (inputType === 'iconify') {
      return iconName;
    } else if (inputType === 'url') {
      return directUrl.split('/').pop() || 'icon';
    } else if (inputType === 'upload' && uploadedFile) {
      return uploadedFile.name.replace(/\.[^/.]+$/, '');
    }
    return 'icon';
  };

  return (
    <div className="app">
      <header>
        <div className="header-content">
          <div className="header-title">
            <h1>Icon Gen AI – Playground</h1>
            <p>Generate pixel-perfect icons from Iconify, direct URLs, and local files—with animation support and exports to PNG, SVG, WebP, and ICO.</p>
          </div>
          <LoginButton 
            user={user} 
            onLoginClick={() => setShowAuthModal(true)}
            onLogout={handleLogout}
          />
        </div>
      </header>
      
      {showAuthModal && (
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
      )}
      
      {showGradientWarning && (
        <GradientWarningModal 
          isOpen={showGradientWarning} 
          onClose={() => setShowGradientWarning(false)} 
        />
      )}
      
      {showCollections && (
        <SavedCollections 
          user={user}
          onClose={() => setShowCollections(false)}
        />
      )}
      
      {showViewSettings && (
        <ViewSettings
          user={user}
          onClose={() => setShowViewSettings(false)}
          onLoadSettings={handleLoadSettings}
        />
      )}

      {showSaveSettings && (
        <SaveSettings
          currentSettings={{
            iconColor: config.color,
            iconGradient: config.colorGradient,
            iconColor1: config.color1,
            iconColor2: config.color2,
            iconGradientDirection: config.iconGradientDirection,
            bgColor: config.bg_color,
            bgGradient: config.bgGradient,
            bgColor1: config.bg_color1,
            bgColor2: config.bg_color2,
            bgGradientDirection: config.bgGradientDirection,
            borderRadius: config.border_radius,
            outlineWidth: config.outline_width,
            outlineColor: config.outline_color,
            animationEnabled: config.animationEnabled,
            animationType: config.animationType,
            animationDuration: config.animationDuration,
            size: config.size,
            scale: config.scale,
            lastQuery: iconName,
          }}
          onClose={() => setShowSaveSettings(false)}
          onSaved={() => {
            setShowSaveSettings(false);
            alert('Settings saved successfully!');
          }}
        />
      )}

      {showSaveModal && outputPreview && (
        <SaveToCollection
          user={user}
          iconSvg={outputPreview}
          iconName={getIconName()}
          onClose={() => setShowSaveModal(false)}
          onSaved={() => {
            alert('Icon saved successfully!');
          }}
        />
      )}
      
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
          scaleManuallyChangedRef={scaleManuallyChangedRef}
          handleGenerate={handleGenerate}
          loading={loading}
          error={error}
          warning={warning}
          onViewSettings={() => setShowViewSettings(true)}
          inputPreview={inputPreview}
          outputPreview={outputPreview}
          downloadIcon={downloadIcon}
          user={user}
          onSaveIcon={handleSaveIcon}
          onViewCollections={() => setShowCollections(true)}
          onSaveSettings={handleSaveSettings}
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