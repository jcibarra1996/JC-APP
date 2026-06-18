import React from 'react';

interface Props {
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  leftLabel?: string;
  rightLabel?: string;
  showValue?: boolean;
  valueFormat?: (v: number) => string;
}

export default function Slider({
  min,
  max,
  step = 1,
  value,
  onChange,
  leftLabel,
  rightLabel,
  showValue = true,
  valueFormat,
}: Props) {
  const display = valueFormat ? valueFormat(value) : String(value);

  return (
    <div className="slider-container">
      {showValue && (
        <div style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 8, color: 'var(--color-red)' }}>
          {display}
        </div>
      )}
      <input
        type="range"
        className="slider"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {(leftLabel || rightLabel) && (
        <div className="slider-labels">
          <span>{leftLabel ?? min}</span>
          <span>{rightLabel ?? max}</span>
        </div>
      )}
    </div>
  );
}
