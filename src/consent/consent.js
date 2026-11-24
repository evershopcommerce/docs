// Cookie consent for evershop.io.
//
// A visitor makes one choice today: allow analytics cookies (Google Analytics)
// or not. Until they accept, no analytics script is loaded and no analytics
// cookie is set. The choice itself is saved in localStorage, so remembering it
// needs no cookie.
//
// This module is the single source of truth. The banner
// (src/components/CookieConsent) and the analytics loader (./analytics.js)
// both read from it. When a new kind of cookie is added, raise VERSION so that
// everyone is asked again.

const STORAGE_KEY = "evershop-cookie-consent";
const VERSION = 1;
// Ask again after a year.
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

// What the server renders, and what the first client render must match. The
// banner shows nothing until the real value is read in the browser.
const SERVER_SNAPSHOT = Object.freeze({
  ready: false,
  decision: null,
  panelOpen: false,
  gpc: false,
});

const listeners = new Set();
let snapshot = null; // built on first use in the browser
let remembered = null; // keeps the choice for this visit if localStorage is blocked

function readDecision() {
  let raw;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch (e) {
    raw = remembered;
  }
  if (!raw) return null;
  try {
    const decision = JSON.parse(raw);
    const fresh = Date.now() - decision.savedAt <= MAX_AGE_MS;
    if (
      decision.version !== VERSION ||
      typeof decision.analytics !== "boolean" ||
      !fresh
    ) {
      return null;
    }
    return decision;
  } catch (e) {
    return null;
  }
}

function writeDecision(decision) {
  remembered = JSON.stringify(decision);
  try {
    window.localStorage.setItem(STORAGE_KEY, remembered);
  } catch (e) {
    // Blocked storage: the choice lasts for this visit only.
  }
}

function build(patch) {
  snapshot = {
    ready: true,
    decision: readDecision(),
    panelOpen: snapshot ? snapshot.panelOpen : false,
    // Global Privacy Control: the browser already says "no tracking". We treat
    // that as a decline and do not show the banner. The visitor can still
    // accept from "Cookie settings".
    gpc: window.navigator.globalPrivacyControl === true,
    ...patch,
  };
}

function emit() {
  listeners.forEach((listener) => listener());
}

if (typeof window !== "undefined") {
  // Keep tabs in step: a choice made in one tab applies to the others.
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) {
      build();
      emit();
    }
  });
}

// For React's useSyncExternalStore.
export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getSnapshot() {
  if (!snapshot) build();
  return snapshot;
}

export const getServerSnapshot = () => SERVER_SNAPSHOT;

export function saveDecision({ analytics }) {
  writeDecision({
    version: VERSION,
    analytics: Boolean(analytics),
    savedAt: Date.now(),
  });
  build({ panelOpen: false });
  emit();
}

// The "Cookie settings" link in the footer opens the banner again.
export function openSettings() {
  getSnapshot();
  build({ panelOpen: true });
  emit();
}

export function closeSettings() {
  getSnapshot();
  build({ panelOpen: false });
  emit();
}
