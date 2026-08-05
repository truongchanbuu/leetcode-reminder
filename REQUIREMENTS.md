# PatternQueue — Product and Technical Requirements

## 1. Product objective

Build a Chromium extension that manages a structured LeetCode practice routine
so the user only needs to open the daily queue, solve the assigned problem, and
rate the result.

The system must combine:

- popular interview-pattern coverage;
- the established NeetCode 150 curriculum;
- spaced repetition;
- automatic attempt history;
- low-friction daily use;
- zero recurring infrastructure cost.

## 2. Target user

A developer who already knows basic data structures and algorithms and wants to
prepare for coding interviews in Java without manually managing spreadsheets,
review dates, or problem selection.

## 3. Product principles

1. **Solve-first:** the Today screen is the primary workflow.
2. **Local-first:** no account, server, telemetry, or subscription.
3. **Finite curriculum:** use the complete NeetCode 150 instead of inventing a
   competing problem list.
4. **Review before novelty:** due reviews take priority over new problems.
5. **One explicit judgment:** the user rates recall after each accepted attempt.
6. **Pattern progression:** new problems follow established public pattern
   categories.
7. **Manual fallback:** DOM automation must never be the only completion path.
8. **Useful gamification:** reward delayed independent recall rather than
   repeated clicks or copied solutions.
9. **Visible progression:** use tiered Challenges, clear next goals, and
   low-stakes recognition without turning practice into reward farming.
10. **Contextual reflection:** keep short problem-specific notes beside the
    solving workflow instead of requiring a separate note-management system.

## 4. Curriculum

### 4.1 Pattern taxonomy

The initial curriculum uses 18 common categories:

1. Arrays & Hashing
2. Two Pointers
3. Sliding Window
4. Stack
5. Binary Search
6. Linked List
7. Trees
8. Heap / Priority Queue
9. Backtracking
10. Tries
11. Graphs
12. Advanced Graphs
13. 1-D Dynamic Programming
14. 2-D Dynamic Programming
15. Greedy
16. Intervals
17. Math & Geometry
18. Bit Manipulation

### 4.2 Problem dataset

The bundled curriculum contains exactly the 150 problems in the public
NeetCode 150 list, preserving category membership and order.
Every problem must contain:

- numeric LeetCode ID;
- canonical slug;
- title;
- difficulty;
- one primary pattern;
- order within the pattern.

No problem statement, test data, editorial, or solution is bundled.

Seven items are LeetCode Premium-only. Their primary practice action must open
the corresponding public NeetCode problem while retaining manual attempt
tracking.

### 4.3 Attribution

The README and UI must attribute the public NeetCode 150 curriculum and must
not imply affiliation with NeetCode or LeetCode.

## 5. Functional requirements

### FR-1: Initial state

- On first install, create schema version 2 state.
- Migrate schema version 1 state to version 2 without losing progress,
  attempts, settings, or active attempts.
- Default to one new problem and at most three reviews per day.
- Default to pattern-roadmap ordering.
- Keep reminders disabled until explicitly enabled.

### FR-2: Daily queue

The queue must:

1. select overdue reviews, oldest due first;
2. select reviews due today;
3. cap reviews using `maxReviewsPerDay`;
4. suppress new problems when the review cap is full;
5. otherwise add up to `newProblemsPerDay`;
6. avoid selecting already accepted new problems;
7. avoid re-showing a review completed on the same local date.

### FR-3: Pattern mode

- Order patterns according to the bundled roadmap.
- Within a pattern, order problems from canonical/easier to more advanced.
- Select the first unseen problem.
- Show the pattern name in Today and Patterns views.

### FR-4: Mixed mode

- Select unseen problems from the least-practiced pattern first.
- Do not alter review priority.
- Label the new attempt as `mixed`.

### FR-5: Open problem

- `Solve next` must open the LeetCode URL, or the public NeetCode equivalent
  when the LeetCode item is Premium-only.
