import type { ShapeKind } from '../data/thinking';

// A flat shape in a module colour. With `outline` it is drawn as a line
// instead (used for bin labels).

export const SHAPE_PATHS: Record<ShapeKind, string> = {
  circle: 'M50 6a44 44 0 1 0 0.01 0Z',
  square: 'M18 8h64a10 10 0 0 1 10 10v64a10 10 0 0 1-10 10H18A10 10 0 0 1 8 82V18A10 10 0 0 1 18 8Z',
  triangle: 'M50 8 94 90H6Z',
  star: 'M50 5l13.2 27.8 30.3 3.6-22.3 20.9 5.7 30.1L50 72.6 23.1 87.4l5.7-30.1L6.5 36.4l30.3-3.6Z',
};

export function Shape({
  kind, color, size = 80, outline = false,
}: { kind: ShapeKind; color: string; size?: number; outline?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden className="shape">
      <path
        d={SHAPE_PATHS[kind]}
        fill={outline ? 'none' : color}
        stroke={outline ? color : 'none'}
        strokeWidth={outline ? 4 : 0}
        strokeLinejoin="round"
      />
    </svg>
  );
}
