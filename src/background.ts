import { problemBySlug } from "./curriculum";
import {
  abandonAttempt,
  completeAttempt,
  getProblemContext,
  recordHeartbeat,
  recordSubmission
} from "./domain";
import {
  buildDailyQueue,
  loadState,
  saveProblemNote,
  saveState
} from "./state";
import { getRankProgress } from "./ranks";
import { getChallengeUnlocks } from "./challenges";
import type { RuntimeMessage } from "./types";

const REMINDER_ALARM = "patternqueue.daily-reminder";

async function refreshReminderAlarm(): Promise<void> {
  const state = await loadState();
  await chrome.alarms.clear(REMINDER_ALARM);
  if (!state.settings.dailyReminderEnabled) return;

  const now = new Date();
  const next = new Date();
  next.setHours(state.settings.dailyReminderHour, 0, 0, 0);
  if (next.getTime() <= now.getTime()) {
    next.setDate(next.getDate() + 1);
  }

  chrome.alarms.create(REMINDER_ALARM, {
    when: next.getTime(),
    periodInMinutes: 24 * 60
  });
}

chrome.runtime.onInstalled.addListener(() => {
  void (async () => {
    const state = await loadState();
    await saveState(state);
    await refreshReminderAlarm();
  })();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== REMINDER_ALARM) return;
  void (async () => {
    const state = await loadState();
    const queue = buildDailyQueue(state);
    if (queue.length === 0) return;

    chrome.notifications.create({
      type: "basic",
      iconUrl: chrome.runtime.getURL("icons/icon-128.png"),
      title: "PatternQueue",
      message: `${queue.length} problem${queue.length === 1 ? "" : "s"} waiting in today's queue.`
    });
  })();
});

async function handleMessage(message: RuntimeMessage | { type: string }) {
  if (message.type === "REFRESH_ALARM") {
    await refreshReminderAlarm();
    return { ok: true };
  }

  const runtimeMessage = message as RuntimeMessage;
  const state = await loadState();

  switch (runtimeMessage.type) {
    case "GET_PROBLEM_CONTEXT": {
      const response = getProblemContext(state, runtimeMessage.slug);
      if (response.known) await saveState(state);
      return response;
    }
    case "ATTEMPT_HEARTBEAT": {
      recordHeartbeat(
        state,
        runtimeMessage.slug,
        runtimeMessage.activeSeconds
      );
      await saveState(state);
      return { ok: true };
    }
    case "SUBMISSION_RECORDED": {
      recordSubmission(
        state,
        runtimeMessage.slug,
        runtimeMessage.status,
        runtimeMessage.activeSeconds
      );
      await saveState(state);
      return { ok: true };
    }
    case "SAVE_PROBLEM_NOTE": {
      const problem = problemBySlug.get(runtimeMessage.slug);
      if (!problem) return { ok: false, error: "Unknown problem" };
      const note = saveProblemNote(
        state,
        problem.id,
        runtimeMessage.text
      );
      await saveState(state);
      return { ok: true, note };
    }
    case "COMPLETE_ATTEMPT": {
      const stateBefore = structuredClone(state);
      const rankBefore = getRankProgress(state);
      const attempt = completeAttempt(
        state,
        runtimeMessage.slug,
        runtimeMessage.rating,
        runtimeMessage.helpUsage,
        runtimeMessage.activeSeconds
      );
      const rankAfter = getRankProgress(state);
      const rankUp =
        attempt && rankBefore.current.id !== rankAfter.current.id
          ? {
              from: rankBefore.current,
              to: rankAfter.current,
              totalXp: rankAfter.xp
            }
          : undefined;
      const challengeUnlocks = attempt
        ? getChallengeUnlocks(stateBefore, state)
        : [];
      await saveState(state);
      return {
        ok: Boolean(attempt),
        attempt,
        rankUp,
        challengeUnlocks
      };
    }
    case "ABANDON_ATTEMPT": {
      const attempt = abandonAttempt(
        state,
        runtimeMessage.slug,
        runtimeMessage.helpUsage,
        runtimeMessage.activeSeconds
      );
      await saveState(state);
      return { ok: Boolean(attempt), attempt };
    }
    default:
      return { ok: false, error: "Unknown message" };
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  void handleMessage(message as RuntimeMessage)
    .then(sendResponse)
    .catch((error: unknown) => {
      sendResponse({
        ok: false,
        error: error instanceof Error ? error.message : "Unexpected error"
      });
    });
  return true;
});

chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    tab.url.includes("leetcode.com/problems/")
  ) {
    const slug = tab.url.match(/\/problems\/([^/]+)/)?.[1];
    if (slug && problemBySlug.has(slug)) {
      void chrome.action.setBadgeText({ text: "" });
    }
  }
});
