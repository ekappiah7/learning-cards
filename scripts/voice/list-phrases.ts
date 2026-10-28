// Prints every phrase the app can say as JSON, for generate.py.
import { allPhrases, phraseKey } from '../../src/voice/phrases.ts';

const { normal, slow } = allPhrases();
const out = (list: string[], speed: string) => list.map(text => ({ text, key: phraseKey(text), speed }));
process.stdout.write(JSON.stringify([...out(normal, 'normal'), ...out(slow, 'slow')], null, 1));
