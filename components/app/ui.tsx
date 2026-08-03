import type { LucideIcon } from "lucide-react";
import {
  inscricaoStatusLabels,
  turmaStatusLabels,
  type InscricaoStatus,
  type TurmaStatus,
} from "@/lib/types";

/* ---- Stat tile ---- */
export function StatTile({
  icon: Icon,
  value,
  label,
  hint,
  tone = "forest",
}: {
  icon: LucideIcon;
  value: string | number;
  label: string;
  hint?: string;
  tone?: "forest" | "harvest" | "guava" | "moss";
}) {
  const tones: Record<string, string> = {
    forest: "bg-forest/10 text-forest",
    harvest: "bg-harvest/15 text-harvest-deep",
    guava: "bg-guava/12 text-guava",
    moss: "bg-moss/12 text-moss",
  };
  return (
    <div className="card card-soft flex items-start gap-4 p-5">
      <span className={`grid size-11 shrink-0 place-items-center rounded-xl ${tones[tone]}`}>
        <Icon className="size-5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="font-display text-3xl font-semibold leading-none text-pine">{value}</p>
        <p className="mt-1.5 text-sm font-semibold text-ink">{label}</p>
        {hint ? <p className="text-xs text-ink-soft">{hint}</p> : null}
      </div>
    </div>
  );
}

/* ---- Panel ---- */
export function Panel({
  title,
  description,
  action,
  children,
  className = "",
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`card card-soft overflow-hidden ${className}`}>
      {title ? (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-pine">{title}</h2>
            {description ? <p className="text-sm text-ink-soft">{description}</p> : null}
          </div>
          {action}
        </div>
      ) : null}
      <div className="p-5">{children}</div>
    </section>
  );
}

/* ---- Status pills ---- */
const inscricaoTone: Record<InscricaoStatus, string> = {
  pendente: "bg-harvest/18 text-harvest-deep",
  confirmada: "bg-leaf/15 text-forest",
  lista_espera: "bg-clay/15 text-clay",
  concluida: "bg-forest text-cream",
  reprovada: "bg-guava/15 text-guava",
  desistente: "bg-ink/8 text-ink-soft",
};

export function InscricaoBadge({ status }: { status: InscricaoStatus }) {
  return <span className={`chip ${inscricaoTone[status]}`}>{inscricaoStatusLabels[status]}</span>;
}

const turmaTone: Record<TurmaStatus, string> = {
  mobilizacao: "bg-harvest/18 text-harvest-deep",
  solicitada: "bg-clay/15 text-clay",
  confirmada: "bg-leaf/15 text-forest",
  em_andamento: "bg-forest text-cream",
  concluida: "bg-moss/15 text-moss",
  cancelada: "bg-guava/15 text-guava",
};

export function TurmaBadge({ status }: { status: TurmaStatus }) {
  return <span className={`chip ${turmaTone[status]}`}>{turmaStatusLabels[status]}</span>;
}

/* ---- Progress bar ---- */
export function Progress({ value, tone = "forest" }: { value: number; tone?: "forest" | "harvest" }) {
  const bar = tone === "harvest" ? "bg-harvest" : "bg-forest";
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-paper-2">
      <div className={`h-full rounded-full ${bar}`} style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }} />
    </div>
  );
}
