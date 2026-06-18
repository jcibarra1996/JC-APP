import React from 'react';

interface ToggleOption {
  value: string;
  label: string;
  type: 'yes' | 'no' | 'partial' | 'neutral';
}

interface Props {
  options: ToggleOption[];
  value: string | null;
  onChange: (value: string) => void;
}

export default function Toggle({ options, value, onChange }: Props) {
  return (
    <div className="toggle-group">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`toggle-btn ${value === opt.value ? `active-${opt.type}` : ''}`}
          onClick={() => onChange(opt.value)}
          type="button"
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
