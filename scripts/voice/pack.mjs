// Packs the recorded clips into a few larger files, so a phone downloads
// about a dozen files for offline use instead of thousands. Runs before
// every build (see package.json). Output:
//   public/voice/packs/<voice>-<n>-<hash>.pack   clips joined end to end
//   src/voice/packs.json                         where each clip sits
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const outDir = join(root, 'public', 'voice', 'packs');
const VOICES = ['lewis', 'alice'];
const PACK_BYTES = 1_500_000;
const FIRST_PACK_BYTES = 600_000; // small, so the most used lines arrive within seconds

rmSync(outDir, { recursive: true, force: true });
mkdirSync(outDir, { recursive: true });

const index = {};
for (const voice of VOICES) {
  const manifest = JSON.parse(readFileSync(join(root, 'src', 'voice', `${voice}.json`), 'utf8'));
  const packs = [];
  const clips = {};
  let parts = [];
  let size = 0;
  const flush = () => {
    if (!parts.length) return;
    const data = Buffer.concat(parts);
    const hash = createHash('sha1').update(data).digest('hex').slice(0, 10);
    const file = `${voice}-${String(packs.length).padStart(2, '0')}-${hash}.pack`;
    writeFileSync(join(outDir, file), data);
    packs.push(file);
    parts = [];
    size = 0;
  };
  // Manifest order is download order: the most needed lines come first.
  for (const key of Object.keys(manifest)) {
    const file = manifest[key];
    const data = readFileSync(join(root, 'public', 'voice', voice, file));
    if (size + data.length > (packs.length ? PACK_BYTES : FIRST_PACK_BYTES)) flush();
    clips[key] = [packs.length, size, data.length, file];
    parts.push(data);
    size += data.length;
  }
  flush();
  index[voice] = { packs, clips };
}

writeFileSync(join(root, 'src', 'voice', 'packs.json'), JSON.stringify(index));
const files = readdirSync(outDir);
console.log(`voice packs: ${files.length} files for ${VOICES.map(v => `${Object.keys(index[v].clips).length} ${v} clips`).join(', ')}`);
