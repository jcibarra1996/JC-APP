import React from 'react';

export interface DataPoint {
  label: string;
  value: number | null;
}

interface Props {
  data: DataPoint[];
  color?: string;
  secondaryData?: DataPoint[];
  secondaryColor?: string;
  min?: number;
  max?: number;
  height?: number;
  showDots?: boolean;
  yLabel?: string;
}

export default function LineChart({
  data,
  color = 'var(--color-red)',
  secondaryData,
  secondaryColor = 'var(--color-green)',
  min,
  max,
  height = 120,
  showDots = true,
  yLabel,
}: Props) {
  const validPoints = data.filter((d) => d.value !== null);
  if (validPoints.length < 2) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-gray-400)', fontSize: 13 }}>
        Pocos datos aún
      </div>
    );
  }

  const allValues = [...data.map((d) => d.value ?? 0)];
  if (secondaryData) allValues.push(...secondaryData.map((d) => d.value ?? 0));

  const dataMin = min ?? Math.min(...allValues.filter((v) => v !== 0));
  const dataMax = max ?? Math.max(...allValues);
  const range = dataMax - dataMin || 1;

  const width = 300;
  const padX = 8;
  const padY = 12;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const toX = (i: number) => padX + (i / (data.length - 1)) * innerW;
  const toY = (v: number) => padY + innerH - ((v - dataMin) / range) * innerH;

  const buildPath = (points: DataPoint[]) => {
    const segments: string[] = [];
    let inSegment = false;
    points.forEach((p, i) => {
      if (p.value === null) { inSegment = false; return; }
      const x = toX(i);
      const y = toY(p.value);
      if (!inSegment) { segments.push(`M ${x} ${y}`); inSegment = true; }
      else segments.push(`L ${x} ${y}`);
    });
    return segments.join(' ');
  };

  const primaryPath = buildPath(data);
  const secondaryPath = secondaryData ? buildPath(secondaryData) : null;

  return (
    <div style={{ overflow: 'hidden' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        style={{ width: '100%', height }}
        preserveAspectRatio="none"
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
          const y = padY + fraction * innerH;
          return (
            <line
              key={fraction}
              x1={padX} y1={y} x2={width - padX} y2={y}
              stroke="var(--color-gray-200)" strokeWidth={0.5}
            />
          );
        })}

        {/* Secondary line */}
        {secondaryPath && (
          <path d={secondaryPath} fill="none" stroke={secondaryColor} strokeWidth={1.5} strokeDasharray="4 2" strokeLinecap="round" strokeLinejoin="round" />
        )}

        {/* Primary line */}
        <path d={primaryPath} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots */}
        {showDots && data.map((p, i) => {
          if (p.value === null) return null;
          return (
            <circle
              key={i}
              cx={toX(i)}
              cy={toY(p.value)}
              r={3}
              fill={color}
              stroke="white"
              strokeWidth={1.5}
            />
          );
        })}

        {secondaryData && showDots && secondaryData.map((p, i) => {
          if (p.value === null) return null;
          return (
            <circle
              key={`s${i}`}
              cx={toX(i)}
              cy={toY(p.value)}
              r={2.5}
              fill={secondaryColor}
              stroke="white"
              strokeWidth={1}
            />
          );
        })}
      </svg>

      {/* X labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: padX, paddingRight: padX }}>
        {data.map((d, i) => (
          <span key={i} style={{ fontSize: 10, color: 'var(--color-gray-400)', textAlign: 'center' }}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
