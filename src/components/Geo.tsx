import { GEO, type GeoKind } from '../data/shapes';

// Draws one of the named shapes. `count` lights up that many sides or
// corners, each with its number, for counting them one by one.
export function Geo({
  kind, color, size = 96, turn = 0, count = 0, show, className,
}: {
  kind: GeoKind;
  color: string;
  size?: number | string;
  turn?: number;
  count?: number;
  show?: 'sides' | 'corners';
  className?: string;
}) {
  const g = GEO[kind];
  const pts = g.points;
  const d = pts ? `M${pts.map(p => p.join(' ')).join('L')}Z` : g.path;
  // Push labels away from the middle of the shape so they sit outside it.
  const out = (x: number, y: number, by: number): [number, number] => {
    const len = Math.hypot(x - 50, y - 50) || 1;
    return [x + ((x - 50) / len) * by, y + ((y - 50) / len) * by];
  };
  return (
    <svg className={`geo${className ? ` ${className}` : ''}`} viewBox="-14 -14 128 128" width={size} height={size} aria-hidden>
      <g transform={turn ? `rotate(${turn} 50 50)` : undefined}>
        <path d={d} fill={color} strokeLinejoin="round" />
        {pts && show === 'sides' &&
          pts.slice(0, count).map((p, i) => {
            const q = pts[(i + 1) % pts.length];
            const [lx, ly] = out((p[0] + q[0]) / 2, (p[1] + q[1]) / 2, 11);
            return (
              <g key={i} className="geo-mark">
                <path d={`M${p[0]} ${p[1]}L${q[0]} ${q[1]}`} stroke="var(--plum-700)" strokeWidth="6" strokeLinecap="round" />
                <text x={lx} y={ly + 4.5} textAnchor="middle" className="geo-num">{i + 1}</text>
              </g>
            );
          })}
        {pts && show === 'corners' &&
          pts.slice(0, count).map((p, i) => {
            const [lx, ly] = out(p[0], p[1], 12);
            return (
              <g key={i} className="geo-mark">
                <circle cx={p[0]} cy={p[1]} r="6.5" fill="var(--plum-700)" />
                <text x={lx} y={ly + 4.5} textAnchor="middle" className="geo-num">{i + 1}</text>
              </g>
            );
          })}
      </g>
    </svg>
  );
}
