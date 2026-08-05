# PatternQueue for LeetCode

PatternQueue is a local-first Chrome/Edge extension that turns popular coding
interview problems into a small daily queue. It follows the complete NeetCode
150 curriculum, prioritizes due reviews, tracks attempt history, schedules
future reviews with FSRS, and turns long-term recall into XP and learning ranks.
Version 0.6.1 fixes FSRS date persistence across browser-storage round trips
while retaining the PatternQueue identity introduced in version 0.6.

The daily workflow is intentionally small:

1. Open PatternQueue.
2. Click **Solve next**.
3. Solve and submit on LeetCode.
4. Rate the attempt once.

## Included features

- The complete NeetCode 150: 150 problems across 18 roadmap patterns.
- Original PatternQueue logo combining an algorithm path, mastery crystal, and
  completion marker, supplied at 16, 32, 48, and 128 pixels.
- Pattern roadmap and mixed-practice ordering.
- Daily queue with overdue reviews first.
- Automatic pause of new problems when reviews reach the configured cap.
- LeetCode page widget with visible-active-time tracking.
- Best-effort automatic detection of Accepted, Wrong Answer, Runtime Error,
  Time Limit Exceeded, and Compile Error.
- One-click `Again / Hard / Good / Easy` review rating.
- `None / Hint / Solution` help disclosure.
- A local note editor for each problem, with autosave, a 5,000-character limit,
  and a saved-note indicator in the daily queue.
- FSRS review scheduling.
- Attempt history: duration, submission count, help usage, outcome, and rating.
- Pattern progress.
- XP awarded only for a new problem or a review that is actually due.
- Ten permanent learning ranks from Iron to Challenger.
- Challenger gate: 15,000 XP, all 150 solved, and all 150 mastered.
- Eleven tiered Challenges across Pathfinding, Recall, Precision, Discipline,
  and Conquest, each progressing from Iron through Master.
- Challenge Score, collectible tokens, next milestones, and five Master titles.
- Full-screen Challenge progression carousel after a newly crossed tier.
- Full-screen promotion celebration inspired by competitive-game rank screens:
  the prior crest breaks into metallic shards, energy converges, and the new
  rank emblem is forged amid rank-colored rays, particles, flare, and a
  synthesized chime.
- Promotion dialog supports keyboard dismissal and reduced-motion preferences.
- Settings includes a preview action so the effect can be tested without
  waiting for the next promotion.
- Optional daily reminder.
- Versioned JSON backup import/export, with legacy schema-version 1 import.
- No backend, account, analytics, or cloud storage.

## Install for development

Requirements:

- Node.js 20 or newer
- npm
- Chrome, Edge, or another Chromium browser

```bash
npm install
npm run check
```

Then:

1. Open `edge://extensions` or `chrome://extensions`.
2. Enable **Developer mode**.
3. Choose **Load unpacked**.
4. Select the generated `dist` directory.
5. Pin PatternQueue to the toolbar.

## Production package

```bash
npm run package
```

The installable archive is created at:

```text
release/patternqueue-v0.6.1.zip
```

Extract it before using **Load unpacked**. Chrome Web Store publication requires
creating a developer account and uploading the ZIP separately.

## Commands

```bash
npm run typecheck   # TypeScript validation
npm test            # Unit tests
npm run build       # Build dist/
npm run check       # Typecheck + tests + build
npm run package     # Build and create release ZIP
```

## Project structure

```text
src/
  background.ts     Background messages, alarms, notifications
  challenges.ts     Challenge definitions, progress, score, and unlocks
  content.ts        Problem widget, note editor, and submission detection
  curriculum.ts     Pattern metadata, indexes, and practice links
  domain.ts         Attempt lifecycle
  neetcode150.ts    Exact NeetCode 150 problem metadata and order
  popup.ts          Today, Patterns, Challenges, History, Settings UI
  ranks.ts          XP calculation and Iron-to-Challenger progression
  state.ts          Storage, queue selection, FSRS scheduling
  types.ts          Domain types
public/
  manifest.json
  icons/
    icon-16.png
    icon-32.png
    icon-48.png
    icon-128.png
  popup.html
  popup.css
  content.css
assets/
  patternqueue-logo-source.png
  patternqueue-logo-1024.png
test/
  challenges.test.ts
  curriculum.test.ts
  manifest.test.ts
  notes.test.ts
  queue.test.ts
  scheduler.test.ts
```

## Privacy and permissions

PatternQueue stores its state in `chrome.storage.local`. It does not send
notes, progress, or browsing data to a server.

Permissions:

- `storage`: save settings, notes, progress, attempts, and FSRS cards.
- `alarms` and `notifications`: optional daily reminder.
- `tabs`: open the selected practice problem.
- `https://leetcode.com/*`: display the problem-page widget and observe
  submission status.
- `https://neetcode.io/*`: provide the same manual tracking widget for the
  seven NeetCode 150 problems that are LeetCode Premium-only.

The extension does not read or store code from the LeetCode editor. It stores
only note text entered explicitly in PatternQueue. The curriculum contains
only public identifiers, titles, pattern labels, and URLs.

## Brand icon

The icon is an original mark designed for PatternQueue. Its branching path
represents algorithm patterns and queue progression, the central crystal
represents mastery and ranks, and the completion marker represents a finished
review. The silhouette subtly forms a `P` while remaining recognizable at
toolbar size. It does not reproduce any Riot Games, League of Legends,
LeetCode, or NeetCode logo, rank crest, or trademark.

## Known limitation

LeetCode and NeetCode are dynamic applications and may change their DOM.
Submission detection is therefore best-effort. The **Rate result** button
remains available as a manual fallback even if automatic detection stops
working.

## Source inspiration

The bundled metadata follows the public NeetCode 150 curriculum and links back
to the original practice sites. PatternQueue is an independent project and is
not affiliated with LeetCode or NeetCode. No problem statement, editorial, or
solution is bundled.

Rank-up visuals and sound are independently implemented with CSS and the Web
Audio API. No Riot Games artwork, logo, icon, animation file, or audio asset is
included.

The progression structure takes inspiration from Riot's public
[Challenges walkthrough](https://www.leagueoflegends.com/en-au/news/game-updates/challenges-walkthrough/).
The promotion choreography is informed by Riot motion designer Ji Kim's public
[Rank Promotion 3.0 case study](https://www.behance.net/gallery/174218721/League-of-Legends-Rank-Promotion-30):
old crest fragments, an energy core, then the newly forged emblem. All rendered
shapes, colors, motion, and sounds in this extension are original code.

See [REQUIREMENTS.md](REQUIREMENTS.md) for the complete product and technical
specification.
