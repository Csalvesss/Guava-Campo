"use client";

import { COOKIE_PREFERENCES_EVENT } from "@/lib/privacy";

export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(COOKIE_PREFERENCES_EVENT))}
      className="hover:text-harvest"
    >
      Gerenciar cookies
    </button>
  );
}
