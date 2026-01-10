import ColorControl from './ColorControl';
import PreviewBox from './PreviewBox';

function OutputPanel({
  config,
  setConfig,
  handleGenerate,
  loading,
  error,
  inputPreview,
  outputPreview,
  downloadIcon
}) {
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

  return (
    <div className="panel output-panel">
      <h2>Output</h2>
      
      <ColorControl
        label="Icon Color"
        isGradient={config.colorGradient}
        onGradientToggle={(e) => setConfig({ ...config, colorGradient: e.target.checked })}
        solidColor={config.color}
        onSolidColorChange={(e) => setConfig({ ...config, color: e.target.value })}
        color1={config.color1}
        onColor1Change={(e) => setConfig({ ...config, color1: e.target.value })}
        color2={config.color2}
        onColor2Change={(e) => setConfig({ ...config, color2: e.target.value })}
        gradientDirection={config.iconGradientDirection}
        onDirectionCycle={cycleIconGradientDirection}
        gradientDirections={gradientDirections}
        solidPlaceholder="white, #FF0000, dodgerblue"
        color1Placeholder="#8B76E9"
        color2Placeholder="#FF1493"
      />

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

      <ColorControl
        label="Background"
        isGradient={config.bgGradient}
        onGradientToggle={(e) => setConfig({ ...config, bgGradient: e.target.checked })}
        solidColor={config.bg_color}
        onSolidColorChange={(e) => setConfig({ ...config, bg_color: e.target.value })}
        color1={config.bg_color1}
        onColor1Change={(e) => setConfig({ ...config, bg_color1: e.target.value })}
        color2={config.bg_color2}
        onColor2Change={(e) => setConfig({ ...config, bg_color2: e.target.value })}
        gradientDirection={config.bgGradientDirection}
        onDirectionCycle={cycleBgGradientDirection}
        gradientDirections={gradientDirections}
        solidPlaceholder="transparent"
        color1Placeholder="#7B68EE"
        color2Placeholder="#FF1493"
      />

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

      <div className="section">
        <div className="label-row">
          <label>Animation (type:s)</label>
          <label className="checkbox-inline">
            <input
              type="checkbox"
              checked={config.animationEnabled}
              onChange={(e) => setConfig({ ...config, animationEnabled: e.target.checked })}
            />
            <span>Enable</span>
          </label>
        </div>
        {config.animationEnabled && (
          <div style={{ display: 'flex', gap: '8px'}}>
            <select
              value={config.animationType}
              onChange={(e) => setConfig({ ...config, animationType: e.target.value })}
              style={{ flex: 1 }}
            >
              <option value="spin">Spin</option>
              <option value="pulse">Pulse</option>
              <option value="flip-h">Flip H</option>
              <option value="flip-v">Flip V</option>
            </select>
            <input
              type="number"
              min="0.1"
              max="10"
              step="0.1"
              value={config.animationDuration}
              onChange={(e) => setConfig({ ...config, animationDuration: parseFloat(e.target.value) })}
              style={{ width: '80px' }}
              placeholder="Duration"
            />
          </div>
        )}
      </div>

      <button 
        className="generate-btn"
        onClick={handleGenerate}
        disabled={loading || !inputPreview}
      >
        {loading ? 'Generating...' : 'Generate Icon'}
      </button>

      {error && <div className="error">{error}</div>}

      <PreviewBox
        outputPreview={outputPreview}
        loading={loading}
        downloadIcon={downloadIcon}
      />
    </div>
  );
}

export default OutputPanel;