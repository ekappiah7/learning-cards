import { Volume2 } from 'lucide-react';
import { Picture, type PictureName } from '../components/pictures';

// Small pieces shared by the activities.

export const Speaker = () => <Volume2 size={40} strokeWidth={1.5} aria-hidden />;

// A picture, optionally with its word underneath, for choice tiles.
export function PicFace({ name, caption }: { name: PictureName; caption?: boolean }) {
  return (
    <span className="pic-face">
      <Picture name={name} size="100%" />
      {caption && <span className="pic-word">{name}</span>}
    </span>
  );
}

export const sample = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];

export const VOWELS = ['a', 'e', 'i', 'o', 'u'];
export const CONSONANTS = 'bcdfghjklmnprstvw'.split('');

// Words without their punctuation, as they are spoken and matched.
export const bare = (word: string) => word.replace(/[.,!?]/g, '');
