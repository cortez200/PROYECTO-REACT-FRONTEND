import React from "react";

export function MiniBarChart({ data = [], width = 220, height = 80, color = "#0284c7" }) {
  const max = Math.max(...data, 1);
  const barWidth = Math.max(Math.floor(width / Math.max(data.length, 1)) - 4, 4);
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {data.map((v, i) => {
        const h = Math.round((v / max) * (height - 12));
        const x = i * (barWidth + 4) + 6;
        const y = height - h - 6;
        return <rect key={i} x={x} y={y} width={barWidth} height={h} rx={4} fill={color} opacity={0.85} />;
      })}
    </svg>
  );
}

export function MiniLineChart({ data = [], width = 220, height = 80, color = "#0ea5e9" }) {
  const max = Math.max(...data, 1);
  const stepX = (width - 12) / Math.max(data.length - 1, 1);
  const points = data.map((v, i) => [6 + i * stepX, height - 6 - (v / max) * (height - 12)]);
  const path = points.reduce((acc, [x, y], idx) => acc + (idx === 0 ? `M${x},${y}` : ` L${x},${y}`), "");
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <path d={path} fill="none" stroke={color} strokeWidth={2} />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.8} fill={color} />
      ))}
    </svg>
  );
}

export function DonutChart({ value = 0, total = 1, size = 100, color = "#22c55e" }) {
  const radius = size / 2 - 8;
  const circ = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(total ? value / total : 0, 0), 1);
  const offset = circ * (1 - pct);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e2e8f0" strokeWidth={10} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        stroke={color}
        strokeWidth={10}
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}