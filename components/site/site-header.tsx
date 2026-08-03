"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Building2, Menu, Phone, UserRound, X } from "lucide-react";
import { Brand } from "@/components/ui/brand";
import { contato } from "@/lib/site-content";

const links = [
  { href: "/#cursos", label: "Cursos" },
  { href: "/#como-funciona", label: "Como funciona" },
  { href: "/#eixos", label: "Áreas" },
  { href: "/#duvidas", label: "Dúvidas" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50">
      <div className="bg-pine text-cream">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-[0.72rem] font-semibold tracking-wide sm:px-6 lg:px-8">
          <span className="flex items-center gap-2">
            <span className="inline-block size-1.5 rounded-full bg-harvest" />
            SENAR-SP · Mobilização de cursos rurais gratuitos
          </span>
          <a href={`tel:${contato.telefone.replace(/\D/g, "")}`} className="hidden items-center gap-2 hover:text-harvest sm:inline-flex">
            <Phone className="size-3.5" aria-hidden />
            {contato.telefone}
          </a>
        </div>
      </div>

      <div
        className={`border-b transition-colors duration-300 ${
          scrolled
            ? "border-line bg-cream/95 backdrop-blur supports-[backdrop-filter]:bg-cream/80"
            : "border-transparent bg-paper"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Brand />

          <nav className="hidden items-center gap-8 lg:flex">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="nav-link text-sm">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <Link href="/entrar?perfil=aluno" className="btn btn-ghost !px-4 !py-2 text-sm">
              <UserRound className="size-4" aria-hidden />
              Área do aluno
            </Link>
            <Link href="/entrar?perfil=sindicato" className="btn btn-light !px-4 !py-2 text-sm">
              <Building2 className="size-4" aria-hidden />
              Sindicato
            </Link>
            <Link href="/#cursos" className="btn btn-primary !px-5 !py-2 text-sm">
              Inscreva-se
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen(true)}
            className="grid size-11 place-items-center rounded-xl bg-cream text-forest shadow-[var(--shadow-soft)] lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-pine/40 backdrop-blur-sm"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-paper p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <Brand size="sm" href={null} />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid size-10 place-items-center rounded-xl bg-cream text-forest shadow-[var(--shadow-soft)]"
                aria-label="Fechar menu"
              >
                <X className="size-5" />
              </button>
            </div>

            <nav className="mt-8 flex flex-col gap-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-3 text-lg font-semibold text-ink hover:bg-cream"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto flex flex-col gap-2 pt-6">
              <Link
                href="/entrar?perfil=aluno"
                onClick={() => setOpen(false)}
                className="btn btn-ghost w-full"
              >
                <UserRound className="size-4" aria-hidden />
                Área do aluno
              </Link>
              <Link
                href="/entrar?perfil=sindicato"
                onClick={() => setOpen(false)}
                className="btn btn-light w-full"
              >
                <Building2 className="size-4" aria-hidden />
                Área do sindicato
              </Link>
              <Link
                href="/#cursos"
                onClick={() => setOpen(false)}
                className="btn btn-primary w-full"
              >
                Inscreva-se
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