- Every queue card must also provide an open action.

### FR-6: Attempt start and active time

- Opening a known curriculum problem creates or resumes an active attempt.
- Count time only while the document is visible.
- Save a heartbeat at least every 15 seconds.
- Survive popup closure and normal page refreshes through local state.

### FR-7: Submission tracking

- Listen for clicks on the LeetCode Submit control.
- Best-effort detect:
  - Accepted
  - Wrong Answer
  - Runtime Error
  - Time Limit Exceeded
  - Compile Error
- Increment total submission count for each detected result.
- Track common failure categories separately.
- Never scan or store editor code.

### FR-8: Completion rating

After Accepted, request:

- help usage: `None`, `Hint`, or `Solution`;
- recall rating: `Again`, `Hard`, `Good`, or `Easy`.

The widget must also expose **Rate result** as a manual fallback.

### FR-9: Review scheduling

- Use FSRS with requested retention 0.90.
- Disable short-term minute-level learning steps because a coding problem is a
  long practice unit.
- Cap the maximum interval at 180 days.
- Store the resulting FSRS card and due timestamp locally.
- Persist FSRS `due` and `last_review` fields as ISO strings so browser storage
  cannot convert `Date` instances into unusable objects.
- When loading an older corrupted FSRS card, reconstruct its date fields from
  the authoritative `dueAt`, `lastAttemptAt`, and `firstSeenAt` timestamps.
- A problem may be marked mastered after at least two independent `Good/Easy`
  accepted attempts and a scheduled interval of at least 14 days.
- Hint/solution-assisted attempts must not increment independent-solve count.
- Once mastery is first reached, preserve `masteredAt` as a permanent
  progression milestone even if a later weak recall returns the active status
  to reviewing.

### FR-10: Abandon attempt

- Allow the user to save an attempt as abandoned.
- Preserve duration, submissions, failure counts, and help usage.
- Do not schedule an accepted review.
- Keep an unseen abandoned problem eligible as a future new problem.

### FR-11: History

For every completed or abandoned attempt, store:

- unique attempt ID;
- problem and pattern;
- start and finish time;
- visible active seconds;
- new/review/mixed mode;
- result;
- submission and failure counts;
- compile-error count;
- rating when available;
- help usage;
- next review timestamp when available.
- XP earned by the attempt.

Display at least the 80 most recent attempts.

### FR-12: Pattern progress

For each pattern display:

- solved unique problems / total bundled problems;
- percentage completion;
- number of mastered problems;
- concise pattern description.

### FR-13: Settings

Allow configuration of:

- zero to three new problems per day;
- one to six reviews per day;
- pattern or mixed new-problem ordering;
- reminder enabled/disabled;
- reminder hour.

### FR-14: Reminder

- When enabled, create one daily local browser alarm.
- If the current queue is non-empty, create a notification with queue count.
- Do not notify when the queue is empty.

### FR-15: Backup

- Export complete state in backup envelope format version 2:
  `formatVersion`, `appVersion`, `curriculumVersion`, `exportedAt`, and `state`.
- Import backup envelope format version 2.
- Preserve import compatibility with a legacy raw schema-version 1 state.
- Reject malformed or unsupported backups.
- Reset only PatternQueue data after explicit confirmation.

### FR-16: XP and learning ranks

- Award XP only for the first eligible attempt on a problem per local day.
- An attempt is eligible only when the problem is new or its review is due.
- Base XP: Easy 20, Medium 35, Hard 50.
- Rating multipliers: Again 0.15, Hard 0.60, Good 1.00, Easy 1.10.
- Help multipliers: None 1.00, Hint 0.60, Solution 0.20.
- Due reviews receive a 1.20 multiplier.
- Abandoned and early repeated attempts earn zero XP.
- Rank never drops because XP, solved milestones, and first-mastery milestones
  are permanent.

Rank thresholds:

