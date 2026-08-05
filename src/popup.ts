import {
  PATTERNS,
  PROBLEMS,
  patternById,
  problemById,
  problemUrl
} from "./curriculum";
import {
  attemptsOnDate,
  buildDailyQueue,
  createInitialState,
  loadState,
  migrateState,
  saveState
} from "./state";
import { getRankProgress } from "./ranks";
import {
  CHALLENGE_CATEGORIES,
  getChallengeSummary,
  type ChallengeProgress
} from "./challenges";
import type { AppState, Attempt, QueueItem } from "./types";

type TabId = "today" | "patterns" | "challenges" | "history" | "settings";

const app = document.querySelector<HTMLElement>("#app")!;
const APP_VERSION = chrome.runtime.getManifest().version;
const BACKUP_FORMAT_VERSION = 2;
const CURRICULUM_VERSION = "neetcode150-2026-07";
let activeTab: TabId = "today";
let state = createInitialState();

void initializePopup();

async function initializePopup(): Promise<void> {
  state = await loadState();
  await render();
}

async function render(): Promise<void> {
  state = await loadState();
  app.innerHTML = `
    <header class="app-header">
      <div class="brand-mark">P</div>
      <div>
        <h1>PatternQueue</h1>
        <p>NeetCode 150. Deliberate review.</p>
      </div>
    </header>
    <nav class="tabs" aria-label="Sections">
      ${tabButton("today", "Today")}
      ${tabButton("patterns", "Patterns")}
      ${tabButton("challenges", "Challenges")}
      ${tabButton("history", "History")}
      ${tabButton("settings", "Settings")}
    </nav>
    <section class="view">
      ${renderActiveView(state)}
    </section>
  `;
  bindEvents();
}

function tabButton(id: TabId, label: string): string {
  return `<button type="button" data-tab="${id}" class="${activeTab === id ? "is-active" : ""}">${label}</button>`;
}

function renderActiveView(currentState: AppState): string {
  switch (activeTab) {
    case "patterns":
      return renderPatterns(currentState);
    case "history":
      return renderHistory(currentState);
    case "challenges":
      return renderChallenges(currentState);
    case "settings":
      return renderSettings(currentState);
    default:
      return renderToday(currentState);
  }
}

function renderChallenges(currentState: AppState): string {
  const summary = getChallengeSummary(currentState);
  const scorePercent = Math.round((summary.score / summary.maxScore) * 100);

  return `
    <div class="challenge-hero">
      <div class="challenge-crystal">
        <span>${summary.score}</span>
      </div>
      <div>
        <span class="eyebrow">Challenge score</span>
        <h2>${summary.rankedChallenges}/${summary.progress.length} ranked</h2>
        <p>${summary.masteredChallenges} Master · ${scorePercent}% total score</p>
      </div>
    </div>
    <div class="challenge-category-strip">
      ${Object.entries(CHALLENGE_CATEGORIES)
        .map(
          ([id, category]) => `
            <span class="challenge-category category-${id}" title="${escapeHtml(category.description)}">
              ${escapeHtml(category.name)}
            </span>
          `
        )
        .join("")}
    </div>
    <div class="challenge-list">
      ${summary.progress.map(renderChallengeCard).join("")}
    </div>
  `;
}

function renderChallengeCard(item: ChallengeProgress): string {
  const tierId = item.tier?.id ?? "locked";
  const tierName = item.tier?.name ?? "Unranked";
  const target = item.nextThreshold ?? item.value;
  const nextCopy = item.nextTier
    ? `${item.value}/${target} ${item.definition.unit} · next ${item.nextTier.name}`
    : `${item.value} ${item.definition.unit} · title: ${item.definition.masterTitle}`;

  return `
    <article class="challenge-card tier-${tierId}">
      <div class="challenge-token">
        <span>${escapeHtml(item.definition.token)}</span>
      </div>
      <div class="challenge-main">
        <div class="challenge-title-row">
          <strong>${escapeHtml(item.definition.name)}</strong>
          <span>${escapeHtml(tierName)} · ${item.points} pts</span>
        </div>
        <small>${escapeHtml(item.definition.description)}</small>
        <div class="challenge-track">
          <span style="width:${item.progressPercent}%"></span>
        </div>
        <small>${escapeHtml(nextCopy)}</small>
      </div>
    </article>
  `;
}

