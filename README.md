Learning Cards

A learning app for young children (ages 4 to 7): reading, numbers, thinking games and play. It runs in a tablet or laptop browser, speaks every label aloud, and keeps each child's progress on the device only. Built with Vite, React and TypeScript, styled with the JAKBRAIN Plum and Cream design system in the _ds folder.

Run it locally: npm install, then npm run dev, then open the address it prints. npm run build makes the production files in dist.

What is in it
Seven areas with 42 activities: Letters (meet, trace, find, first sound, big and small, ABC order), Words (clap, sound out, build, missing sound, rhymes, word families, read and match, tricky words), Stories (clap and build sentences, six read-along stories with questions), Numbers (count, find, more or fewer, number line, adding, take away), Shapes (names, sides and corners, shape hunt, shadows), Thinking (patterns, odd one out, sorting, small to big, which one belongs) and Play (pop the letters, memory, copy the colours, music maker, drawing).

Where things live
src/data: all content. letters.ts, reading.ts, stories.ts, numbers.ts, shapes.ts, thinking.ts and play.ts hold the letters, words, sentences, stories and settings for each level; areas.ts lists the areas and activities; lessons.ts has the "Watch first" scripts; music.ts the tunes.
src/activities: one component per activity, registered in index.ts.
src/components: shared pieces. pictures.tsx holds the colour cartoon pictures (open the app at #/pictures to see them all), Geo.tsx and Shape.tsx draw shapes, ActivityFrame.tsx is the frame every activity uses.
src/screens: who's playing, home, area, reward and the parent corner.
src/lessons: the cartoon lesson player and its scenes.
src/speech.ts and src/sound.ts: voices, music and sound effects.
src/voice: the list of every spoken line (phrases.ts), the voice pack loader (packs.ts) and parents' own recordings (recordings.ts).
src/store.tsx: profiles, stars and settings, saved in localStorage.
src/update.ts: how the app moves to a new version.
_ds: the design system, copied verbatim. Its tokens are imported in src/styles/app.css.
reference: the original Clap Words and Clap Sentences prototypes.
docs/brief.md: the original build brief.

Parent corner
On the "Who is playing?" screen, press and hold the lock button at the top right for two seconds. A quick tap only says "Ask a grown-up". The parent corner has the voice switch, players (rename, change colour, add), stars per child and activity, and an Easy / Medium / Harder setting for each area. The settings for each level are in the files in src/data.

Characters, voices, music and lessons
Two guides lead the app: Jabari the lion and Jamila the owl (src/data/characters.ts). Jabari speaks with "Lewis", a British male voice, and Jamila with "Alice", a British female voice; both come from Kokoro, an open-source text-to-speech model (Apache 2.0 licence). Every line is pre-recorded in both voices (public/voice/lewis and public/voice/alice). At build time the clips are packed into about 15 files (scripts/voice/pack.mjs); the app downloads these packs itself, with retries, and keeps them on the device, so everything works offline. Jamila hosts Letters, Words and Thinking, Jabari hosts Stories, Numbers, Shapes and Play, and the other one cheers.
Background music and sound effects are made live by the app's own synthesiser (src/sound.ts); the tunes are note lists in src/data/music.ts.
Half of the activities (21) have a short "Watch first" cartoon lesson that plays the first time a child opens the activity and again from the clapperboard button. The scripts are in src/data/lessons.ts and the animated scenes in src/lessons/stages.tsx.
In the parent corner you can turn the voice, music and sound effects on or off, record each child's name and your own letter sounds. Your recordings stay on the tablet and replace the built-in versions. Anything without a recording uses the device's own voice.

After adding words, sentences or lesson lines to the data files, record the new phrases in both voices (existing clips are kept):
  node --experimental-strip-types --no-warnings scripts/voice/list-phrases.ts > phrases.json
  python scripts/voice/generate.py phrases.json --model kokoro-v1.0.int8.onnx --voices voices-v1.0.bin --voice bm_lewis
  python scripts/voice/generate.py phrases.json --model kokoro-v1.0.int8.onnx --voices voices-v1.0.bin --voice bf_alice
This needs Python with kokoro-onnx and soundfile installed, ffmpeg, and the two model files from https://github.com/thewh1teagle/kokoro-onnx/releases. See the top of scripts/voice/generate.py.

Updates
The installable part of the app is small (under 1 MB), so a new version arrives in seconds. It is switched in on the player or home screen, never in the middle of an activity, and the app checks for a new version each time it is opened. The parent corner shows the version and whether everything is saved for playing without internet, and has a Check for updates button.

Install on a tablet or phone
Open the app once while online and leave it open for a minute or two while the voices are saved (about 21 MB; the player screen shows the progress). On an iPad, tap Share, then Add to Home Screen. On Android, open the browser menu and choose Install app or Add to Home screen. It then opens full screen from its icon and works without internet. Updates are picked up automatically the next time it is opened online.

Hosting
Every push to main builds the app and publishes it to GitHub Pages through .github/workflows/deploy.yml. In the repository settings, under Pages, set Source to GitHub Actions once.

Privacy
There is no server. Children's names, stars and settings are stored in the browser on the device they were entered on and are never uploaded.
