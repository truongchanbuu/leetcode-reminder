import { neetcodeSlugToLeetcodeSlug, patternById } from "./curriculum";
import type {
  HelpUsage,
  ProblemContextResponse,
  Rating,
  SubmissionStatus
} from "./types";
import type { ChallengeUnlock } from "./challenges";

const routeSlug = location.pathname.match(/^\/problems\/([^/]+)/)?.[1];
const slug =
  routeSlug && location.hostname === "neetcode.io"
    ? neetcodeSlugToLeetcodeSlug.get(routeSlug)
    : routeSlug;

if (slug) {
  void initialize(slug);
}

chrome.runtime.onMessage.addListener(
  (message: {
    type?: string;
    rankId?: string;
    rankName?: string;
    fromRankId?: string;
    xp?: number;
  }) => {
    if (
      message.type === "PREVIEW_RANK_UP" &&
      message.rankId &&
      message.rankName
    ) {
      showRankUpCelebration(
        message.rankId,
        message.rankName,
        message.xp ?? 0,
        message.fromRankId
      );
    }
  }
);

async function initialize(problemSlug: string): Promise<void> {
  const context = (await chrome.runtime.sendMessage({
    type: "GET_PROBLEM_CONTEXT",
    slug: problemSlug
  })) as ProblemContextResponse;

  if (!context.known || !context.problem || !context.activeAttempt) return;

  let activeSeconds = context.activeAttempt.activeSeconds;
  let running = true;
  let awaitingResult = false;
  let lastKnownStatus = "";
  let selectedHelp: HelpUsage = "none";

  const root = document.createElement("aside");
  root.id = "patternqueue-widget";
  root.innerHTML = `
    <div class="pq-header">
      <div>
        <strong>PatternQueue</strong>
        <span class="pq-subtitle">${escapeHtml(patternById.get(context.problem.primaryPattern)?.name ?? context.problem.primaryPattern.replaceAll("-", " "))}</span>
      </div>
      <button class="pq-minimize" type="button" aria-label="Minimize">−</button>
    </div>
    <div class="pq-body">
      <div class="pq-problem">${escapeHtml(context.problem.title)}</div>
      <div class="pq-metrics">
        <span data-role="timer">${formatDuration(activeSeconds)}</span>
        <span data-role="submissions">${context.activeAttempt.submissionCount} submissions</span>
      </div>
      <p class="pq-status" data-role="status">Attempt is being tracked while this tab is visible.</p>
      <div class="pq-actions">
        <button class="pq-secondary" data-action="rate" type="button">Rate result</button>
        <button class="pq-ghost" data-action="note" type="button">${context.note ? "Note ✓" : "Note"}</button>
        <button class="pq-ghost" data-action="abandon" type="button">Abandon</button>
      </div>
      <div class="pq-note" data-role="note-panel" hidden>
        <div class="pq-note-head">
          <strong>Problem note</strong>
          <span data-role="note-status">${context.note ? "Saved locally" : "Autosaves locally"}</span>
        </div>
        <textarea
          data-role="note-input"
          maxlength="5000"
          placeholder="Key idea, invariant, mistake, or edge case…"
          aria-label="Note for ${escapeHtml(context.problem.title)}"
        >${escapeHtml(context.note?.text ?? "")}</textarea>
        <div class="pq-note-foot">
          <span>Ctrl/⌘ + Enter to save and close</span>
          <button class="pq-ghost" data-action="close-note" type="button">Done</button>
        </div>
      </div>
    </div>
    <div class="pq-rating" data-role="rating-panel" hidden>
      <div class="pq-rating-head">
        <strong>How did it go?</strong>
        <button class="pq-close" data-action="close-rating" type="button" aria-label="Close">×</button>
      </div>
      <span class="pq-label">Help used</span>
      <div class="pq-help" role="group" aria-label="Help used">
        <button data-help="none" class="is-selected" type="button">None</button>
        <button data-help="hint" type="button">Hint</button>
        <button data-help="solution" type="button">Solution</button>
      </div>
      <div class="pq-ratings">
        <button data-rating="again" type="button"><b>Again</b><span>Could not solve</span></button>
        <button data-rating="hard" type="button"><b>Hard</b><span>Major struggle</span></button>
        <button data-rating="good" type="button"><b>Good</b><span>Independent, some friction</span></button>
        <button data-rating="easy" type="button"><b>Easy</b><span>Clean and confident</span></button>
      </div>
    </div>
  `;
  document.body.append(root);

  const timer = root.querySelector<HTMLElement>('[data-role="timer"]')!;
  const submissions = root.querySelector<HTMLElement>(
    '[data-role="submissions"]'
  )!;
  const status = root.querySelector<HTMLElement>('[data-role="status"]')!;
  const ratingPanel = root.querySelector<HTMLElement>(
    '[data-role="rating-panel"]'
  )!;
  const notePanel = root.querySelector<HTMLElement>(
    '[data-role="note-panel"]'
  )!;
  const noteInput = root.querySelector<HTMLTextAreaElement>(
    '[data-role="note-input"]'
  )!;
  const noteStatus = root.querySelector<HTMLElement>(
    '[data-role="note-status"]'
  )!;
  const noteButton = root.querySelector<HTMLButtonElement>(
    '[data-action="note"]'
  )!;
  const body = root.querySelector<HTMLElement>(".pq-body")!;
  let lastSavedNote = context.note?.text ?? "";
  let noteSaveTimer: number | undefined;
  let noteSaveInFlight = false;
  let noteSaveQueued = false;

  root.querySelector(".pq-minimize")?.addEventListener("click", () => {
    root.classList.toggle("is-minimized");
  });

  root.querySelector('[data-action="rate"]')?.addEventListener("click", () => {
    ratingPanel.hidden = false;
  });

  root.querySelector('[data-action="note"]')?.addEventListener("click", () => {
    notePanel.hidden = !notePanel.hidden;
    if (!notePanel.hidden) noteInput.focus();
  });

  root
    .querySelector('[data-action="close-note"]')
    ?.addEventListener("click", () => {
      void saveNote();
      notePanel.hidden = true;
    });

  noteInput.addEventListener("input", () => {
    noteStatus.textContent = "Unsaved…";
    window.clearTimeout(noteSaveTimer);
    noteSaveTimer = window.setTimeout(() => void saveNote(), 700);
  });

  noteInput.addEventListener("blur", () => {
    void saveNote();
  });

  noteInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      void saveNote();
      notePanel.hidden = true;
    }
  });

  root
    .querySelector('[data-action="close-rating"]')
    ?.addEventListener("click", () => {
      ratingPanel.hidden = true;
    });

  root.querySelectorAll<HTMLButtonElement>("[data-help]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedHelp = button.dataset.help as HelpUsage;
      root
        .querySelectorAll("[data-help]")
        .forEach((item) => item.classList.remove("is-selected"));
      button.classList.add("is-selected");
    });
  });

  root.querySelectorAll<HTMLButtonElement>("[data-rating]").forEach((button) => {
    button.addEventListener("click", () => {
      void (async () => {
        const rating = button.dataset.rating as Rating;
        button.disabled = true;
        const response = (await chrome.runtime.sendMessage({
          type: "COMPLETE_ATTEMPT",
          slug: problemSlug,
          rating,
          helpUsage: selectedHelp,
          activeSeconds
        })) as {
          ok: boolean;
          attempt?: { nextReviewAt?: string; xpEarned?: number };
          rankUp?: {
            from: { id: string; name: string };
            to: { id: string; name: string };
            totalXp: number;
          };
          challengeUnlocks?: ChallengeUnlock[];
          error?: string;
        };

        if (!response.ok) {
          button.disabled = false;
          status.textContent = response.error ?? "Could not save the attempt.";
          return;
        }

        running = false;
        ratingPanel.hidden = true;
        body.querySelector(".pq-actions")?.remove();
        const next = response.attempt?.nextReviewAt
          ? new Date(response.attempt.nextReviewAt).toLocaleDateString()
          : "later";
        status.textContent = `Saved · +${response.attempt?.xpEarned ?? 0} XP. Next review: ${next}.`;
        const showChallengeUnlocks = (): void => {
          if (response.challengeUnlocks?.length) {
            showAchievementCelebration(response.challengeUnlocks);
          }
        };
        if (response.rankUp) {
          showRankUpCelebration(
            response.rankUp.to.id,
            response.rankUp.to.name,
            response.rankUp.totalXp,
            response.rankUp.from.id,
            showChallengeUnlocks
          );
        } else {
          showChallengeUnlocks();
        }
      })();
    });
  });

  root
    .querySelector('[data-action="abandon"]')
    ?.addEventListener("click", () => {
      if (!confirm("Save this attempt as abandoned?")) return;
      void (async () => {
        const response = (await chrome.runtime.sendMessage({
          type: "ABANDON_ATTEMPT",
          slug: problemSlug,
          helpUsage: selectedHelp,
          activeSeconds
        })) as { ok: boolean };
        if (response.ok) {
          running = false;
          status.textContent = "Attempt saved as abandoned.";
          body.querySelector(".pq-actions")?.remove();
        }
      })();
    });

  window.setInterval(() => {
    if (running && document.visibilityState === "visible") {
      activeSeconds += 1;
      timer.textContent = formatDuration(activeSeconds);
    }
  }, 1000);

  window.setInterval(() => {
    if (!running) return;
    void chrome.runtime.sendMessage({
      type: "ATTEMPT_HEARTBEAT",
      slug: problemSlug,
      activeSeconds
    });
  }, 15_000);

  document.addEventListener(
    "click",
    (event) => {
      const target = event.target as Element | null;
      const submitButton = target?.closest(
        '[data-e2e-locator="console-submit-button"], button'
      );
      if (!submitButton || !isSubmitButton(submitButton)) return;
      awaitingResult = true;
      status.textContent = "Waiting for submission result…";
      window.setTimeout(checkForResult, 600);
    },
    true
  );

  const observer = new MutationObserver(() => {
    if (awaitingResult) checkForResult();
  });
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true
  });

  async function saveNote(): Promise<void> {
    window.clearTimeout(noteSaveTimer);
    if (noteSaveInFlight) {
      noteSaveQueued = true;
      return;
    }
    const text = noteInput.value;
    if (text === lastSavedNote) return;
    noteSaveInFlight = true;
    let saved = false;
    noteStatus.textContent = "Saving…";
    try {
      const response = (await chrome.runtime.sendMessage({
        type: "SAVE_PROBLEM_NOTE",
        slug: problemSlug,
        text
      })) as { ok: boolean; error?: string };
      if (!response.ok) {
        noteStatus.textContent = response.error ?? "Could not save";
        return;
      }
      lastSavedNote = text;
      saved = true;
      noteStatus.textContent =
        noteInput.value === text
          ? text.trim()
            ? "Saved locally"
            : "Note cleared"
          : "Unsaved…";
      noteButton.textContent = text.trim() ? "Note ✓" : "Note";
    } catch {
      noteStatus.textContent = "Could not save";
    } finally {
      noteSaveInFlight = false;
      if (noteSaveQueued || (saved && noteInput.value !== lastSavedNote)) {
        noteSaveQueued = false;
        void saveNote();
      }
    }
  }

  function checkForResult(): void {
    if (!awaitingResult || !running) return;
    const detected = detectSubmissionStatus();
    if (!detected || detected === lastKnownStatus) return;
    lastKnownStatus = detected;
    awaitingResult = false;

    void (async () => {
      await chrome.runtime.sendMessage({
        type: "SUBMISSION_RECORDED",
        slug: problemSlug,
        status: detected,
        activeSeconds
      });

      const current = Number.parseInt(submissions.textContent ?? "0", 10) || 0;
      submissions.textContent = `${current + 1} submissions`;
      status.textContent = submissionLabel(detected);
      if (detected === "accepted") {
        ratingPanel.hidden = false;
      }
    })();
  }
}