function renderToday(currentState: AppState): string {
  const queue = buildDailyQueue(currentState);
  const completedToday = attemptsOnDate(currentState.attempts).filter(
    (attempt) => attempt.result === "accepted"
  ).length;
  const totalToday = completedToday + queue.length;
  const percentage =
    totalToday === 0 ? 100 : Math.round((completedToday / totalToday) * 100);

  if (queue.length === 0) {
    return `
      ${renderRankCard(currentState)}
      <div class="today-summary">
        <span class="eyebrow">Today</span>
        <h2>Queue complete</h2>
        <p>You have no reviews or new problems waiting.</p>
      </div>
      <div class="empty-state">
        <div class="completion-ring">✓</div>
        <strong>Good work.</strong>
        <span>Come back tomorrow for the next scheduled session.</span>
      </div>
    `;
  }

  return `
    ${renderRankCard(currentState)}
    <div class="today-summary">
      <span class="eyebrow">Today</span>
      <div class="summary-row">
        <div>
          <h2>${queue.length} problem${queue.length === 1 ? "" : "s"} waiting</h2>
          <p>${completedToday} completed today</p>
        </div>
        <strong>${percentage}%</strong>
      </div>
      <div class="progress-track"><span style="width:${percentage}%"></span></div>
    </div>
    <div class="queue">
      ${queue
        .map((item, index) => renderQueueItem(item, index, currentState))
        .join("")}
    </div>
    <button class="primary wide" type="button" data-solve="${queue[0]!.problem.id}">
      Solve next
    </button>
  `;
}

function renderRankCard(currentState: AppState): string {
  const rank = getRankProgress(currentState);
  const nextRequirement = rank.next
    ? `${rank.xp}/${rank.next.minXp} XP · ${rank.solved}/${rank.next.minSolved} solved · ${rank.mastered}/${rank.next.minMastered} mastered`
    : `${rank.xp} XP · all 150 mastered`;

  return `
    <article class="rank-card rank-${rank.current.id}">
      <div class="rank-emblem">${rank.current.name.slice(0, 1)}</div>
      <div class="rank-copy">
        <span class="eyebrow">Learning rank</span>
        <div class="rank-title">
          <strong>${rank.current.name}</strong>
          <span>${rank.xp.toLocaleString()} XP</span>
        </div>
        <div class="rank-track"><span style="width:${rank.xpPercentToNext}%"></span></div>
        <small>${rank.next ? `Next: ${rank.next.name} · ${nextRequirement}` : "Challenger achieved · keep your reviews alive"}</small>
      </div>
    </article>
  `;
}

function renderQueueItem(
  item: QueueItem,
  index: number,
  currentState: AppState
): string {
  const pattern = patternById.get(item.problem.primaryPattern);
  const modeLabel =
    item.mode === "review"
      ? `Review${item.dueAt && new Date(item.dueAt) < new Date() ? " · due" : ""}`
      : item.mode === "mixed"
        ? "Mixed"
        : "New";

  return `
    <article class="queue-item ${index === 0 ? "is-next" : ""}">
      <div class="queue-index">${index + 1}</div>
      <div class="queue-copy">
        <span class="queue-meta">
          <b class="mode mode-${item.mode}">${modeLabel}</b>
          ${escapeHtml(item.problem.difficulty)}
        </span>
        <strong>${escapeHtml(item.problem.title)}</strong>
        <small>
          ${escapeHtml(pattern?.name ?? item.problem.primaryPattern)}
          ${currentState.notes[String(item.problem.id)] ? " · note saved" : ""}
        </small>
      </div>
      <button class="icon-button" type="button" data-solve="${item.problem.id}" aria-label="Open problem">↗</button>
    </article>
  `;
}

function renderPatterns(currentState: AppState): string {
  const accepted = currentState.attempts.filter(
    (attempt) => attempt.result === "accepted"
  );
  const acceptedIds = new Set(accepted.map((attempt) => attempt.problemId));

  return `
    <div class="section-heading">
      <span class="eyebrow">Roadmap</span>
      <h2>18 popular patterns</h2>
      <p>The complete NeetCode 150 curriculum, in roadmap order.</p>
    </div>
    <div class="pattern-list">
      ${PATTERNS.map((pattern) => {
        const problems = PROBLEMS.filter(
          (problem) => problem.primaryPattern === pattern.id
        );
        const solved = problems.filter((problem) =>
          acceptedIds.has(problem.id)
        ).length;
        const mastered = problems.filter(
          (problem) =>
            currentState.progress[String(problem.id)]?.status === "mastered"
        ).length;
        const percentage = Math.round((solved / problems.length) * 100);
        return `
          <article class="pattern-card">
            <div class="pattern-order">${String(pattern.order).padStart(2, "0")}</div>
            <div class="pattern-main">
              <div class="pattern-title">
                <strong>${escapeHtml(pattern.name)}</strong>
                <span>${solved}/${problems.length}</span>
              </div>
              <div class="mini-track"><span style="width:${percentage}%"></span></div>
              <small>${mastered} mastered · ${escapeHtml(pattern.description)}</small>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;
}

