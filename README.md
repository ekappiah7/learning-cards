Learning Cards

A learning app for young children (ages 4 to 7): reading, numbers, thinking games and play. It runs in a tablet or laptop browser, speaks every label aloud, and keeps each child's progress on the device only. Built with Vite, React and TypeScript, styled with the JAKBRAIN Plum and Cream design system in the _ds folder.

Run it locally: npm install, then npm run dev, then open the address it prints. npm run build makes the production files in dist.

Where things live
src/data: content and activity lists. Add words, sentences and questions here.
src/screens: the main screens (who's playing, home, area, reward).
src/components: shared pieces such as the top bar and hear-it button.
src/speech.ts: spoken output, using a British English voice when available.
src/store.tsx: profiles, stars and settings, saved in localStorage.
_ds: the design system, copied verbatim. Its tokens are imported in src/styles/app.css.
reference: the original Clap Words and Clap Sentences prototypes.
docs/brief.md: the full build brief.

Parent corner
On the "Who is playing?" screen, press and hold the lock button at the top right for two seconds. A quick tap only says "Ask a grown-up". The parent corner has the voice switch, players (rename, change colour, add), stars per child and activity, and an Easy / Medium / Harder setting for each area. The settings for each level are in the files in src/data.

Install on a tablet
Open the app once while online. On an iPad, tap Share, then Add to Home Screen. On Android, open the browser menu and choose Install app or Add to Home screen. It then opens full screen from its icon and works without internet. Updates are picked up automatically the next time it is opened online.

Hosting
Every push to main builds the app and publishes it to GitHub Pages through .github/workflows/deploy.yml. In the repository settings, under Pages, set Source to GitHub Actions once.

Privacy
There is no server. Children's names, stars and settings are stored in the browser on the device they were entered on and are never uploaded.