function showRankUpCelebration(
  rankId: string,
  rankName: string,
  totalXp: number,
  fromRankId?: string,
  onDismiss?: () => void
): void {
  document.querySelector("#patternqueue-rankup")?.remove();

  const overlay = document.createElement("div");
  overlay.id = "patternqueue-rankup";
  overlay.className = `pq-rank-${rankId}`;
  overlay.style.setProperty(
    "--pq-old-a",
    rankColor(fromRankId ?? "iron")
  );
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", `Promoted to ${rankName}`);
  overlay.innerHTML = `
    <div class="pq-rankup-backdrop"></div>
    <div class="pq-rankup-rays" aria-hidden="true"></div>
    <div class="pq-rankup-shards" aria-hidden="true">
      ${Array.from(
        { length: 18 },
        (_, index) => `<b style="--pq-s:${index}"></b>`
      ).join("")}
    </div>
    <svg class="pq-rankup-energy" viewBox="0 0 300 300" aria-hidden="true">
      <circle cx="150" cy="150" r="74"></circle>
      <path d="M42 151 C91 112 105 191 150 150 C198 106 216 194 258 148"></path>
      <path d="M70 82 C117 108 96 151 150 150 C209 149 184 102 232 76"></path>
    </svg>
    <div class="pq-rankup-particles" aria-hidden="true">
      ${Array.from(
        { length: 24 },
        (_, index) => `<i style="--pq-i:${index}"></i>`
      ).join("")}
    </div>
    <section class="pq-rankup-card">
      <span class="pq-rankup-kicker">Promoted to ${escapeHtml(rankName)}</span>
      <div class="pq-rankup-emblem" aria-hidden="true">
        <div class="pq-rankup-wing pq-rankup-wing-left"></div>
        <div class="pq-rankup-core">
          <span>${escapeHtml(rankName.slice(0, 1))}</span>
        </div>
        <div class="pq-rankup-wing pq-rankup-wing-right"></div>
      </div>
      <h2>${escapeHtml(rankName)}</h2>
      <p>NeetCode 150 · ${totalXp.toLocaleString()} XP</p>
      <button type="button" data-action="dismiss-rankup">OK</button>
    </section>
  `;

  const dismiss = (): void => {
    overlay.classList.add("is-leaving");
    window.setTimeout(() => {
      overlay.remove();
      onDismiss?.();
    }, 350);
    document.removeEventListener("keydown", onKeyDown);
  };
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape" || event.key === "Enter") dismiss();
  };

  overlay
    .querySelector('[data-action="dismiss-rankup"]')
    ?.addEventListener("click", dismiss);
  document.addEventListener("keydown", onKeyDown);
  document.body.append(overlay);
  overlay
    .querySelector<HTMLButtonElement>('[data-action="dismiss-rankup"]')
    ?.focus();
  playRankUpSound();
}

