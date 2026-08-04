"use client";

import Link from "next/link";
import { BarChart3, Cookie, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import {
  COOKIE_PREFERENCES_EVENT,
  readCookiePreferences,
  writeCookiePreferences,
  type CookiePreferences,
} from "@/lib/privacy";

async function updateAnalytics(enabled: boolean) {
  try {
    const { setAnalyticsEnabled } = await import("@/lib/firebase");
    await setAnalyticsEnabled(enabled);
  } catch {
    // Analytics is optional and must never block the site.
  }
}

export function CookieConsent() {
  const [preferences, setPreferences] = useState<CookiePreferences | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    let cancelled = false;

    function openPreferences() {
      const stored = readCookiePreferences();
      setAnalytics(stored?.analytics ?? false);
      setCustomizing(true);
      setOpen(true);
    }

    window.addEventListener(COOKIE_PREFERENCES_EVENT, openPreferences);
    queueMicrotask(() => {
      if (cancelled) return;
      const stored = readCookiePreferences();
      setPreferences(stored);
      setAnalytics(stored?.analytics ?? false);
      setOpen(!stored);
      if (stored?.analytics) void updateAnalytics(true);
    });

    return () => {
      cancelled = true;
      window.removeEventListener(COOKIE_PREFERENCES_EVENT, openPreferences);
    };
  }, []);

  function save(allowAnalytics: boolean) {
    const analyticsWasEnabled = preferences?.analytics === true;
    const next = writeCookiePreferences(allowAnalytics);
    setPreferences(next);
    setAnalytics(allowAnalytics);
    setOpen(false);
    setCustomizing(false);
    if (allowAnalytics) void updateAnalytics(true);
    else if (analyticsWasEnabled) void updateAnalytics(false);
  }

  if (preferences === undefined || !open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] p-3 sm:p-5" aria-live="polite">
      <section
        role="dialog"
        aria-modal="false"
        aria-labelledby="cookie-title"
        className="mx-auto max-w-5xl rounded-lg border border-line bg-cream p-5 shadow-[0_20px_60px_rgba(15,54,41,0.22)] sm:p-6"
      >
        <div className="flex items-start gap-4">
          <span className="hidden size-11 shrink-0 place-items-center rounded-lg bg-forest/10 text-forest sm:grid">
            <Cookie className="size-5" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 id="cookie-title" className="font-display text-2xl font-semibold text-pine">
                  {customizing ? "Preferências de cookies" : "Sua privacidade importa"}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-soft">
                  Usamos armazenamento necessário para manter o acesso e as inscrições. Cookies de análise só são ativados com a sua escolha e ajudam a melhorar o portal.
                </p>
              </div>
              {preferences ? (
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid size-9 shrink-0 place-items-center rounded-lg text-ink-soft hover:bg-paper-2 hover:text-pine"
                  aria-label="Fechar preferências de cookies"
                >
                  <X className="size-4" aria-hidden />
                </button>
              ) : null}
            </div>

            {customizing ? (
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-lg border border-line p-4">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-forest" aria-hidden />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-pine">Necessários</p>
                      <span className="text-xs font-semibold text-moss">Sempre ativos</span>
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">Mantêm sua sessão, preferências e recursos essenciais do portal.</p>
                  </div>
                </div>
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-line p-4">
                  <BarChart3 className="mt-0.5 size-5 shrink-0 text-forest" aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-pine">Análise de uso</span>
                      <input
                        type="checkbox"
                        checked={analytics}
                        onChange={(event) => setAnalytics(event.target.checked)}
                        className="size-4 accent-forest"
                      />
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-ink-soft">Mede visitas e navegação de forma agregada para melhorar a experiência.</span>
                  </span>
                </label>
              </div>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-relaxed text-ink-soft">
                Saiba mais na <Link href="/politica-de-privacidade" className="font-semibold text-forest underline underline-offset-2">Política de Privacidade</Link> e na <Link href="/politica-de-cookies" className="font-semibold text-forest underline underline-offset-2">Política de Cookies</Link>.
              </p>
              <div className="flex shrink-0 flex-col-reverse gap-2 sm:flex-row">
                {!customizing ? (
                  <button type="button" onClick={() => setCustomizing(true)} className="btn btn-light text-sm">Configurar</button>
                ) : null}
                <button type="button" onClick={() => save(false)} className="btn btn-light text-sm">Somente necessários</button>
                <button type="button" onClick={() => save(customizing ? analytics : true)} className="btn btn-primary text-sm">
                  {customizing ? "Salvar preferências" : "Aceitar todos"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