| Rank | XP | Unique solved | Ever mastered |
| --- | ---: | ---: | ---: |
| Iron | 0 | 0 | 0 |
| Bronze | 500 | 10 | 0 |
| Silver | 1,200 | 25 | 0 |
| Gold | 2,200 | 50 | 0 |
| Platinum | 3,500 | 75 | 0 |
| Emerald | 5,000 | 100 | 0 |
| Diamond | 7,000 | 150 | 0 |
| Master | 10,000 | 150 | 50 |
| Grandmaster | 12,500 | 150 | 100 |
| Challenger | 15,000 | 150 | 150 |

### FR-17: Rank-up celebration

- Detect a promotion by comparing the rank immediately before and after an
  eligible rated attempt.
- Show the celebration only when the rank actually changes.
- Present a full-screen modal above the LeetCode or NeetCode page.
- Use a dark blue-black backdrop, central winged crystal emblem, rank-specific
  glow, radial flare, rotating light rays, particles, promotion text, total XP,
  and a bordered confirmation button.
- Play a short ascending synthesized chime after the user-triggered rating.
- Do not bundle or copy Riot Games artwork, rank icons, logos, animation files,
  or audio.
- Allow dismissal with the button, Enter, or Escape.
- Honor `prefers-reduced-motion`.
- Provide a Settings preview action that displays the next-rank celebration on
  an active tracked problem page without changing XP or progress.

### FR-18: Tiered Challenges and achievements

- Derive Challenge progress from existing attempts and permanent mastery
  milestones; do not add a second mutable source of truth.
- Group Challenges into five meaningful categories:
  Pathfinding, Recall, Precision, Discipline, and Conquest.
- Give every Challenge seven tiers:
  Iron, Bronze, Silver, Gold, Platinum, Diamond, and Master.
- Award Challenge Score according to tier:
  5, 10, 15, 20, 30, 40, and 60 points respectively.
- Display the current tier, exact value, next target, progress bar, token, and
  category for each Challenge.
- Unlock a title on the Master tier.
- After an attempt crosses one or more tiers, show a full-screen progression
  carousel after any rank-promotion celebration.
- Challenge tiers and score never regress because every metric is based on
  monotonic history or permanent first-mastery records.
- Honor `prefers-reduced-motion` and support Enter/Escape dismissal.

Challenge catalog:

| Challenge | Category | Metric | Iron → Master thresholds | Master title |
| --- | --- | --- | --- | --- |
| Problem Solver | Pathfinding | Unique accepted problems | 1, 10, 25, 50, 75, 100, 150 | Roadmap Finisher |
| Pattern Scout | Pathfinding | Patterns with an accepted solve | 1, 3, 6, 9, 12, 15, 18 | Pattern Cartographer |
| Memory Forge | Recall | Problems ever mastered | 1, 5, 15, 30, 60, 100, 150 | Memory Smith |
| Recall Ace | Recall | Due Easy reviews without help | 1, 5, 15, 30, 60, 120, 250 | Total Recall |
| Independent Mind | Precision | Good/Easy solves without help | 1, 10, 25, 50, 100, 250, 500 | Independent Thinker |
| Clean Execution | Precision | Independent one-submission solves without errors | 1, 5, 10, 25, 50, 100, 200 | One Shot |
| Comeback | Precision | Independent recoveries after Again/abandon | 1, 3, 5, 10, 20, 40, 75 | Unbreakable |
| Review Vanguard | Discipline | Eligible reviews completed when due | 1, 10, 25, 50, 100, 250, 500 | Review Vanguard |
| Steady Flame | Discipline | Best accepted-day streak | 2, 3, 7, 14, 30, 60, 100 | Unfading Flame |
| Hard Conqueror | Conquest | Hard problems ever mastered | 1, 3, 5, 8, 12, 17, 21 | Hard Mode |
| Pattern Conqueror | Conquest | Fully mastered patterns | 1, 2, 4, 6, 9, 13, 18 | Pattern Sovereign |