function showAchievementCelebration(unlocks: ChallengeUnlock[]): void {
  document.querySelector("#patternqueue-achievement")?.remove();
  const overlay = document.createElement("div");
  overlay.id = "patternqueue-achievement";
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute(
    "aria-label",
    `${unlocks.length} challenge${unlocks.length === 1 ? "" : "s"} advanced`
  );
  overlay.innerHTML = `
    <div class="pq-achievement-backdrop"></div>
    <section class="pq-achievement-panel">
      <span class="pq-achievement-kicker">Progression</span>
      <h2>${unlocks.length} challenge${unlocks.length === 1 ? "" : "s"} advanced</h2>
      <div class="pq-achievement-carousel">
        ${unlocks
          .map(
            (unlock, index) => `
              <article class="pq-achievement-card pq-achievement-${unlock.tier.id}" style="--pq-delay:${index * 110}ms">
                <div class="pq-achievement-token">
                  <span>${escapeHtml(unlock.token)}</span>
                </div>
                <div>
                  <small>${escapeHtml(unlock.category)} · ${escapeHtml(unlock.tier.name)}</small>
                  <strong>${escapeHtml(unlock.name)}</strong>
                  <p>${unlock.value.toLocaleString()} progress${unlock.masterTitle ? ` · Title unlocked: ${escapeHtml(unlock.masterTitle)}` : ""}</p>
                </div>
              </article>
            `
          )
          .join("")}
      </div>
      <button type="button" data-action="dismiss-achievements">Continue</button>
    </section>
  `;

  const dismiss = (): void => {
    overlay.classList.add("is-leaving");
    window.setTimeout(() => overlay.remove(), 300);
    document.removeEventListener("keydown", onKeyDown);
  };
  const onKeyDown = (event: KeyboardEvent): void => {
    if (event.key === "Escape" || event.key === "Enter") dismiss();
  };

  overlay
    .querySelector('[data-action="dismiss-achievements"]')
    ?.addEventListener("click", dismiss);
  document.addEventListener("keydown", onKeyDown);
  document.body.append(overlay);
  overlay
    .querySelector<HTMLButtonElement>(
      '[data-action="dismiss-achievements"]'
    )
    ?.focus();
  playChallengeSound();
}

