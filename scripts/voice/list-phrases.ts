// Prints every phrase the app can say as JSON, for generate.py.
import { allPhrases, phraseKey } from '../../src/voice/phrases.ts';

const out = allPhrases().map(p => ({ text: p.text, key: phraseKey(p.text), speed: p.slow ? 'slow' : 'normal' }));
process.stdout.write(JSON.stringify(out, null, 1));
