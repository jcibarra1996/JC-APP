import React from 'react';

interface Props {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  label?: string;
  suffix?: string;
}

export default function Counter({ value, min = 0, max = 99, onChange, label, suffix }: Props) {
  const decrement = () => { if (value > min) onChange(value - 1); };
  const increment = () => { if (value < max) onChange(value + 1); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center' }}>
      {label && <span style={{ fontSize: 13, color: 'var(--color-gray-600)', fontWeight: 500 }}>{label}</span>}
      <div className="counter">
        <button className="counter-btn" onClick={decrement} type="button" disabled={value <= min}>−</button>
        <span className="counter-value">{value}{suffix ?? ''}</span>
        <button className="counter-btn" onClick={increment} type="button" disabled={value >= max}>+</button>
      </div>
    </div>
  );
}
