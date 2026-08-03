"use client";

import { useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  FileBarChart,
  FileSpreadsheet,
  GraduationCap,
  LayoutDashboard,
  MapPin,
  Percent,
  Phone,
  Plus,
  ShieldCheck,
  TrendingUp,
  Users,
  UsersRound,
  XCircle,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/app/dashboard-shell";
import { InscricaoBadge, Panel, Progress, StatTile, TurmaBadge } from "@/components/app/ui";
import {
  ordenarFilaPorPrioridade,
  resumirSindicato,
} from "@/lib/business-rules";
import { cursoTipoCurto, formatShortDate, periodoTurma, vagasRestantes } from "@/lib/catalog";
import { alunos, cursos, inscricoes, instrutores, sindicato, turmas } from "@/lib/seed";
import { categoriaLabels, turmaStatusLabels, type TurmaStatus } from "@/lib/types";

const resumo = resumirSindicato(cursos, turmas, inscricoes, alunos);
const cursosById = new Map(cursos.map((c) => [c.id, c]));
const turmasById = new Map(turmas.map((t) => [t.id, t]));

const fila = ordenarFilaPorPrioridade(inscricoes);
const filaPendente = fila.filter((i) => ["pendente", "lista_espera"].includes(i.status));

const turmasAtivas = turmas.filter((t) => t.status !== "concluida" && t.status !== "cancelada");
const proximasTurmas = [...turmasAtivas].sort(
  (a, b) => new Date(a.encontros[0].data).getTime() - new Date(b.encontros[0].data).getTime(),
);

const statusCounts = turmas.reduce<Record<string, number>>((acc, t) => {
  acc[t.status] = (acc[t.status] ?? 0) + 1;
  return acc;
}, {});

const totalHoras = turmas.reduce(
  (sum, t) => sum + t.encontros.reduce((s, e) => s + e.cargaHoraria, 0),
  0,
);

const nav: NavItem[] = [
  { id: "painel", label: "Painel geral", icon: LayoutDashboard },
  { id: "fila", label: "Pré-inscrições", icon: ClipboardList, badge: filaPendente.length },
  { id: "turmas", label: "Turmas", icon: CalendarDays },
  { id: "alunos", label: "Alunos", icon: Users },
  { id: "certificados", label: "Certificados", icon: BadgeCheck },
  { id: "relatorios", label: "Relatórios", icon: FileBarChart },
];

const titles: Record<string, { title: string; subtitle: string }> = {
  painel: { title: "Painel do sindicato", subtitle: `${sindicato.nome} · mobilização SENAR-SP` },
  fila: { title: "Fila de pré-inscrições", subtitle: "Ordenada por prioridade e data da solicitação." },
  turmas: { title: "Turmas", subtitle: "Agenda, vagas e status operacional das capacitações." },
  alunos: { title: "Alunos", subtitle: "Base de produtores e trabalhadores rurais." },
  certificados: { title: "Certificados", subtitle: "Aptidão, emissão e histórico dos alunos." },
  relatorios: { title: "Relatórios", subtitle: "Prestação de contas ao SENAR-SP." },
};

export function SindicatoDashboard() {
  const [active, setActive] = useState("painel");
  const meta = titles[active];

  return (
    <DashboardShell
      role="Área do sindicato"
      userName="Equipe de mobilização"
      userMeta={sindicato.municipio}
      nav={nav}
      active={active}
      onSelect={setActive}
      title={meta.title}
      subtitle={meta.subtitle}
      actions={
        <button type="button" className="btn btn-primary !px-4 !py-2 text-sm">
          <Plus className="size-4" aria-hidden />
          <span className="hidden sm:inline">Nova turma</span>
        </button>
      }
    >
      {active === "painel" ? <Painel onNavigate={setActive} /> : null}
      {active === "fila" ? <Fila /> : null}
      {active === "turmas" ? <Turmas /> : null}
      {active === "alunos" ? <Alunos /> : null}
      {active === "certificados" ? <Certificados /> : null}
      {active === "relatorios" ? <Relatorios /> : null}
    </DashboardShell>
  );
}

/* ---------------- Painel ---------------- */
function Painel({ onNavigate }: { onNavigate: (id: string) => void }) {
  const maxStatus = Math.max(...Object.values(statusCounts), 1);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={CalendarDays} value={resumo.turmasEmAndamento} label="Turmas ativas" hint="confirmadas e em andamento" tone="forest" />
        <StatTile icon={ClipboardList} value={resumo.inscricoesAtivas} label="Pré-inscrições" hint="aguardando confirmação" tone="harvest" />
        <StatTile icon={Users} value={resumo.alunosCadastrados} label="Alunos cadastrados" hint="na base do sindicato" tone="moss" />
        <StatTile icon={BadgeCheck} value={resumo.certificadosAptos} label="Aptos a certificado" hint="80% de frequência" tone="guava" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Panel title="Turmas por status" description="Distribuição da mobilização">
          <ul className="space-y-3">
            {(Object.keys(turmaStatusLabels) as TurmaStatus[])
              .filter((s) => statusCounts[s])
              .map((s) => (
                <li key={s}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-pine">{turmaStatusLabels[s]}</span>
                    <span className="text-ink-soft">{statusCounts[s]}</span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-paper-2">
                    <div
                      className="h-full rounded-full bg-forest"
                      style={{ width: `${(statusCounts[s] / maxStatus) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
          </ul>
          {resumo.abaixoDaFrequencia > 0 ? (
            <div className="mt-5 flex items-start gap-3 rounded-xl bg-harvest/12 p-3 text-sm text-harvest-deep">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>
                {resumo.abaixoDaFrequencia} aluno(s) abaixo de 80% de frequência — risco de não certificar.
              </span>
            </div>
          ) : null}
        </Panel>

        <Panel
          title="Fila de pré-inscrição"
          description="Próximos da fila por prioridade"
          action={
            <button type="button" onClick={() => onNavigate("fila")} className="text-sm font-semibold text-forest hover:underline">
              Ver fila
            </button>
          }
        >
          <div className="space-y-2.5">
            {fila.slice(0, 5).map((insc, i) => {
              const turma = turmasById.get(insc.turmaId);
              return (
                <div key={insc.id} className="flex items-center gap-3 rounded-xl border border-line bg-paper px-3 py-2.5">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-forest/8 font-display text-sm font-semibold text-forest">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-pine">{insc.alunoNome}</p>
                    <p className="truncate text-xs text-ink-soft">
                      {categoriaLabels[insc.categoriaSnapshot]} · {turma?.cursoNome}
                    </p>
                  </div>
                  <InscricaoBadge status={insc.status} />
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Panel
        title="Próximas turmas"
        action={
          <button type="button" onClick={() => onNavigate("turmas")} className="text-sm font-semibold text-forest hover:underline">
            Ver todas
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {proximasTurmas.slice(0, 3).map((turma) => {
            const ocupacao = Math.round((turma.vagasPreenchidas / turma.capacidade) * 100);
            return (
              <div key={turma.id} className="rounded-xl border border-line bg-paper p-4">
                <div className="flex items-center justify-between gap-2">
                  <TurmaBadge status={turma.status} />
                  <span className="text-xs text-ink-soft">{formatShortDate(turma.encontros[0].data)}</span>
                </div>
                <h3 className="mt-2.5 font-semibold text-pine">{turma.cursoNome}</h3>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-soft">
                  <MapPin className="size-3.5 text-moss" aria-hidden /> {turma.local}
                </p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-ink-soft">
                    <span>{turma.vagasPreenchidas}/{turma.capacidade} vagas</span>
                    <span>{ocupacao}%</span>
                  </div>
                  <div className="mt-1.5"><Progress value={ocupacao} tone={ocupacao >= 100 ? "harvest" : "forest"} /></div>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

/* ---------------- Fila ---------------- */
function Fila() {
  return (
    <Panel title="Pré-inscrições recebidas" description="Confirme vagas seguindo a ordem de prioridade do SENAR">
      <div className="-mx-5 overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-bold uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3">#</th>
              <th className="px-3 py-3">Aluno</th>
              <th className="px-3 py-3">Curso / turma</th>
              <th className="px-3 py-3">Prioridade</th>
              <th className="px-3 py-3">Doc.</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-5 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {fila.map((insc, i) => {
              const turma = turmasById.get(insc.turmaId);
              return (
                <tr key={insc.id} className="border-b border-line/70 last:border-0 hover:bg-paper">
                  <td className="px-5 py-3 font-display font-semibold text-forest">{i + 1}</td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-pine">{insc.alunoNome}</p>
                    <p className="text-xs text-ink-soft">{categoriaLabels[insc.categoriaSnapshot]} · {insc.cpfSnapshot}</p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="text-pine">{turma?.cursoNome}</p>
                    <p className="text-xs text-ink-soft">{turma ? periodoTurma(turma) : ""}</p>
                  </td>
                  <td className="px-3 py-3">
                    <span className="chip bg-forest/8 text-forest">P{insc.prioridade}</span>
                  </td>
                  <td className="px-3 py-3">
                    {insc.documentacaoOk ? (
                      <CheckCircle2 className="size-5 text-leaf" aria-hidden />
                    ) : (
                      <XCircle className="size-5 text-guava" aria-hidden />
                    )}
                  </td>
                  <td className="px-3 py-3"><InscricaoBadge status={insc.status} /></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1.5">
                      <button type="button" className="rounded-lg bg-forest px-2.5 py-1.5 text-xs font-bold text-cream hover:bg-pine">
                        Confirmar
                      </button>
                      <button type="button" className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-bold text-ink-soft hover:bg-paper-2">
                        Espera
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ---------------- Turmas ---------------- */
function Turmas() {
  return (
    <div className="space-y-5">
      {[...turmas]
        .sort((a, b) => new Date(a.encontros[0].data).getTime() - new Date(b.encontros[0].data).getTime())
        .map((turma) => {
          const curso = cursosById.get(turma.cursoId);
          const ocupacao = Math.round((turma.vagasPreenchidas / turma.capacidade) * 100);
          return (
            <Panel key={turma.id}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <TurmaBadge status={turma.status} />
                    {curso ? <span className="chip bg-paper-2 text-ink-soft">{cursoTipoCurto[curso.tipo]}</span> : null}
                    {turma.numeroOficio ? <span className="chip bg-paper-2 text-ink-soft">Ofício {turma.numeroOficio}</span> : null}
                  </div>
                  <h3 className="mt-2 font-display text-xl font-semibold text-pine">{turma.cursoNome}</h3>
                  <div className="mt-2 grid gap-x-6 gap-y-1.5 text-sm text-ink-soft sm:grid-cols-2">
                    <p className="flex items-center gap-2"><CalendarDays className="size-4 text-forest" aria-hidden /> {periodoTurma(turma)} · {turma.encontros.length} encontros</p>
                    <p className="flex items-center gap-2"><MapPin className="size-4 text-forest" aria-hidden /> {turma.local}</p>
                    <p className="flex items-center gap-2"><GraduationCap className="size-4 text-forest" aria-hidden /> {turma.instrutorNome ?? "Instrutor a definir"}</p>
                    <p className="flex items-center gap-2"><ShieldCheck className="size-4 text-forest" aria-hidden /> {turma.supervisorSenar ? turma.supervisorSenar.nome : "Supervisor a definir"}</p>
                  </div>
                </div>

                <div className="w-full shrink-0 rounded-xl bg-paper p-4 lg:w-64">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-pine">Ocupação</span>
                    <span className="text-ink-soft">{turma.vagasPreenchidas}/{turma.capacidade}</span>
                  </div>
                  <div className="mt-2"><Progress value={ocupacao} tone={ocupacao >= 100 ? "harvest" : "forest"} /></div>
                  <p className="mt-1.5 text-xs text-ink-soft">
                    {vagasRestantes(turma) > 0 ? `${vagasRestantes(turma)} vagas livres` : "Turma lotada"}
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" className="btn btn-light flex-1 !py-1.5 text-xs">Presença</button>
                    <button type="button" className="btn btn-primary flex-1 !py-1.5 text-xs">Editar</button>
                  </div>
                </div>
              </div>
            </Panel>
          );
        })}
    </div>
  );
}

/* ---------------- Alunos ---------------- */
function Alunos() {
  return (
    <Panel title={`${alunos.length} alunos na base`} description="Produtores, familiares e trabalhadores rurais">
      <div className="-mx-5 overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs font-bold uppercase tracking-wide text-ink-soft">
              <th className="px-5 py-3">Aluno</th>
              <th className="px-3 py-3">Categoria</th>
              <th className="px-3 py-3">Propriedade</th>
              <th className="px-3 py-3">Contato</th>
              <th className="px-3 py-3">Concluídos</th>
              <th className="px-5 py-3">Associado</th>
            </tr>
          </thead>
          <tbody>
            {alunos.map((al) => (
              <tr key={al.id} className="border-b border-line/70 last:border-0 hover:bg-paper">
                <td className="px-5 py-3">
                  <p className="font-semibold text-pine">{al.nome}</p>
                  <p className="text-xs text-ink-soft">{al.cpf}</p>
                </td>
                <td className="px-3 py-3">
                  <span className="chip bg-forest/8 text-forest">{categoriaLabels[al.categoria]}</span>
                </td>
                <td className="px-3 py-3">
                  <p className="text-pine">{al.propriedade.nome}</p>
                  <p className="text-xs text-ink-soft">{al.propriedade.atividadePrincipal}</p>
                </td>
                <td className="px-3 py-3 text-ink-soft">
                  <span className="flex items-center gap-1.5"><Phone className="size-3.5 text-moss" aria-hidden /> {al.telefone}</span>
                </td>
                <td className="px-3 py-3">
                  <span className="font-display text-lg font-semibold text-forest">{al.cursosConcluidos.length}</span>
                </td>
                <td className="px-5 py-3">
                  {al.associado ? (
                    <span className="chip bg-leaf/15 text-forest">Associado</span>
                  ) : (
                    <span className="chip bg-paper-2 text-ink-soft">Não</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

/* ---------------- Certificados ---------------- */
function Certificados() {
  const comFrequencia = inscricoes.filter((i) => i.percentualFrequencia > 0 || i.aptoCertificado);
  return (
    <Panel title="Aptidão e emissão" description="Alunos com frequência registrada">
      <div className="space-y-3">
        {comFrequencia.map((insc) => {
          const turma = turmasById.get(insc.turmaId);
          return (
            <div key={insc.id} className="flex flex-wrap items-center gap-4 rounded-xl border border-line bg-paper px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-pine">{insc.alunoNome}</p>
                <p className="text-xs text-ink-soft">{turma?.cursoNome}</p>
              </div>
              <div className="w-28">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 text-ink-soft"><Percent className="size-3.5" aria-hidden /> Freq.</span>
                  <span className="font-semibold text-pine">{insc.percentualFrequencia}%</span>
                </div>
                <div className="mt-1"><Progress value={insc.percentualFrequencia} tone={insc.percentualFrequencia >= 80 ? "forest" : "harvest"} /></div>
              </div>
              {insc.aptoCertificado ? (
                <button type="button" className="btn btn-primary !py-1.5 text-xs">
                  <Download className="size-3.5" aria-hidden /> Emitir
                </button>
              ) : (
                <span className="chip bg-harvest/15 text-harvest-deep">
                  {insc.percentualFrequencia >= 80 ? "Aguardando instrutor" : "Abaixo de 80%"}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/* ---------------- Relatórios ---------------- */
function Relatorios() {
  const supervisores = Array.from(
    new Set(turmas.map((t) => t.supervisorSenar?.nome).filter(Boolean) as string[]),
  );
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={CalendarDays} value={turmas.length} label="Turmas no período" tone="forest" />
        <StatTile icon={UsersRound} value={inscricoes.length} label="Inscrições totais" tone="moss" />
        <StatTile icon={Clock} value={`${totalHoras}h`} label="Carga horária mobilizada" tone="harvest" />
        <StatTile icon={TrendingUp} value={`${resumo.certificadosAptos}`} label="Certificados aptos" tone="guava" />
      </div>

      <Panel title="Prestação de contas ao SENAR-SP" description="Exportações prontas para envio">
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: FileSpreadsheet, title: "Frequência por turma", desc: "Lista de presença consolidada em CSV." },
            { icon: FileBarChart, title: "Relatório de mobilização", desc: "Turmas, vagas e ocupação em PDF." },
            { icon: BadgeCheck, title: "Certificados emitidos", desc: "Histórico com código de validação." },
            { icon: Building2, title: "Ofícios e supervisão", desc: "Documentos por supervisor SENAR." },
          ].map((r) => (
            <button
              key={r.title}
              type="button"
              className="group flex items-center gap-4 rounded-xl border border-line bg-paper p-4 text-left transition hover:border-mist hover:bg-cream"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-forest/8 text-forest">
                <r.icon className="size-5" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-pine">{r.title}</p>
                <p className="text-xs text-ink-soft">{r.desc}</p>
              </div>
              <Download className="size-4 text-ink-soft transition group-hover:text-forest" aria-hidden />
            </button>
          ))}
        </div>
      </Panel>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Instrutores credenciados">
          <ul className="space-y-3">
            {instrutores.map((inst) => (
              <li key={inst.id} className="flex items-center gap-3 rounded-xl border border-line bg-paper px-4 py-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-forest/8 text-forest">
                  <GraduationCap className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-pine">{inst.nome}</p>
                  <p className="truncate text-xs text-ink-soft">{inst.especialidades.join(" · ")}</p>
                </div>
                {inst.credenciado ? (
                  <span className="chip bg-leaf/15 text-forest">Credenciado</span>
                ) : null}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Supervisão SENAR">
          <ul className="space-y-3">
            {supervisores.map((nome) => (
              <li key={nome} className="flex items-center gap-3 rounded-xl border border-line bg-paper px-4 py-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-harvest/15 text-harvest-deep">
                  <ShieldCheck className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-pine">{nome}</p>
                  <p className="text-xs text-ink-soft">Supervisor(a) SENAR-SP</p>
                </div>
                <span className="chip bg-paper-2 text-ink-soft">
                  {turmas.filter((t) => t.supervisorSenar?.nome === nome).length} turmas
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
