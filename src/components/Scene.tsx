import type { StoryPage } from '../data/stories';
import { Picture } from './pictures';

// The picture for a story page: a simple backdrop with cartoon items placed
// on it.
export function Scene({ page }: { page: StoryPage }) {
  return (
    <div className={`scene bg-${page.bg}`} aria-hidden>
      <span className="scene-ground" />
      {page.items.map((it, i) => (
        <span key={i} className="scene-item" style={{ left: `${it.x}%`, top: `${it.y}%`, width: `${it.size}%` }}>
          <span className={it.anim ? `anim-${it.anim}` : undefined} style={{ animationDelay: `${i * 0.15}s` }}>
            <Picture name={it.pic} size="100%" />
          </span>
        </span>
      ))}
    </div>
  );
}
