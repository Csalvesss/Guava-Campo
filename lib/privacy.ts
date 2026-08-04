export const PRIVACY_POLICY_VERSION = "2026-08-04";
export const COOKIE_POLICY_VERSION = "2026-08-04";
export const COOKIE_PREFERENCES_KEY = "guava-campo-cookie-consent-v1";
export const COOKIE_PREFERENCES_EVENT = "guava:open-cookie-preferences";

export type CookiePreferences = {
  necessary: true;
  analytics: boolean;
  updatedAt: string;
  version: string;
};

export function readCookiePreferences(): CookiePreferences | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(COOKIE_PREFERENCES_KEY);
    if (!raw) return null;

    const stored = JSON.parse(raw) as CookiePreferences;
    const updatedAt = Date.parse(stored.updatedAt);
    const expired = !Number.isFinite(updatedAt) || Date.now() - updatedAt > 365 * 24 * 60 * 60 * 1000;
    return stored.version === COOKIE_POLICY_VERSION && !expired ? stored : null;
  } catch {
    return null;
  }
}

export function writeCookiePreferences(analytics: boolean): CookiePreferences {
  const preferences: CookiePreferences = {
    necessary: true,
    analytics,
    updatedAt: new Date().toISOString(),
    version: COOKIE_POLICY_VERSION,
  };

  localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
  return preferences;
}
