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
          <input
            type="text"
            placeholder={color1Placeholder}
            value={color1}
            onChange={onColor1Change}
          />
          <span>
            {
              gradientDirections.find(
                (d) => d.value === gradientDirection
              )?.symbol
            }
          </span>
          <input
            type="text"
            placeholder={color2Placeholder}
            value={color2}
            onChange={onColor2Change}
          />
        </div>
      ) : (
        <input
          type="text"
          placeholder={solidPlaceholder}
          value={solidColor}
          onChange={onSolidColorChange}
        />
      )}
    </div>
  );
}

export default ColorControl;