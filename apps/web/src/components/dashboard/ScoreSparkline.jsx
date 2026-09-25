const ACCENT = '#2ad175';

function buildSmoothPath(points) {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  if (points.length === 2) {
    return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

export default function ScoreSparkline({
  scoreTrend,
  className = '',
  gradientId = 'majuSparkFill',
  width = 120,
  height = 40,
}) {
  if (!scoreTrend || scoreTrend.length < 2) return null;

  const pad = 4;
  const plotW = width - pad * 2;
  const plotH = height - pad * 2;

  const points = scoreTrend.map((point, index) => {
    const x = pad + (index / (scoreTrend.length - 1)) * plotW;
    const y = pad + plotH - (point.score / 100) * plotH;
    return { x, y };
  });

  const path = buildSmoothPath(points);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={`shrink-0 ${className}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.35" />
          <stop offset="100%" stopColor={ACCENT} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${path} L ${points[points.length - 1].x} ${height - pad} L ${points[0].x} ${height - pad} Z`}
        fill={`url(#${gradientId})`}
      />
      <path d={path} fill="none" stroke={ACCENT} strokeWidth="2" strokeLinecap="round" />
      {points.map((point, index) => (
        <circle key={index} cx={point.x} cy={point.y} r="2.5" fill="#fff" stroke={ACCENT} strokeWidth="1.5" />
      ))}
    </svg>
  );
}
