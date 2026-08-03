import { turmas } from "./seed";
import type { CursoTipo, Turma } from "./types";

export const cursoTipoLabels: Record<CursoTipo, string> = {
  FPR: "Formação Profissional Rural",
  PromocaoSocial: "Promoção Social",
  Tecnico: "Curso Técnico",
};

export const cursoTipoCurto: Record<CursoTipo, string> = {
  FPR: "FPR",
  PromocaoSocial: "Promoção Social",
  Tecnico: "Técnico",
};

export function turmaOfCourse(courseId: string): Turma | undefined {
  const publicadas = turmas.filter((t) => t.cursoId === courseId && t.publicadaNoPortal);
  // prefer confirmed/ongoing turmas, then the soonest
  const ordered = [...publicadas].sort((a, b) => {
    const rank = (t: Turma) =>
      t.status === "confirmada" || t.status === "em_andamento" ? 0 : t.status === "solicitada" ? 1 : 2;
    if (rank(a) !== rank(b)) return rank(a) - rank(b);
    return new Date(a.encontros[0].data).getTime() - new Date(b.encontros[0].data).getTime();
  });
  return ordered[0];
}

export function vagasRestantes(turma: Turma): number {
  return Math.max(turma.capacidade - turma.vagasPreenchidas, 0);
}

export function formatShortDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" })
    .format(new Date(value))
    .replace(".", "");
}

export function formatFullDate(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatWeekday(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", { weekday: "short" })
    .format(new Date(value))
    .replace(".", "");
}

export function formatTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(
    new Date(value),
  );
}

export function periodoTurma(turma: Turma): string {
  const primeiro = turma.encontros[0].data;
  const ultimo = turma.encontros[turma.encontros.length - 1].data;
  if (primeiro === ultimo) return formatFullDate(primeiro);
  return `${formatShortDate(primeiro)} – ${formatShortDate(ultimo)}`;
}
