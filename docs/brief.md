# Prompt for Claude Code — kids' learning app

Copy everything below the line into Claude Code. Put the design-system folder (`_ds/…`) and the two reference files (`Clap Words.dc.html`, `Clap Sentences.dc.html`) in the repo first, so it can read them.

---

Build a learning app for my children (ages 4–7, main user is 5). It should run on a tablet or laptop browser and work offline after first load (PWA). I'm the parent. Kids use it with me or on their own.

## Tech
- Vite + React + TypeScript. No backend. Save progress in localStorage, with one profile per child.
- Speech uses the Web Speech API (`speechSynthesis`), en-GB voice when one is available, rate about 0.8. Every piece of on-screen text a child needs to read must also have a "hear it" tap.
- Make it installable (manifest + service worker) so it opens full-screen on a tablet.
- Content lives in plain JSON/TS data files, so I can add words, sentences and questions without touching components.

## Design system — mandatory
Use my JAKBRAIN Plum & Cream design system in `_ds/jakbrain-plum-cream-design-system-5dd070bb-…/`. Read `readme.md`, the `tokens/*.css` files and `styles.css` before writing UI, and import the token CSS globally. Use the real `var(--*)` names from those files. Don't invent new ones.

Key rules:
- Base colours: cream `#F6EFDF` (light theme, the default for this app) and plum `#5A0B4D`. Cards sit on `#FCF8EF`.
- Gold (`#A8781A` on cream, `#D4A843` on plum) is for lines and geometry only, never for text or large fills. That means hairline borders, dot grids, outline circles and secondary-button outlines.
- Text on cream: plum headings and `#1C1119` body. Text on plum: cream.
- Module colours (`--module-1`…`--module-8`) are the only bright fills. Use them for rewards, lit-up counters and activity tiles.
- Fonts: Playfair Display for titles (one italic word), DM Sans for everything a child reads (big, clear letterforms).
- Radii: 12 for cards, 20 for panels, full for buttons. Shadows are plum-tinted.
- Background: flat cream with a 24px gold dot grid and large outline circles bleeding off the edges. No gradients, photos or emoji.
- Icons: Lucide, 1.5px stroke.

## Kid-friendly UX rules
- Tap targets at least 64px. Main action buttons are big pills.
- Very little reading in the UI itself. Use icons plus spoken labels.
- No failure states. A wrong answer gets a gentle wobble and "Try again". A right answer gets a colour pop and spoken praise.
- One task on screen at a time. Next/Back are always in the same place. Keyboard: Space is the main action, arrows move between items.
- Short sessions: 5–8 items per round, then a reward screen that adds a star to the child's collection.
- No ads, no links out, no timers that pressure the child.

## Structure
1. **Who's playing?** Pick a child profile (name + module colour). A parent can add or rename profiles.
2. **Home**: a grid of activity areas, each a large tile in its module colour.
3. **Area pages** list that area's activities with progress stars.
4. **Parent corner** (behind a simple hold-to-open gate): progress per child and area, a difficulty level per area, and a voice on/off switch.

## Activity areas (build 2–3 activities each, easy → harder)
**Reading**
- Clap the syllables: port `Clap Words.dc.html` exactly as it behaves now (tap Clap once per syllable, circles light up, "Clap with me" demo).
- Clap the words in a sentence: port `Clap Sentences.dc.html` ("The girl is ill." etc.).
- Sound it out: CVC words (c-a-t), tap each letter to hear its sound, then blend.
- First sound match: hear a word, pick the letter it starts with.

**Maths / numbers**
- Count the dots (1–10), tap the right numeral.
- More or fewer: compare two groups.
- Number line hop: what comes next or before.
- Simple adding to 10 with countable objects.

**Logic**
- What comes next: colour/shape patterns (AB, AAB, ABC).
- Odd one out.
- Sort by colour, size or shape (drag to bins).

**Play / games**
- Memory match (pairs of words or numbers).
- Simon-style sequence copying with coloured pads.
- A "free play" drawing or stamp board.

## Build order
1. App shell, design tokens, profiles, home, routing, the speech helper, and the reward screen.
2. Port the two clap activities and use them as the template for every other activity: one shared `ActivityFrame` component (title, item counter, big main action, Next/Back, feedback).
3. Add the other activities one area at a time, each driven by a data file.
4. Parent corner and offline/PWA.

After each step, run the app and check it at 768px (tablet) and 1280px. Then tell me what to try.
