import { useRef, useState, type ReactNode } from 'react';
import {
  ArrowLeft, AudioLines, BookOpen, Brush, CircleDot, Copy, Ear, Gamepad2, Hand, Hash, Layers, Lock,
  MessageSquareText, MoveRight, Music, Plus, Puzzle, Scale, SearchX, Shapes, Volume2,
  type LucideProps,
} from 'lucide-react';
import type { IconName } from '../data/areas';
import { speak } from '../speech';

const ICONS = {
  AudioLines, BookOpen, Brush, CircleDot, Copy, Ear, Gamepad2, Hand, Hash, Layers,
  MessageSquareText, MoveRight, Music, Plus, Puzzle, Scale, SearchX, Shapes,
} satisfies Record<IconName, unknown>;

export function Icon({ name, size = 48, ...rest }: { name: IconName } & LucideProps) {
  const C = ICONS[name];
  return <C size={size} strokeWidth={1.5} aria-hidden {...rest} />;
}

export function Backdrop() {
  return (
    <div className="backdrop" aria-hidden>
      <span />
      <span />
      <span />
    </div>
  );
}

// A round speaker button that reads `text` aloud.
export function HearIt({ text, label = 'Hear it', small }: { text: string; label?: string; small?: boolean }) {
  return (
    <button type="button" className={`icon-btn plain${small ? ' small' : ''}`} aria-label={label} onClick={() => speak(text)}>
      <Volume2 size={small ? 32 : 40} strokeWidth={1.5} aria-hidden />
    </button>
  );
}

export function BackButton({ onClick, label = 'Back' }: { onClick: () => void; label?: string }) {
  return (
    <button type="button" className="icon-btn" aria-label={label} onClick={onClick}>
      <ArrowLeft size={40} strokeWidth={1.5} aria-hidden />
    </button>
  );
}

// Screen header: back slot, eyebrow + title with a hear-it button, right slot.
// Back always sits top left so it is in the same place on every screen.
export function TopBar({
  eyebrow, title, spoken, left, right,
}: { eyebrow?: string; title: ReactNode; spoken: string; left?: ReactNode; right?: ReactNode }) {
  return (
    <header className="topbar">
      <div className="topbar-slot">{left}</div>
      <div className="heading">
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <div className="title-row">
          <h1 className="title">{title}</h1>
          <HearIt text={spoken} small />
        </div>
      </div>
      <div className="topbar-slot">{right}</div>
    </header>
  );
}

export function Stars({ count, max = 5, color }: { count: number; max?: number; color: string }) {
  const shown = Math.min(count, max);
  return (
    <div className="star-row" aria-label={`${count} star${count === 1 ? '' : 's'}`}>
      {Array.from({ length: max }, (_, i) => (
        <StarShape key={i} size={28} filled={i < shown} color={color} />
      ))}
      {count > max && <span>+{count - max}</span>}
    </div>
  );
}

// Solid star for rewards. Module colours are the only bright fills.
export function StarShape({ size, filled = true, color, className }: { size: number; filled?: boolean; color: string; className?: string }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z"
        fill={filled ? color : 'none'}
        stroke={filled ? color : 'var(--line-strong)'}
        strokeWidth={1.5}
        strokeLinejoin="round"
      />
    </svg>
  );
}

// How long a grown-up must press to open the parent corner.
const HOLD_MS = 2000;

// A lock button that only opens after a long press, with a ring that fills
// while it is held. A quick tap just says "Ask a grown-up".
export function HoldToOpen({ label, onOpen }: { label: string; onOpen: () => void }) {
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const opened = useRef(false);

  const start = () => {
    clearTimeout(timer.current);
    opened.current = false;
    setHolding(true);
    timer.current = setTimeout(() => {
      opened.current = true;
      setHolding(false);
      onOpen();
    }, HOLD_MS);
  };
  const cancel = () => {
    clearTimeout(timer.current);
    setHolding(false);
  };

  return (
    <button
      type="button"
      className={`icon-btn hold-btn${holding ? ' holding' : ''}`}
      aria-label={`${label}. Press and hold.`}
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={e => e.preventDefault()}
      onKeyDown={e => {
        if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) {
          e.preventDefault();
          start();
        }
      }}
      onKeyUp={cancel}
      onClick={() => {
        if (!opened.current) speak('Ask a grown-up');
      }}
    >
      <svg className="hold-ring" viewBox="0 0 80 80" aria-hidden>
        <circle cx="40" cy="40" r="37" />
      </svg>
      <Lock size={32} strokeWidth={1.5} aria-hidden />
    </button>
  );
}
