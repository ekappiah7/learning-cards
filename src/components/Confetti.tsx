import { useMemo, type CSSProperties } from 'react';

// A burst of coloured paper shapes, shown when a child gets something right.
// Pure decoration: it sits over the card and ignores taps.
const COLORS = [2, 3, 4, 5, 6, 7, 8];
const SHAPES = ['dot', 'square', 'tri'];

export function Confetti({ pieces = 26, big = false }: { pieces?: number; big?: boolean }) {
  const bits = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => {
        const angle = (i / pieces) * Math.PI * 2 + Math.random() * 0.5;
        const reach = (big ? 260 : 150) + Math.random() * (big ? 260 : 130);
        return {
          dx: Math.cos(angle) * reach,
          dy: Math.sin(angle) * reach * 0.8 - 40,
          rot: Math.round(Math.random() * 720 - 360),
          color: `var(--module-${COLORS[i % COLORS.length]})`,
          shape: SHAPES[i % SHAPES.length],
          delay: Math.random() * 0.12,
          size: 8 + Math.random() * 8,
        };
      }),
    [pieces, big],
  );
  return (
    <span className={`confetti${big ? ' big' : ''}`} aria-hidden>
      {bits.map((b, i) => (
        <i
          key={i}
          className={b.shape}
          style={
            {
              background: b.color,
              width: b.size,
              height: b.size,
              animationDelay: `${b.delay}s`,
              '--dx': `${b.dx}px`,
              '--dy': `${b.dy}px`,
              '--rot': `${b.rot}deg`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  );
}