function rankColor(rankId: string): string {
  const colors: Record<string, string> = {
    iron: "#9ca3af",
    bronze: "#d08a55",
    silver: "#dbeafe",
    gold: "#fde68a",
    platinum: "#a7f3d0",
    emerald: "#6ee7b7",
    diamond: "#c4b5fd",
    master: "#f0abfc",
    grandmaster: "#fda4af",
    challenger: "#fef3c7"
  };
  return colors[rankId] ?? colors.iron!;
}

function playRankUpSound(): void {
  try {
    const AudioContextClass =
      window.AudioContext ??
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;
    if (!AudioContextClass) return;

    const audio = new AudioContextClass();
    void audio.resume();
    const start = audio.currentTime;
    const notes = [
      { frequency: 261.63, delay: 0, duration: 0.65 },
      { frequency: 392, delay: 0.14, duration: 0.72 },
      { frequency: 523.25, delay: 0.3, duration: 0.9 },
      { frequency: 783.99, delay: 0.48, duration: 1.05 }
    ];

    for (const note of notes) {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const noteStart = start + note.delay;
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(note.frequency, noteStart);
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.11, noteStart + 0.04);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        noteStart + note.duration
      );
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + note.duration);
    }

    window.setTimeout(() => void audio.close(), 2_000);
  } catch {
    // Audio is decorative; the visual promotion must still work.
  }
}

