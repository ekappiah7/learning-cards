import { useSyncExternalStore } from 'react';
import { CHARACTERS, type CharacterId } from '../data/characters';
import { characterState } from '../speech';

// Jabari the lion and Jamila the owl. Flat shapes in the module colours. The
// mouth moves while their own voice is playing, and the body follows their
// mood: idle (bob and blink), wave, cheer (jump) or think (head tilt).

function Lion() {
  return (
    <g>
      <g className="b-body">
        <g className="b-head">
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2;
            return <circle key={i} cx={60 + Math.cos(a) * 38} cy={54 + Math.sin(a) * 38} r="15" fill="var(--module-8)" />;
          })}
          <circle cx="60" cy="54" r="40" fill="var(--module-8)" />
          <circle cx="36" cy="26" r="9" fill="var(--module-8)" />
          <circle cx="84" cy="26" r="9" fill="var(--module-8)" />
          <circle cx="36" cy="26" r="4.5" fill="var(--cream-200)" />
          <circle cx="84" cy="26" r="4.5" fill="var(--cream-200)" />
          <circle cx="60" cy="56" r="29" fill="var(--cream-100)" />
          <circle cx="44" cy="66" r="5" fill="var(--module-7)" opacity="0.55" />
          <circle cx="76" cy="66" r="5" fill="var(--module-7)" opacity="0.55" />
          <g className="b-eyes">
            <ellipse className="b-eye" cx="49" cy="50" rx="4.2" ry="5.2" fill="var(--plum-950)" />
            <ellipse className="b-eye" cx="71" cy="50" rx="4.2" ry="5.2" fill="var(--plum-950)" />
            <path className="b-happy" d="M44 51q5-6 10 0M66 51q5-6 10 0" stroke="var(--plum-950)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          </g>
          <path d="M55 59h10l-5 6z" fill="var(--plum-700)" strokeLinejoin="round" />
          <ellipse className="b-mouth" cx="60" cy="71" rx="6.5" ry="4" fill="var(--plum-950)" />
          <path className="b-smile" d="M52 68q8 7 16 0" stroke="var(--plum-950)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </g>
        <circle className="b-limb b-left" cx="34" cy="104" r="9" fill="var(--module-8)" />
        <circle className="b-limb b-right" cx="86" cy="104" r="9" fill="var(--module-8)" />
      </g>
    </g>
  );
}

function Owl() {
  return (
    <g>
      <g className="b-body">
        <path className="b-limb b-left" d="M24 58q-14 22 2 44q8-18 8-40z" fill="var(--plum-500)" />
        <path className="b-limb b-right" d="M96 58q14 22-2 44q-8-18-8-40z" fill="var(--plum-500)" />
        <g className="b-head">
          <path d="M30 22l10 14M90 22l-10 14" stroke="var(--module-3)" strokeWidth="8" strokeLinecap="round" />
          <ellipse cx="60" cy="66" rx="36" ry="44" fill="var(--module-3)" />
          <ellipse cx="60" cy="80" rx="22" ry="26" fill="var(--cream-100)" />
          <circle cx="46" cy="48" r="14" fill="var(--cream-50)" />
          <circle cx="74" cy="48" r="14" fill="var(--cream-50)" />
          <g className="b-eyes">
            <circle className="b-eye" cx="47" cy="49" r="6" fill="var(--plum-950)" />
            <circle className="b-eye" cx="73" cy="49" r="6" fill="var(--plum-950)" />
            <path className="b-happy" d="M40 50q6-7 12 0M68 50q6-7 12 0" stroke="var(--plum-950)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
          </g>
          <path d="M54 60h12l-6 7z" fill="var(--module-8)" strokeLinejoin="round" />
          <path className="b-mouth" d="M55 67h10l-5 6z" fill="var(--module-8)" />
          <path className="b-smile" d="M54 66q6 4 12 0" stroke="var(--module-8)" strokeWidth="2" fill="none" strokeLinecap="round" />
          <circle cx="36" cy="64" r="4" fill="var(--module-7)" opacity="0.5" />
          <circle cx="84" cy="64" r="4" fill="var(--module-7)" opacity="0.5" />
        </g>
        <path d="M48 108v6M52 108v6M68 108v6M72 108v6" stroke="var(--module-8)" strokeWidth="3" strokeLinecap="round" />
      </g>
    </g>
  );
}

export function Buddy({ who, size = 88, onClick, label }: { who: CharacterId; size?: number; onClick?: () => void; label?: string }) {
  const st = useSyncExternalStore(characterState.subscribe, characterState.get);
  const c = CHARACTERS[who];
  const cls = `buddy ${c.animal} mood-${st.mood[who]}${st.speaking === who ? ' talking' : ''}`;
  const art = (
    <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden>
      {c.animal === 'lion' ? <Lion /> : <Owl />}
    </svg>
  );
  if (!onClick) return <span className={cls}>{art}</span>;
  return (
    <button type="button" className={cls} aria-label={label ?? c.name} onClick={onClick}>
      {art}
    </button>
  );
}