### FR-19: Per-problem notes

- Provide a note editor inside the widget for the currently tracked problem.
- Store one plain-text note per curriculum problem in `chrome.storage.local`.
- Autosave after 700 ms of inactivity and save again when the editor loses
  focus or the user presses Ctrl/Command + Enter.
- Preserve whitespace and line breaks, normalize Windows line endings, and
  limit each note to 5,000 characters.
- Treat an empty or whitespace-only note as a request to remove that note.
- Show `Note ✓` in the widget and `note saved` in the Today queue when a note
  exists.
- Include notes in JSON export and import.
- Notes must not modify FSRS progress, attempt mode, XP, rank, or Challenges.
- The extension must not read the LeetCode code editor; only text explicitly
  entered in PatternQueue may be stored as a note.

### FR-20: Extension brand icon

- Use an original PatternQueue mark that combines algorithm-path progression,
  a mastery crystal, and a completion marker.
- Keep a compact silhouette that remains identifiable at 16 pixels.
- Provide PNG assets at 16, 32, 48, and 128 pixels.
- Declare the complete icon set in both the Manifest V3 root `icons` field and
  the action `default_icon` field.
- Use the 128-pixel icon for browser reminder notifications.
- Preserve the generated source and a 1,024-pixel transparent master in the
  source package.
- Do not reproduce Riot Games, League of Legends, LeetCode, or NeetCode logos,
  rank crests, trademarks, or artwork.

## 6. User interface requirements

### 6.1 Popup tabs

The popup must contain:

- **Today**
- **Patterns**
- **Challenges**
- **History**
- **Settings**

### 6.2 Today

Show:

- current rank, XP, and next-rank requirements;
- number waiting;
- number completed today;
- completion percentage;
- ordered queue;
- problem difficulty and mode;
- primary pattern;
- prominent `Solve next` action.

### 6.3 LeetCode widget

Show:

- PatternQueue identity;
- problem title and pattern;
- active timer;
- submission count;
- current tracking status;
- Rate result;
- open and edit the current problem note;
- Abandon;
- minimization control.
- XP earned after saving a rated attempt.

The widget must use prefixed CSS names to minimize conflicts with LeetCode.

## 7. Data model

Persistent root:

```ts
interface AppState {
  schemaVersion: 2;
  settings: Settings;
  progress: Record<string, ProblemProgress>;
  attempts: Attempt[];
  activeAttempts: Record<string, ActiveAttempt>;
  notes: Record<string, ProblemNote>;
}
```

The complete TypeScript definitions are authoritative in `src/types.ts`.

Backup envelope:

```ts
interface BackupEnvelopeV2 {
  formatVersion: 2;
  appVersion: string;
  curriculumVersion: "neetcode150-2026-07";
  exportedAt: string;
  state: AppState;
}
```

## 8. Architecture

### 8.1 Popup

Responsibilities:

- calculate and present queue;
- open problem tabs;
- display patterns/challenges/history;
- edit settings;
- import/export/reset.

### 8.2 Content script

Responsibilities:

- identify curriculum problem from URL slug;
- show widget;
- track visible time;
- observe submission results;
- collect explicit rating/help usage;
- edit and autosave the current problem note;
- send domain messages to background.

### 8.3 Background service worker

Responsibilities:

- serialize all state mutations;
- validate and persist note updates;
- manage active attempt lifecycle;
- apply FSRS scheduling;
- configure reminders;
- emit notifications.

### 8.4 Storage

- Use `chrome.storage.local`.
- Store one schema-versioned root object.
- Do not use cookies, remote APIs, IndexedDB, or a backend in version 0.5.

## 9. Non-functional requirements

### NFR-1: Privacy

- No analytics or tracking SDK.
- No source-code capture.
- No external network calls from extension logic.
- Host access limited to LeetCode and NeetCode problem pages.