function renderHistory(currentState: AppState): string {
  if (currentState.attempts.length === 0) {
    return `
      <div class="section-heading">
        <span class="eyebrow">History</span>
        <h2>No attempts yet</h2>
        <p>Your solve time, submissions, help usage, and rating will appear here automatically.</p>
      </div>
    `;
  }

  return `
    <div class="section-heading">
      <span class="eyebrow">History</span>
      <h2>${currentState.attempts.length} recorded attempts</h2>
    </div>
    <div class="history-list">
      ${currentState.attempts
        .slice(0, 80)
        .map((attempt) => renderAttempt(attempt))
        .join("")}
    </div>
  `;
}

function renderAttempt(attempt: Attempt): string {
  const problem = problemById.get(attempt.problemId);
  const pattern = patternById.get(attempt.patternId);
  const date = new Date(attempt.finishedAt);
  const minutes = Math.max(1, Math.round(attempt.activeSeconds / 60));
  const outcome =
    attempt.result === "accepted"
      ? attempt.rating ?? "accepted"
      : "abandoned";

  return `
    <article class="history-item">
      <div class="history-date">
        <strong>${date.toLocaleDateString(undefined, { day: "2-digit", month: "short" })}</strong>
        <span>${date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      <div class="history-copy">
        <div>
          <strong>${escapeHtml(problem?.title ?? `Problem ${attempt.problemId}`)}</strong>
          <span class="rating rating-${outcome}">${escapeHtml(outcome)}</span>
        </div>
        <small>
          ${escapeHtml(pattern?.name ?? attempt.patternId)} ·
          ${minutes}m · ${attempt.submissionCount} submit${attempt.submissionCount === 1 ? "" : "s"} ·
          help: ${attempt.helpUsage} · +${attempt.xpEarned ?? 0} XP
        </small>
      </div>
    </article>
  `;
}

function renderSettings(currentState: AppState): string {
  return `
    <div class="section-heading">
      <span class="eyebrow">Settings</span>
      <h2>Keep the workflow light</h2>
    </div>
    <form id="settings-form" class="settings-form">
      <label>
        <span>New problems per day</span>
        <select name="newProblemsPerDay">
          ${[0, 1, 2, 3]
            .map(
              (value) =>
                `<option value="${value}" ${currentState.settings.newProblemsPerDay === value ? "selected" : ""}>${value}</option>`
            )
            .join("")}
        </select>
      </label>
      <label>
        <span>Maximum reviews per day</span>
        <select name="maxReviewsPerDay">
          ${[1, 2, 3, 4, 5, 6]
            .map(
              (value) =>
                `<option value="${value}" ${currentState.settings.maxReviewsPerDay === value ? "selected" : ""}>${value}</option>`
            )
            .join("")}
        </select>
      </label>
      <label>
        <span>New-problem order</span>
        <select name="queueMode">
          <option value="pattern" ${currentState.settings.queueMode === "pattern" ? "selected" : ""}>Follow pattern roadmap</option>
          <option value="mixed" ${currentState.settings.queueMode === "mixed" ? "selected" : ""}>Mix weakest patterns</option>
        </select>
      </label>
      <label class="toggle-row">
        <span>
          Daily reminder
          <small>Remind me when the queue is waiting.</small>
        </span>
        <input name="dailyReminderEnabled" type="checkbox" ${currentState.settings.dailyReminderEnabled ? "checked" : ""}/>
      </label>
      <label>
        <span>Reminder hour</span>
        <select name="dailyReminderHour">
          ${Array.from({ length: 24 }, (_, value) => value)
            .map(
              (value) =>
                `<option value="${value}" ${currentState.settings.dailyReminderHour === value ? "selected" : ""}>${String(value).padStart(2, "0")}:00</option>`
            )
            .join("")}
        </select>
      </label>
      <button class="primary wide" type="submit">Save settings</button>
    </form>
    <div class="data-actions">
      <button type="button" data-action="export">Export backup</button>
      <button type="button" data-action="import">Import backup</button>
      <button type="button" data-action="preview-rankup">Preview rank-up</button>
      <button type="button" data-action="reset" class="danger">Reset data</button>
      <input id="import-file" type="file" accept="application/json" hidden />
    </div>
    <p class="source-note">
      Curriculum metadata follows the public NeetCode 150 roadmap. XP is awarded
      once per problem per day only when a new problem or scheduled review is due.
      PatternQueue stores links and metadata only.
    </p>
    <p class="version-note">
      PatternQueue v${escapeHtml(APP_VERSION)} · backup format ${BACKUP_FORMAT_VERSION} ·
      data schema ${currentState.schemaVersion} · ${CURRICULUM_VERSION}
    </p>
  `;
}

