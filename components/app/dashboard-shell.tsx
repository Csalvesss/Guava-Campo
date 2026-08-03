"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOut, Menu, X, type LucideIcon } from "lucide-react";
import { Brand } from "@/components/ui/brand";

export type NavItem = { id: string; label: string; icon: LucideIcon; badge?: number };

export function DashboardShell({
  role,
  userName,
  userMeta,
  nav,
  active,
  onSelect,
  title,
  subtitle,
  actions,
  children,
}: {
  role: string;
  userName: string;
  userMeta: string;
  nav: NavItem[];
  active: string;
  onSelect: (id: string) => void;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [drawer, setDrawer] = useState(false);
  const initials = userName
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  const sidebar = (
    <div className="flex h-full flex-col bg-forest text-cream">
      <div className="flex items-center justify-between px-5 py-5">
        <Brand tone="light" size="sm" />
        <button
          type="button"
          onClick={() => setDrawer(false)}
          className="grid size-9 place-items-center rounded-lg bg-white/10 text-cream lg:hidden"
          aria-label="Fechar menu"
        >
          <X className="size-5" />
        </button>
      </div>

      <div className="mx-4 rounded-2xl bg-white/8 px-4 py-3">
        <p className="text-[0.65rem] font-bold uppercase tracking-widest text-harvest">{role}</p>
        <div className="mt-2 flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-harvest font-display text-sm font-semibold text-pine">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{userName}</p>
            <p className="truncate text-xs text-cream/60">{userMeta}</p>
          </div>
        </div>
      </div>

      <nav className="mt-6 flex-1 space-y-1 px-3">
        {nav.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelect(item.id);
                setDrawer(false);
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? "bg-cream text-forest shadow-[var(--shadow-soft)]"
                  : "text-cream/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className={`size-[1.15rem] ${isActive ? "text-forest" : "text-harvest"}`} aria-hidden />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge ? (
                <span
                  className={`chip !px-2 !py-0.5 text-[0.65rem] ${
                    isActive ? "bg-forest text-cream" : "bg-harvest text-pine"
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      <div className="p-3">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-cream/70 transition hover:bg-white/10 hover:text-white"
        >
          <LogOut className="size-[1.15rem] text-harvest" aria-hidden />
          Sair
        </Link>
      </div>
    </div>
  );

  return (
    <div className="grain min-h-screen lg:grid lg:grid-cols-[17rem_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen lg:block">{sidebar}</aside>

      {/* Mobile drawer */}
      {drawer ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-pine/50 backdrop-blur-sm"
            aria-label="Fechar menu"
            onClick={() => setDrawer(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[82%] max-w-xs shadow-2xl">{sidebar}</div>
        </div>
      ) : null}

      {/* Main column */}
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur">
          <div className="flex items-center gap-3 px-4 py-4 sm:px-8">
            <button
              type="button"
              onClick={() => setDrawer(true)}
              className="grid size-10 shrink-0 place-items-center rounded-xl border border-line bg-cream text-forest lg:hidden"
              aria-label="Abrir menu"
            >
              <Menu className="size-5" />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-2xl font-semibold text-pine">{title}</h1>
              {subtitle ? <p className="truncate text-sm text-ink-soft">{subtitle}</p> : null}
            </div>
            {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
