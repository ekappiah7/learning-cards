"""Record every app phrase in one Kokoro voice.

Kokoro is an open-source text-to-speech model (Apache 2.0). Usage, from the
repository root:

    node --experimental-strip-types --no-warnings scripts/voice/list-phrases.ts > phrases.json
    python scripts/voice/generate.py phrases.json --model kokoro-v1.0.int8.onnx --voices voices-v1.0.bin

Needs: pip install kokoro-onnx soundfile, plus ffmpeg on the PATH. The model
files come from https://github.com/thewh1teagle/kokoro-onnx/releases.

Clips are written to public/voice/<voice>/ and listed in
src/voice/<voice>.json. Existing clips are kept, so re-running after adding
words only records the new phrases; clips no longer used are deleted.
"""

import argparse
import hashlib
import json
import os
import subprocess
import tempfile

import soundfile as sf
from kokoro_onnx import Kokoro

VOICE = 'bm_lewis'
SPEED = {'normal': 0.9, 'slow': 0.75}

# Letter sounds are given to the model as phonetic symbols so it says the
# phonics sound, not the letter name. Keys are the LETTER_SOUNDS spellings
# in src/data/reading.ts.
PHONICS = {
    'ah': 'æ', 'buh': 'bə', 'kuh': 'kə', 'duh': 'də', 'eh': 'ɛ', 'fff': 'fːː', 'guh': 'ɡə',
    'huh': 'hə', 'ih': 'ɪ', 'juh': 'ʤə', 'lll': 'lːː', 'mmm': 'mːː', 'nnn': 'nːː', 'aw': 'ɒ',
    'puh': 'pə', 'kwuh': 'kwə', 'rrr': 'ɹə', 'sss': 'sːː', 'tuh': 'tə', 'uh': 'ʌ', 'vvv': 'vːː',
    'wuh': 'wə', 'ks': 'ks', 'yuh': 'jə', 'zzz': 'zːː',
}

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def clip_name(key):
    return hashlib.sha1(key.encode()).hexdigest()[:12] + '.mp3'


def to_mp3(wav, mp3):
    # Trim silence at both ends so clips chain together without gaps.
    trim = 'silenceremove=start_periods=1:start_threshold=-50dB'
    subprocess.run(
        ['ffmpeg', '-loglevel', 'error', '-y', '-i', wav, '-af', f'{trim},areverse,{trim},areverse',
         '-ac', '1', '-ar', '24000', '-codec:a', 'libmp3lame', '-b:a', '48k', mp3],
        check=True,
    )


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('phrases')
    ap.add_argument('--model', required=True)
    ap.add_argument('--voices', required=True)
    ap.add_argument('--voice', default=VOICE)
    args = ap.parse_args()

    name = args.voice.split('_', 1)[1]
    out_dir = os.path.join(ROOT, 'public', 'voice', name)
    manifest_path = os.path.join(ROOT, 'src', 'voice', f'{name}.json')
    os.makedirs(out_dir, exist_ok=True)

    phrases = json.load(open(args.phrases))
    kokoro = Kokoro(args.model, args.voices)
    manifest = {}
    made = 0
    with tempfile.TemporaryDirectory() as tmp:
        for p in phrases:
            key = p['key']
            if not key or key in manifest:
                continue
            file = clip_name(key)
            manifest[key] = file
            target = os.path.join(out_dir, file)
            if os.path.exists(target):
                continue
            speed = SPEED[p['speed']]
            if key in PHONICS:
                audio, rate = kokoro.create(PHONICS[key], voice=args.voice, speed=speed, is_phonemes=True)
            else:
                audio, rate = kokoro.create(p['text'], voice=args.voice, speed=speed, lang='en-gb')
            wav = os.path.join(tmp, 'clip.wav')
            sf.write(wav, audio, rate)
            to_mp3(wav, target)
            made += 1

    used = set(manifest.values())
    removed = 0
    for f in os.listdir(out_dir):
        if f.endswith('.mp3') and f not in used:
            os.remove(os.path.join(out_dir, f))
            removed += 1

    with open(manifest_path, 'w') as fh:
        json.dump(dict(sorted(manifest.items())), fh, indent=0)
    print(f'{len(manifest)} phrases, {made} recorded, {removed} removed')


if __name__ == '__main__':
    main()
