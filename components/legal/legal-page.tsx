import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export type LegalSection = {
  id: string;
  title: string;
  content: ReactNode;
};

export function LegalPage({
  eyebrow,
  title,
  description,
  updatedAt,
  sections,
}: {
  eyebrow: string;
  title: string;
  description: string;
  updatedAt: string;
  sections: LegalSection[];
}) {
  return (
    <div className="grain min-h-screen bg-paper">
      <SiteHeader />
      <main>
        <header className="border-b border-line bg-cream">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
            <span className="eyebrow">{eyebrow}</span>
            <h1 className="mt-4 max-w-4xl font-display text-4xl font-semibold leading-tight text-pine sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-ink-soft">{description}</p>
            <p className="mt-5 text-sm font-semibold text-moss">Última atualização: {updatedAt}</p>
          </div>
        </header>

        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8 lg:py-16">
          <nav aria-label="Nesta política" className="h-fit rounded-lg border border-line bg-cream p-5 lg:sticky lg:top-28">
            <p className="text-sm font-bold text-pine">Nesta página</p>
            <ol className="mt-4 space-y-2.5 text-sm text-ink-soft">
              {sections.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="flex gap-2 hover:text-forest">
                    <span className="text-moss">{String(index + 1).padStart(2, "0")}</span>
                    <span>{section.title}</span>
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <article className="min-w-0 max-w-3xl">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-28 border-b border-line py-8 first:pt-0 last:border-0">
                <h2 className="font-display text-2xl font-semibold text-pine sm:text-3xl">{section.title}</h2>
                <div className="mt-4 space-y-4 text-[0.98rem] leading-7 text-ink-soft">{section.content}</div>
              </section>
            ))}
          </article>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