### NFR-2: Cost

- No server or database.
- No paid API.
- No mandatory browser-store publication.

### NFR-3: Performance

- Bundle should remain lightweight.
- Timer must not write storage every second.
- Heartbeat interval must be 15 seconds or slower.
- Mutation observation must only inspect candidate result containers.

### NFR-4: Compatibility

- Manifest V3.
- Chrome/Edge target: Chromium 120 or newer.
- Node.js 20 or newer for development.

### NFR-5: Maintainability

- Strict TypeScript.
- Separate curriculum, state, domain, UI, and platform integration.
- Unit-test curriculum invariants, queue priority, and scheduler behavior.
- Preserve schema version for future migrations.

## 10. Acceptance criteria

Version 0.6.1 is acceptable when:

1. `npm run check` passes.
2. Build output loads unpacked in Chrome/Edge without manifest errors.
3. Fresh install shows Contains Duplicate as the first new problem.
4. Solve next opens the correct LeetCode URL.
5. Known problem pages show the widget.
6. Manual rating creates history and a future due date.
7. A due review appears before a new problem.
8. Three due reviews suppress the default new problem.
9. Patterns view contains 18 patterns and totals 150 problems.
10. Curriculum category totals match the NeetCode 150 list.
11. An eligible independent attempt earns XP and an early repeat earns zero.
12. Challenger requires 15,000 XP and 150 first-mastery milestones.
13. Exported state can be reset and re-imported.
14. Crossing a rank boundary returns a promotion and displays the celebration.
15. A normal attempt within the same rank does not display the celebration.
16. Challenges view contains all 11 tiered Challenges and five categories.
17. A clean independent first solve unlocks the expected four Iron Challenges.
18. Early reviews with zero XP do not advance due-review Challenges.
19. A newly crossed Challenge tier displays the progression reveal.
20. Exported backup declares format, app, curriculum, and state schema versions.
21. A schema version 1 state migrates to schema version 2 without losing data.
22. Notes autosave per problem, survive reload, and remain independent from
    scheduling and attempt progress.
23. Blank notes are removed and notes longer than 5,000 characters are capped.
24. Exported backups include notes and legacy schema version 1 backups remain
    importable.
25. Manifest, package metadata, backup metadata, README, and release archives
    identify version 0.6.1.
26. The manifest declares valid 16/32/48/128-pixel extension and action icons.
27. The 16-pixel icon remains visually identifiable and all icon PNGs preserve
    transparent rounded corners.
28. Reminder notifications use the 128-pixel PatternQueue icon.
29. A scheduled card survives a JSON/browser-storage round trip and can be
    reviewed again without an invalid-date error.
30. Legacy cards whose `due` or `last_review` fields became empty objects are
    repaired from the progress timestamps before FSRS scheduling.

## 11. Known risks

### LeetCode DOM changes

Automatic submission detection depends on stable result selectors. Mitigation:
keep manual rating available and isolate selector logic in `src/content.ts`.

### Self-rating quality

FSRS cannot infer whether a solution was copied. Mitigation: explicitly capture
help usage and explain rating meanings in the UI.

### Review overload

Full problem reviews are expensive. Mitigation: cap daily reviews and stop new
problems when that cap is reached.

### Curriculum ownership

Public list metadata can change. Mitigation: bundle a versioned snapshot of
NeetCode 150 metadata with attribution, category-count tests, and no copied
editorial content.

## 12. Future scope

Potential later-version items:

- editable/custom curriculum import;
- filters and pattern-specific practice;
- optional hidden-pattern interview mode;
- explicit attempt time limit;
- code-free quick-recall reviews;
- browser sync controlled by the user;
- schema migrations;
- Playwright extension integration tests.

Excluded unless separately approved:

- AI solution analysis;
- cloud accounts;
- social features;
- scraping LeetCode history;
- storing editor source code;
- company-question recommendations;
- mobile application.
