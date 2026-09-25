const PREFS_STORAGE_KEY = 'maju-user-prefs';

const DEFAULT_PREFS = {
  defaultPersona: 'pressure',
  defaultPeerIntensity: 'medium',
  defaultDurationMinutes: 15,
  tutorialDismissed: false,
};

const DEFAULT_ONBOARDING = {
  completed: false,
  goal: null,
  experienceLevel: null,
};

function readAllPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAllPrefs(all) {
  localStorage.setItem(PREFS_STORAGE_KEY, JSON.stringify(all));
}

function userKey(userId) {
  return userId ?? 'anonymous';
}

/** @param {string | undefined | null} userId */
export function loadUserPrefs(userId) {
  const stored = readAllPrefs()[userKey(userId)] ?? {};
  return { ...DEFAULT_PREFS, ...stored };
}

/** @param {string | undefined | null} userId */
export function saveUserPrefs(userId, patch) {
  const all = readAllPrefs();
  const key = userKey(userId);
  all[key] = { ...loadUserPrefs(userId), ...patch };
  writeAllPrefs(all);
}

/** @param {string | undefined | null} userId */
export function loadOnboarding(userId) {
  const prefs = loadUserPrefs(userId);
  return {
    ...DEFAULT_ONBOARDING,
    completed: Boolean(prefs.onboardingCompleted),
    goal: prefs.onboardingGoal ?? null,
    experienceLevel: prefs.onboardingExperience ?? null,
  };
}

/** @param {string | undefined | null} userId */
export function markOnboardingComplete(userId, { goal, experienceLevel, skipped = false } = {}) {
  saveUserPrefs(userId, {
    onboardingCompleted: true,
    onboardingGoal: goal ?? undefined,
    onboardingExperience: experienceLevel ?? undefined,
    onboardingSkipped: skipped,
  });
}

/** @param {string | undefined | null} userId */
export function isOnboardingComplete(userId) {
  return loadOnboarding(userId).completed;
}

/** @param {string | undefined | null} userId */
export function isTutorialDismissed(userId) {
  return loadUserPrefs(userId).tutorialDismissed;
}

/** @param {string | undefined | null} userId */
export function dismissTutorial(userId) {
  saveUserPrefs(userId, { tutorialDismissed: true });
}
