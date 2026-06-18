import React from 'react';

export interface BarData {
  label: string;
  value: number;
  color?: string;
}

interface Props {
  data: BarData[];
  max?: number;
  height?: number;
  showValues?: boolean;
  valueFormat?: (v: number) => string;
}

export default function BarChart({ data, max, height = 100, showValues = true, valueFormat }: Props) {
  if (!data.length) return null;

  const dataMax = max ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map((bar) => {
        const pct = (bar.value / dataMax) * 100;
        const color = bar.color ?? 'var(--color-red)';
        const display = valueFormat ? valueFormat(bar.value) : String(bar.value);

        return (
          <div key={bar.label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 12, color: 'var(--color-gray-600)', minWidth: 60, textAlign: 'right', flexShrink: 0 }}>
              {bar.label}
            </span>
            <div style={{ flex: 1, height: 20, background: 'var(--color-gray-100)', borderRadius: 4, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: color,
                  borderRadius: 4,
                  transition: 'width 400ms ease',
                  minWidth: bar.value > 0 ? 4 : 0,
                }}
              />
            </div>
            {showValues && (
              <span style={{ fontSize: 12, fontWeight: 600, minWidth: 28, flexShrink: 0 }}>{display}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
