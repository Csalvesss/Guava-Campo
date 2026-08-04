"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { TurmaBadge } from "@/components/app/ui";
import { getEnrollmentBlock, turmaTemVaga } from "@/lib/business-rules";
import {
  cursoTipoCurto,
  formatShortDate,
  periodoTurma,
  turmaOfCourseFrom,
  vagasRestantes,
} from "@/lib/catalog";
import { cursos } from "@/lib/seed";
import { useStore, type InscricaoAlunoResultado } from "@/lib/store";
import type { Aluno } from "@/lib/types";

type Feedback = InscricaoAlunoResultado & { courseId: string };

export function CourseEnrollment({
  aluno,
  requestedCourseId,
}: {
  aluno: Aluno;
  requestedCourseId?: string;
}) {
  const store = useStore();
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const orderedCourses = useMemo(
    () =>
      cursos
        .filter((curso) => curso.ativo)
        .sort((a, b) => {
          if (a.id === requestedCourseId) return -1;
          if (b.id === requestedCourseId) return 1;
          return a.nome.localeCompare(b.nome, "pt-BR");
        }),
    [requestedCourseId],
  );

  function handleEnrollment(selectedCourseId: string) {
    const result = store.inscreverAluno({ alunoId: aluno.id, cursoId: selectedCourseId });
    setFeedback({ ...result, courseId: selectedCourseId });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-forest/15 bg-forest/5 p-4 text-sm text-ink-soft">
        <p className="flex items-start gap-2 font-semibold text-pine">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-forest" aria-hidden />
          A inscrição é validada pelo CPF {aluno.cpf}.
        </p>
        <p className="mt-1 pl-6">
          O sistema bloqueia cursos já concluídos e turmas com aulas no mesmo dia de outra inscrição ativa.
        </p>
      </div>

      {feedback ? (
        <div
          className={`rounded-xl border p-4 text-sm ${
            feedback.ok
              ? "border-leaf/30 bg-leaf/10 text-forest"
              : "border-guava/25 bg-guava/10 text-guava"
          }`}
        >
          <p className="flex items-start gap-2 font-bold">
            {feedback.ok ? (
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden />
            ) : (
              <AlertCircle className="mt-0.5 size-5 shrink-0" aria-hidden />
            )}
            {feedback.titulo}
          </p>
          <p className="mt-1 pl-7">{feedback.mensagem}</p>
        </div>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {orderedCourses.map((curso, index) => {
          const turma = turmaOfCourseFrom(store.turmas, curso.id);
          const block = turma
            ? getEnrollmentBlock(aluno, curso, turma, store.inscricoes, store.turmas)
            : "Nenhuma turma publicada no momento.";
          const hasSeat = turma ? turmaTemVaga(turma, store.inscricoes) : false;
          const highlighted = curso.id === requestedCourseId;
          const currentFeedback = feedback?.courseId === curso.id ? feedback : null;

          return (
            <article
              key={curso.id}
              className={`card card-soft flex flex-col overflow-hidden border transition ${
                highlighted ? "border-forest ring-2 ring-leaf/35" : "border-transparent"
              }`}
            >
              <div className="relative h-36 overflow-hidden bg-pine">
                <Image
                  src="/hero-cursos-senar.png"
                  alt=""
                  fill
                  className="object-cover opacity-90"
                  sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  loading={index < 2 ? "eager" : "lazy"}
                  style={{ objectPosition: `${18 + (index % 4) * 18}% center` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-pine via-pine/35 to-transparent" />
                <span className="chip absolute left-3 top-3 bg-cream/95 text-forest">
                  {cursoTipoCurto[curso.tipo]}
                </span>
                {turma ? (
                  <span className="absolute right-3 top-3"><TurmaBadge status={turma.status} /></span>
                ) : null}
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className="text-xs font-bold uppercase text-moss">{curso.eixo}</p>
                <h3 className="mt-1 font-display text-xl font-semibold text-pine">{curso.nome}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{curso.descricao}</p>

                {turma ? (
                  <div className="mt-4 grid gap-2 text-xs text-ink-soft">
                    <span className="flex items-center gap-2"><CalendarDays className="size-3.5 text-moss" aria-hidden /> {periodoTurma(turma)}</span>
                    <span className="flex items-center gap-2"><MapPin className="size-3.5 text-moss" aria-hidden /> {turma.local}</span>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                      <span className="flex items-center gap-1.5"><Clock className="size-3.5 text-moss" aria-hidden /> {curso.cargaHoraria}h</span>
                      <span className="flex items-center gap-1.5"><UserRound className="size-3.5 text-moss" aria-hidden /> {hasSeat ? `${vagasRestantes(turma)} vagas` : "Lista de espera"}</span>
                      <span>Início {formatShortDate(turma.encontros[0].data)}</span>
                    </div>
                  </div>
                ) : null}

                {block ? (
                  <p className="mt-4 rounded-lg bg-paper-2 p-3 text-xs leading-relaxed text-ink-soft">
                    {block}
                  </p>
                ) : currentFeedback?.ok ? (
                  <p className="mt-4 rounded-lg bg-leaf/10 p-3 text-xs font-semibold text-forest">
                    Inscrição registrada com status {currentFeedback.status?.replace("_", " ")}.
                  </p>
                ) : null}

                <button
                  type="button"
                  onClick={() => handleEnrollment(curso.id)}
                  disabled={Boolean(block)}
                  className="btn btn-primary mt-5 w-full !py-2.5 text-sm disabled:cursor-not-allowed disabled:bg-ink/10 disabled:text-ink-soft disabled:shadow-none"
                >
                  {block ? "Indisponível" : hasSeat ? "Solicitar inscrição" : "Entrar na lista de espera"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