function playChallengeSound(): void {
  try {
    const AudioContextClass =
      window.AudioContext ??
      (
        window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }
      ).webkitAudioContext;
    if (!AudioContextClass) return;
    const audio = new AudioContextClass();
    void audio.resume();
    const start = audio.currentTime;

    for (const [index, frequency] of [440, 554.37, 659.25].entries()) {
      const oscillator = audio.createOscillator();
      const gain = audio.createGain();
      const noteStart = start + index * 0.1;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, noteStart);
      gain.gain.setValueAtTime(0.0001, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.08, noteStart + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 0.5);
      oscillator.connect(gain);
      gain.connect(audio.destination);
      oscillator.start(noteStart);
      oscillator.stop(noteStart + 0.52);
    }
    window.setTimeout(() => void audio.close(), 1_000);
  } catch {
    // Challenge audio is decorative.
  }
}

function isSubmitButton(element: Element): boolean {
  if (element.matches('[data-e2e-locator="console-submit-button"]')) return true;
  return element.textContent?.trim().toLowerCase() === "submit";
}

function detectSubmissionStatus(): SubmissionStatus | undefined {
  const selectors = [
    '[data-e2e-locator="console-result"]',
    '[data-e2e-locator="submission-result"]',
    '[data-cy="submission-result"]',
    '[class*="submission-result"]'
  ];
  const text = selectors
    .flatMap((selector) => Array.from(document.querySelectorAll(selector)))
    .filter((element) => !element.closest("#patternqueue-widget"))
    .map((element) => element.textContent ?? "")
    .join(" ");

  const normalized = text.toLowerCase();
  if (normalized.includes("accepted")) return "accepted";
  if (normalized.includes("wrong answer")) return "wrong-answer";
  if (normalized.includes("time limit exceeded")) return "time-limit-exceeded";
  if (normalized.includes("runtime error")) return "runtime-error";
  if (normalized.includes("compile error")) return "compile-error";
  return undefined;
}

function submissionLabel(status: SubmissionStatus): string {
  const labels: Record<SubmissionStatus, string> = {
    accepted: "Accepted. Rate this attempt to schedule the next review.",
    "wrong-answer": "Wrong Answer recorded. Keep going.",
    "runtime-error": "Runtime Error recorded. Keep going.",
    "time-limit-exceeded": "Time Limit Exceeded recorded. Keep going.",
    "compile-error": "Compile Error recorded. Keep going."
  };
  return labels[status];
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
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