function bindEvents(): void {
  app.querySelectorAll<HTMLButtonElement>("[data-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      activeTab = button.dataset.tab as TabId;
      void render();
    });
  });

  app.querySelectorAll<HTMLButtonElement>("[data-solve]").forEach((button) => {
    button.addEventListener("click", () => {
      const problem = problemById.get(Number(button.dataset.solve));
      if (problem) {
        void chrome.tabs.create({ url: problemUrl(problem) });
      }
    });
  });

  app
    .querySelector<HTMLFormElement>("#settings-form")
    ?.addEventListener("submit", (event) => {
      event.preventDefault();
      void saveSettings(event.currentTarget as HTMLFormElement);
    });

  app
    .querySelector('[data-action="export"]')
    ?.addEventListener("click", exportBackup);
  app
    .querySelector('[data-action="import"]')
    ?.addEventListener("click", () =>
      app.querySelector<HTMLInputElement>("#import-file")?.click()
    );
  app
    .querySelector<HTMLInputElement>("#import-file")
    ?.addEventListener("change", (event) => {
      void importBackup(event);
    });
  app
    .querySelector('[data-action="reset"]')
    ?.addEventListener("click", () => {
      void resetData();
    });
  app
    .querySelector('[data-action="preview-rankup"]')
    ?.addEventListener("click", () => {
      void previewRankUp();
    });
}

async function previewRankUp(): Promise<void> {
  const rank = getRankProgress(state);
  const target = rank.next ?? rank.current;
  const [activeTab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });
  if (!activeTab?.id) {
    alert("Open a tracked LeetCode or NeetCode problem first.");
    return;
  }

  try {
    await chrome.tabs.sendMessage(activeTab.id, {
      type: "PREVIEW_RANK_UP",
      rankId: target.id,
      rankName: target.name,
      fromRankId: rank.current.id,
      xp: Math.max(rank.xp, target.minXp)
    });
    window.close();
  } catch {
    alert("Open a tracked LeetCode or NeetCode problem first.");
  }
}

async function saveSettings(form: HTMLFormElement): Promise<void> {
  const data = new FormData(form);
  state.settings = {
    newProblemsPerDay: Number(data.get("newProblemsPerDay")) as 0 | 1 | 2 | 3,
    maxReviewsPerDay: Number(data.get("maxReviewsPerDay")),
    queueMode: data.get("queueMode") === "mixed" ? "mixed" : "pattern",
    dailyReminderEnabled: data.get("dailyReminderEnabled") === "on",
    dailyReminderHour: Number(data.get("dailyReminderHour"))
  };
  await saveState(state);
  await chrome.runtime.sendMessage({ type: "REFRESH_ALARM" });
  activeTab = "today";
  await render();
}

function exportBackup(): void {
  const backup = {
    formatVersion: BACKUP_FORMAT_VERSION,
    appVersion: APP_VERSION,
    curriculumVersion: CURRICULUM_VERSION,
    exportedAt: new Date().toISOString(),
    state
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `patternqueue-backup-${new Date().toISOString().slice(0, 10)}.json`;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function importBackup(event: Event): Promise<void> {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  try {
    const raw = JSON.parse(await file.text()) as
      | unknown
      | {
          formatVersion?: number;
          state?: unknown;
        };
    const importedRaw =
      raw &&
      typeof raw === "object" &&
      "formatVersion" in raw &&
      raw.formatVersion === BACKUP_FORMAT_VERSION
        ? "state" in raw
          ? raw.state
          : undefined
        : raw;
    const imported = migrateState(importedRaw);
    if (!imported) {
      throw new Error("Unsupported backup format");
    }
    await saveState(imported);
    state = imported;
    activeTab = "today";
    await render();
  } catch (error) {
    alert(error instanceof Error ? error.message : "Could not import backup.");
  } finally {
    input.value = "";
  }
}

async function resetData(): Promise<void> {
  if (
    !confirm(
      "Reset all PatternQueue progress and attempt history? Export a backup first if you may need it."
    )
  ) {
    return;
  }
  state = createInitialState();
  await saveState(state);
  await chrome.runtime.sendMessage({ type: "REFRESH_ALARM" });
  activeTab = "today";
  await render();
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      })[character]!
  );
}
