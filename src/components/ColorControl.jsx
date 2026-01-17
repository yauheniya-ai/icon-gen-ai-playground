function ColorControl({
  label,
  isGradient,
  onGradientToggle,
  solidColor,
  onSolidColorChange,
  color1,
  onColor1Change,
  color2,
  onColor2Change,
  gradientDirection,
  onDirectionCycle,
  gradientDirections,
  solidPlaceholder,
  color1Placeholder,
  color2Placeholder
}) {
  return (
    <div className="section">
      <div className="label-row">
        <label>{label}</label>
        <label className="checkbox-inline">
          <input
            type="checkbox"
            checked={isGradient}
            onChange={onGradientToggle}
          />
          <span>
            Gradient
            {isGradient && (
              <span className="gradient-direction">
                {" "}(
                direction{" "}
                <span
                  className="direction-toggle"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDirectionCycle();
                  }}
                >
                  {
                    gradientDirections.find(
                      d => d.value === gradientDirection
                    )?.symbol
                  }
                </span>
                )
              </span>
            )}
          </span>
        </label>
      </div>
      {isGradient ? (
        <div className="color-gradient">
          <div className="color-input-wrapper">
            <input
              type="color"
              value={color1 || color1Placeholder}
              onChange={onColor1Change}
              className="color-picker"
              title="Pick a color"
            />
            <input
              type="text"
              placeholder={color1Placeholder}
              value={color1}
              onChange={onColor1Change}
            />
          </div>
          <span>
            {
              gradientDirections.find(
                (d) => d.value === gradientDirection
              )?.symbol
            }
          </span>
          <div className="color-input-wrapper">
            <input
              type="color"
              value={color2 || color2Placeholder}
              onChange={onColor2Change}
              className="color-picker"
              title="Pick a color"
            />
            <input
              type="text"
              placeholder={color2Placeholder}
              value={color2}
              onChange={onColor2Change}
            />
          </div>
        </div>
      ) : (
        <div className="color-input-wrapper">
          <input
            type="color"
            value={solidColor || '#ffffff'}
            onChange={onSolidColorChange}
            className="color-picker"
            title="Pick a color"
          />
          <input
            type="text"
            placeholder={solidPlaceholder}
            value={solidColor}
            onChange={onSolidColorChange}
          />
        </div>
      )}
    </div>
  );
}

export default ColorControl;