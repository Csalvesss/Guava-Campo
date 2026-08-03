"use client";

import { useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  FileBarChart,
  FileSpreadsheet,
  FileUp,
  GraduationCap,
  Info,
  LayoutDashboard,
  MapPin,
  Pencil,
  Percent,
  Phone,
  Plus,
  RotateCcw,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Upload,
  UserPlus,
  Users,
  UsersRound,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/app/dashboard-shell";
import { Modal } from "@/components/app/modal";
import { InscricaoBadge, Panel, Progress, StatTile, TurmaBadge } from "@/components/app/ui";
import { ordenarFilaPorPrioridade, resumirSindicato } from "@/lib/business-rules";
import { cursoTipoCurto, formatShortDate, periodoTurma, vagasRestantes } from "@/lib/catalog";
import {
  downloadCSV,
  downloadDataUrl,
  gerarCertificadoHTML,
  downloadBlob,
  parseAlunosCSV,
  readFileAsDataURL,
  readFileAsText,
} from "@/lib/exports";
import { cursos, instrutores, sindicato } from "@/lib/seed";
import {
  useStore,
  type NovaTurmaInput,
  type NovoAlunoInput,
} from "@/lib/store";
import { diferenciais } from "@/lib/site-content";
import {
  categoriaLabels,
  turmaStatusLabels,
  inscricaoStatusLabels,
  type CategoriaAluno,
  type InscricaoStatus,
  type Turma,
  type TurmaStatus,
} from "@/lib/types";

const cursosById = new Map(cursos.map((c) => [c.id, c]));

const diferencialIcons: Record<string, LucideIcon> = {
  list: ClipboardList,
  lock: ShieldCheck,
  message: Phone,
  badge: BadgeCheck,
  dashboard: LayoutDashboard,
  report: FileBarChart,
};

const titles: Record<string, { title: string; subtitle: string }> = {
  painel: { title: "Painel do sindicato", subtitle: `${sindicato.nome} · mobilização SENAR-SP` },
  fila: { title: "Fila de pré-inscrições", subtitle: "Confirme, coloque em espera ou edite o status." },
  turmas: { title: "Turmas", subtitle: "Crie, edite e acompanhe a agenda das capacitações." },
  alunos: { title: "Alunos", subtitle: "Base de produtores e importação do SENAR." },
  certificados: { title: "Frequência e certificados", subtitle: "Registre presença e emita certificados." },
  relatorios: { title: "Relatórios", subtitle: "Exportações para a prestação de contas ao SENAR-SP." },
};

export function SindicatoDashboard() {
  const store = useStore();
  const [active, setActive] = useState("painel");
  const [turmaModal, setTurmaModal] = useState<{ open: boolean; turma: Turma | null }>({
    open: false,
    turma: null,
  });

  const { turmas, inscricoes, alunos } = store;
  const resumo = useMemo(
    () => resumirSindicato(cursos, turmas, inscricoes, alunos),
    [turmas, inscricoes, alunos],
  );
  const filaPendente = inscricoes.filter((i) => ["pendente", "lista_espera"].includes(i.status));

  const nav: NavItem[] = [
    { id: "painel", label: "Painel geral", icon: LayoutDashboard },
    { id: "fila", label: "Pré-inscrições", icon: ClipboardList, badge: filaPendente.length || undefined },
    { id: "turmas", label: "Turmas", icon: CalendarDays },
    { id: "alunos", label: "Alunos", icon: Users },
    { id: "certificados", label: "Certificados", icon: BadgeCheck },
    { id: "relatorios", label: "Relatórios", icon: FileBarChart },
  ];

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
        <button
          type="button"
          onClick={() => setTurmaModal({ open: true, turma: null })}
          className="btn btn-primary !px-4 !py-2 text-sm"
        >
          <Plus className="size-4" aria-hidden />
          <span className="hidden sm:inline">Nova turma</span>
        </button>
      }
    >
      {active === "painel" ? <Painel resumo={resumo} onNavigate={setActive} /> : null}
      {active === "fila" ? <Fila /> : null}
      {active === "turmas" ? (
        <Turmas onNew={() => setTurmaModal({ open: true, turma: null })} onEdit={(t) => setTurmaModal({ open: true, turma: t })} />
      ) : null}
      {active === "alunos" ? <Alunos /> : null}
      {active === "certificados" ? <Certificados /> : null}
      {active === "relatorios" ? <Relatorios resumo={resumo} /> : null}

      <TurmaFormModal
        open={turmaModal.open}
        turma={turmaModal.turma}
        onClose={() => setTurmaModal({ open: false, turma: null })}
      />
    </DashboardShell>
  );
}

type Resumo = ReturnType<typeof resumirSindicato>;

/* ================= Painel ================= */
function Painel({ resumo, onNavigate }: { resumo: Resumo; onNavigate: (id: string) => void }) {
  const { turmas, inscricoes, resetDemo } = useStore();
  const fila = ordenarFilaPorPrioridade(inscricoes);
  const statusCounts = turmas.reduce<Record<string, number>>((acc, t) => {
    acc[t.status] = (acc[t.status] ?? 0) + 1;
    return acc;
  }, {});
  const maxStatus = Math.max(...Object.values(statusCounts), 1);
  const proximas = [...turmas]
    .filter((t) => t.status !== "concluida" && t.status !== "cancelada")
    .sort((a, b) => new Date(a.encontros[0]?.data ?? 0).getTime() - new Date(b.encontros[0]?.data ?? 0).getTime());

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
          {Object.keys(statusCounts).length === 0 ? (
            <p className="text-sm text-ink-soft">Nenhuma turma cadastrada ainda.</p>
          ) : (
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
                      <div className="h-full rounded-full bg-forest" style={{ width: `${(statusCounts[s] / maxStatus) * 100}%` }} />
                    </div>
                  </li>
                ))}
            </ul>
          )}
          {resumo.abaixoDaFrequencia > 0 ? (
            <div className="mt-5 flex items-start gap-3 rounded-xl bg-harvest/12 p-3 text-sm text-harvest-deep">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              <span>{resumo.abaixoDaFrequencia} aluno(s) abaixo de 80% de frequência — risco de não certificar.</span>
            </div>
          ) : null}
        </Panel>

        <Panel
          title="Fila de pré-inscrição"
          description="Próximos por prioridade"
          action={<button type="button" onClick={() => onNavigate("fila")} className="text-sm font-semibold text-forest hover:underline">Ver fila</button>}
        >
          {fila.length === 0 ? (
            <p className="text-sm text-ink-soft">Sem pré-inscrições no momento.</p>
          ) : (
            <div className="space-y-2.5">
              {fila.slice(0, 5).map((insc, i) => {
                const turma = turmas.find((t) => t.id === insc.turmaId);
                return (
                  <div key={insc.id} className="flex items-center gap-3 rounded-xl border border-line bg-paper px-3 py-2.5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-forest/8 font-display text-sm font-semibold text-forest">{i + 1}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-pine">{insc.alunoNome}</p>
                      <p className="truncate text-xs text-ink-soft">{categoriaLabels[insc.categoriaSnapshot]} · {turma?.cursoNome}</p>
                    </div>
                    <InscricaoBadge status={insc.status} />
                  </div>
                );
              })}
            </div>
          )}
        </Panel>
      </div>

      <Panel title="Próximas turmas" action={<button type="button" onClick={() => onNavigate("turmas")} className="text-sm font-semibold text-forest hover:underline">Ver todas</button>}>
        {proximas.length === 0 ? (
          <p className="text-sm text-ink-soft">Nenhuma turma futura. Clique em “Nova turma” para começar.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {proximas.slice(0, 3).map((turma) => {
              const ocupacao = Math.round((turma.vagasPreenchidas / turma.capacidade) * 100);
              return (
                <div key={turma.id} className="rounded-xl border border-line bg-paper p-4">
                  <div className="flex items-center justify-between gap-2">
                    <TurmaBadge status={turma.status} />
                    <span className="text-xs text-ink-soft">{turma.encontros[0] ? formatShortDate(turma.encontros[0].data) : "—"}</span>
                  </div>
                  <h3 className="mt-2.5 font-semibold text-pine">{turma.cursoNome}</h3>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-soft"><MapPin className="size-3.5 text-moss" aria-hidden /> {turma.local}</p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-ink-soft"><span>{turma.vagasPreenchidas}/{turma.capacidade} vagas</span><span>{ocupacao}%</span></div>
                    <div className="mt-1.5"><Progress value={ocupacao} tone={ocupacao >= 100 ? "harvest" : "forest"} /></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Panel>

      {/* Tutorial / recursos — o que dá pra fazer na plataforma */}
      <Panel title="O que dá pra fazer na plataforma" description="Um guia rápido dos recursos da área do sindicato">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {diferenciais.map((d) => {
            const Icon = diferencialIcons[d.icon] ?? Info;
            return (
              <div key={d.titulo} className="flex gap-3 rounded-xl border border-line bg-paper p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-harvest/15 text-harvest-deep"><Icon className="size-5" aria-hidden /></span>
                <div>
                  <p className="font-semibold text-pine">{d.titulo}</p>
                  <p className="mt-0.5 text-sm text-ink-soft">{d.texto}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Panel>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            if (confirm("Restaurar os dados de demonstração? As alterações locais serão descartadas.")) resetDemo();
          }}
          className="inline-flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-guava"
        >
          <RotateCcw className="size-4" aria-hidden /> Restaurar dados de demonstração
        </button>
      </div>
    </div>
  );
}

/* ================= Fila ================= */
function Fila() {
  const { inscricoes, turmas, setInscricaoStatus } = useStore();
  const fila = ordenarFilaPorPrioridade(inscricoes);

  return (
    <Panel title="Pré-inscrições recebidas" description="Ordem por prioridade do SENAR e data da solicitação">
      {fila.length === 0 ? (
        <p className="text-sm text-ink-soft">Nenhuma pré-inscrição no momento.</p>
      ) : (
        <div className="-mx-5 overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-bold uppercase tracking-wide text-ink-soft">
                <th className="px-5 py-3">#</th>
                <th className="px-3 py-3">Aluno</th>
                <th className="px-3 py-3">Curso / turma</th>
                <th className="px-3 py-3">Prior.</th>
                <th className="px-3 py-3">Doc.</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-5 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {fila.map((insc, i) => {
                const turma = turmas.find((t) => t.id === insc.turmaId);
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
                    <td className="px-3 py-3"><span className="chip bg-forest/8 text-forest">P{insc.prioridade}</span></td>
                    <td className="px-3 py-3">{insc.documentacaoOk ? <CheckCircle2 className="size-5 text-leaf" aria-hidden /> : <XCircle className="size-5 text-guava" aria-hidden />}</td>
                    <td className="px-3 py-3">
                      <select
                        value={insc.status}
                        onChange={(e) => setInscricaoStatus(insc.id, e.target.value as InscricaoStatus)}
                        className="rounded-lg border border-line bg-white px-2 py-1.5 text-xs font-semibold text-pine"
                        aria-label={`Editar status de ${insc.alunoNome}`}
                      >
                        {(Object.keys(inscricaoStatusLabels) as InscricaoStatus[]).map((s) => (
                          <option key={s} value={s}>{inscricaoStatusLabels[s]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button type="button" onClick={() => setInscricaoStatus(insc.id, "confirmada")} className="rounded-lg bg-forest px-2.5 py-1.5 text-xs font-bold text-cream hover:bg-pine">Confirmar</button>
                        <button type="button" onClick={() => setInscricaoStatus(insc.id, "lista_espera")} className="rounded-lg border border-line px-2.5 py-1.5 text-xs font-bold text-ink-soft hover:bg-paper-2">Espera</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

/* ================= Turmas ================= */
function Turmas({ onNew, onEdit }: { onNew: () => void; onEdit: (t: Turma) => void }) {
  const { turmas, deleteTurma } = useStore();
  const ordered = [...turmas].sort(
    (a, b) => new Date(a.encontros[0]?.data ?? 0).getTime() - new Date(b.encontros[0]?.data ?? 0).getTime(),
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-soft">{turmas.length} turma(s) cadastrada(s)</p>
        <button type="button" onClick={onNew} className="btn btn-primary !px-4 !py-2 text-sm">
          <Plus className="size-4" aria-hidden /> Nova turma
        </button>
      </div>

      {ordered.length === 0 ? (
        <Panel><p className="text-sm text-ink-soft">Nenhuma turma. Clique em “Nova turma” para criar a primeira.</p></Panel>
      ) : (
        ordered.map((turma) => {
          const curso = cursosById.get(turma.cursoId);
          const ocupacao = turma.capacidade ? Math.round((turma.vagasPreenchidas / turma.capacidade) * 100) : 0;
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
                    <p className="flex items-center gap-2"><CalendarDays className="size-4 text-forest" aria-hidden /> {turma.encontros.length ? `${periodoTurma(turma)} · ${turma.encontros.length} encontros` : "Sem datas"}</p>
                    <p className="flex items-center gap-2"><MapPin className="size-4 text-forest" aria-hidden /> {turma.local}</p>
                    <p className="flex items-center gap-2"><GraduationCap className="size-4 text-forest" aria-hidden /> {turma.instrutorNome ?? "Instrutor a definir"}</p>
                    <p className="flex items-center gap-2"><ShieldCheck className="size-4 text-forest" aria-hidden /> {turma.supervisorSenar ? turma.supervisorSenar.nome : "Supervisor a definir"}</p>
                  </div>
                </div>

                <div className="w-full shrink-0 rounded-xl bg-paper p-4 lg:w-72">
                  <div className="flex items-center justify-between text-sm"><span className="font-semibold text-pine">Ocupação</span><span className="text-ink-soft">{turma.vagasPreenchidas}/{turma.capacidade}</span></div>
                  <div className="mt-2"><Progress value={ocupacao} tone={ocupacao >= 100 ? "harvest" : "forest"} /></div>
                  <p className="mt-1.5 text-xs text-ink-soft">{vagasRestantes(turma) > 0 ? `${vagasRestantes(turma)} vagas livres` : "Turma lotada"}</p>
                  <div className="mt-3 flex gap-2">
                    <button type="button" onClick={() => onEdit(turma)} className="btn btn-light flex-1 !py-1.5 text-xs"><Pencil className="size-3.5" aria-hidden /> Editar</button>
                    <button
                      type="button"
                      onClick={() => { if (confirm(`Excluir a turma “${turma.cursoNome}”? Esta ação não pode ser desfeita.`)) deleteTurma(turma.id); }}
                      className="btn flex-1 !py-1.5 text-xs text-guava ring-1 ring-guava/30 hover:bg-guava/8"
                    >
                      <Trash2 className="size-3.5" aria-hidden /> Excluir
                    </button>
                  </div>
                </div>
              </div>
            </Panel>
          );
        })
      )}
    </div>
  );
}

/* ================= Alunos ================= */
function Alunos() {
  const { alunos, addAluno, importAlunos } = useStore();
  const [filtro, setFiltro] = useState<"todos" | "concluintes">("todos");
  const [alunoModal, setAlunoModal] = useState(false);
  const [importInfo, setImportInfo] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const lista = filtro === "concluintes" ? alunos.filter((a) => a.cursosConcluidos.length > 0) : alunos;

  async function onImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await readFileAsText(file);
      const parsed = parseAlunosCSV(text);
      if (parsed.length === 0) {
        setImportInfo("Nenhuma linha válida encontrada. Verifique o cabeçalho do CSV.");
      } else {
        const before = alunos.length;
        importAlunos(parsed);
        setImportInfo(`${parsed.length} registro(s) lidos do arquivo (novos são adicionados; CPFs repetidos são ignorados). Base anterior: ${before}.`);
      }
    } catch {
      setImportInfo("Não foi possível ler o arquivo.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function baixarModelo() {
    downloadCSV(
      "modelo-importacao-alunos.csv",
      ["nome", "cpf", "telefone", "categoria", "municipio", "atividade", "associado"],
      [["Maria Aparecida Souza", "000.000.000-00", "(12) 99999-9999", "produtor", "São José dos Campos", "Fruticultura", "sim"]],
    );
  }

  function exportarAlunos() {
    downloadCSV(
      "alunos-sindicato-sjc.csv",
      ["nome", "cpf", "telefone", "categoria", "municipio", "atividade", "associado", "cursos_concluidos"],
      alunos.map((a) => [
        a.nome, a.cpf, a.telefone, categoriaLabels[a.categoria],
        a.propriedade.municipio, a.propriedade.atividadePrincipal,
        a.associado ? "sim" : "não", a.cursosConcluidos.length,
      ]),
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl bg-paper-2 p-1 text-sm font-semibold">
          {(["todos", "concluintes"] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFiltro(f)} className={`rounded-lg px-3 py-1.5 ${filtro === f ? "bg-cream text-forest shadow-[var(--shadow-soft)]" : "text-ink-soft"}`}>
              {f === "todos" ? `Todos (${alunos.length})` : `Concluintes (${alunos.filter((a) => a.cursosConcluidos.length > 0).length})`}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onImportFile} className="hidden" />
          <button type="button" onClick={() => fileRef.current?.click()} className="btn btn-light !px-3 !py-2 text-sm"><FileUp className="size-4" aria-hidden /> Importar SENAR (CSV)</button>
          <button type="button" onClick={baixarModelo} className="btn btn-light !px-3 !py-2 text-sm"><Download className="size-4" aria-hidden /> Modelo</button>
          <button type="button" onClick={() => setAlunoModal(true)} className="btn btn-primary !px-3 !py-2 text-sm"><UserPlus className="size-4" aria-hidden /> Novo aluno</button>
        </div>
      </div>

      {importInfo ? (
        <div className="flex items-start gap-3 rounded-xl border border-leaf/30 bg-leaf/10 p-3 text-sm text-forest">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden /> {importInfo}
        </div>
      ) : null}

      <Panel
        title={filtro === "concluintes" ? "Banco de concluintes" : `${alunos.length} alunos na base`}
        description={filtro === "concluintes" ? "Alunos que já concluíram ao menos um curso" : "Produtores, familiares e trabalhadores rurais"}
        action={<button type="button" onClick={exportarAlunos} className="text-sm font-semibold text-forest hover:underline">Exportar CSV</button>}
      >
        {lista.length === 0 ? (
          <p className="text-sm text-ink-soft">Nenhum aluno neste filtro.</p>
        ) : (
          <div className="-mx-5 overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
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
                {lista.map((al) => (
                  <tr key={al.id} className="border-b border-line/70 last:border-0 hover:bg-paper">
                    <td className="px-5 py-3"><p className="font-semibold text-pine">{al.nome}</p><p className="text-xs text-ink-soft">{al.cpf}</p></td>
                    <td className="px-3 py-3"><span className="chip bg-forest/8 text-forest">{categoriaLabels[al.categoria]}</span></td>
                    <td className="px-3 py-3"><p className="text-pine">{al.propriedade.nome}</p><p className="text-xs text-ink-soft">{al.propriedade.atividadePrincipal}</p></td>
                    <td className="px-3 py-3 text-ink-soft"><span className="flex items-center gap-1.5"><Phone className="size-3.5 text-moss" aria-hidden /> {al.telefone}</span></td>
                    <td className="px-3 py-3"><span className="font-display text-lg font-semibold text-forest">{al.cursosConcluidos.length}</span></td>
                    <td className="px-5 py-3">{al.associado ? <span className="chip bg-leaf/15 text-forest">Associado</span> : <span className="chip bg-paper-2 text-ink-soft">Não</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <AlunoFormModal open={alunoModal} onClose={() => setAlunoModal(false)} onSave={(input) => { addAluno(input); setAlunoModal(false); }} />
    </div>
  );
}

/* ================= Certificados / Frequência ================= */
function Certificados() {
  const { inscricoes, turmas, certificados, updateInscricao, emitirCertificado } = useStore();
  const [uploadFor, setUploadFor] = useState<string | null>(null);
  const elegiveis = inscricoes.filter((i) => ["confirmada", "concluida"].includes(i.status));
  const certByInsc = new Map(certificados.map((c) => [c.inscricaoId, c]));

  function setFreq(id: string, value: number, aprovado: boolean) {
    const v = Math.max(0, Math.min(100, value));
    updateInscricao(id, { percentualFrequencia: v, aptoCertificado: v >= 80 && aprovado });
  }
  function toggleAprovado(id: string, freq: number, aprovadoAtual: boolean) {
    const ap = !aprovadoAtual;
    updateInscricao(id, { aprovadoInstrutor: ap, aptoCertificado: freq >= 80 && ap });
  }

  function baixarCert(inscId: string) {
    const cert = certByInsc.get(inscId);
    if (!cert) return;
    if (cert.dataUrl) {
      downloadDataUrl(cert.fileName ?? `certificado-${cert.codigo}.pdf`, cert.dataUrl);
    } else {
      downloadBlob(`certificado-${cert.codigo}.html`, gerarCertificadoHTML(cert), "text/html;charset=utf-8");
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3 rounded-xl border border-line bg-cream p-4 text-sm text-ink-soft">
        <Info className="mt-0.5 size-4 shrink-0 text-forest" aria-hidden />
        <span>Registre a frequência e a aprovação do instrutor. Ao atingir 80% e aprovação, emita o certificado — anexe o PDF que o SENAR fornece. O aluno passa a baixar exatamente esse arquivo na área dele.</span>
      </div>

      {elegiveis.length === 0 ? (
        <Panel><p className="text-sm text-ink-soft">Nenhuma inscrição confirmada ainda. Confirme pré-inscrições na fila para registrar frequência.</p></Panel>
      ) : (
        <Panel title="Frequência e emissão" description="Alunos das turmas confirmadas">
          <div className="space-y-3">
            {elegiveis.map((insc) => {
              const turma = turmas.find((t) => t.id === insc.turmaId);
              const cert = certByInsc.get(insc.id);
              const apto = insc.percentualFrequencia >= 80 && insc.aprovadoInstrutor;
              return (
                <div key={insc.id} className="flex flex-col gap-4 rounded-xl border border-line bg-paper p-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 lg:flex-1">
                    <p className="font-semibold text-pine">{insc.alunoNome}</p>
                    <p className="text-xs text-ink-soft">{turma?.cursoNome}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <Percent className="size-4 text-moss" aria-hidden />
                      <span className="text-ink-soft">Freq.</span>
                      <input
                        type="number" min={0} max={100} value={insc.percentualFrequencia}
                        onChange={(e) => setFreq(insc.id, Number(e.target.value), insc.aprovadoInstrutor)}
                        className="w-16 rounded-lg border border-line bg-white px-2 py-1 text-sm font-semibold text-pine"
                      />
                      <span className="text-ink-soft">%</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => toggleAprovado(insc.id, insc.percentualFrequencia, insc.aprovadoInstrutor)}
                      className={`chip ${insc.aprovadoInstrutor ? "bg-leaf/15 text-forest" : "bg-paper-2 text-ink-soft"}`}
                    >
                      <Check className="size-3.5" aria-hidden /> {insc.aprovadoInstrutor ? "Aprovado" : "Aprovar"}
                    </button>

                    {cert ? (
                      <div className="flex items-center gap-2">
                        <span className="chip bg-forest text-cream">Emitido</span>
                        <button type="button" onClick={() => baixarCert(insc.id)} className="btn btn-light !py-1.5 text-xs"><Download className="size-3.5" aria-hidden /> Baixar</button>
                        <button type="button" onClick={() => setUploadFor(insc.id)} className="text-xs font-semibold text-forest hover:underline">Reemitir</button>
                      </div>
                    ) : apto ? (
                      <button type="button" onClick={() => setUploadFor(insc.id)} className="btn btn-primary !py-1.5 text-xs"><Upload className="size-3.5" aria-hidden /> Emitir certificado</button>
                    ) : (
                      <span className="chip bg-harvest/15 text-harvest-deep">{insc.percentualFrequencia >= 80 ? "Falta aprovação" : "Abaixo de 80%"}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      )}

      <CertUploadModal
        inscricaoId={uploadFor}
        onClose={() => setUploadFor(null)}
        onEmit={(file) => {
          if (uploadFor) emitirCertificado(uploadFor, file);
          setUploadFor(null);
        }}
      />
    </div>
  );
}

/* ================= Relatórios ================= */
function Relatorios({ resumo }: { resumo: Resumo }) {
  const { turmas, inscricoes, alunos, certificados } = useStore();
  const totalHoras = turmas.reduce((sum, t) => sum + t.encontros.reduce((s, e) => s + e.cargaHoraria, 0), 0);
  const supervisores = Array.from(new Set(turmas.map((t) => t.supervisorSenar?.nome).filter(Boolean) as string[]));

  function relFrequencia() {
    downloadCSV(
      "frequencia-por-turma.csv",
      ["aluno", "cpf", "categoria", "curso", "frequencia_%", "aprovado_instrutor", "apto_certificado", "status"],
      inscricoes.map((i) => {
        const turma = turmas.find((t) => t.id === i.turmaId);
        return [i.alunoNome, i.cpfSnapshot, categoriaLabels[i.categoriaSnapshot], turma?.cursoNome ?? "", i.percentualFrequencia, i.aprovadoInstrutor ? "sim" : "não", i.aptoCertificado ? "sim" : "não", i.status];
      }),
    );
  }
  function relTurmas() {
    downloadCSV(
      "mobilizacao-turmas.csv",
      ["curso", "status", "local", "municipio", "instrutor", "capacidade", "vagas_preenchidas", "encontros", "oficio"],
      turmas.map((t) => [t.cursoNome, turmaStatusLabels[t.status], t.local, t.municipio, t.instrutorNome ?? "", t.capacidade, t.vagasPreenchidas, t.encontros.length, t.numeroOficio ?? ""]),
    );
  }
  function relCertificados() {
    downloadCSV(
      "certificados-emitidos.csv",
      ["aluno", "curso", "carga_horaria", "codigo_validacao", "emitido_em", "arquivo"],
      certificados.map((c) => [c.alunoNome, c.cursoNome, c.cargaHoraria, c.codigo, new Intl.DateTimeFormat("pt-BR").format(new Date(c.emitidoEm)), c.fileName ?? "gerado pela plataforma"]),
    );
  }

  const reports = [
    { icon: FileSpreadsheet, title: "Frequência por turma", desc: "Presença e aprovação, em CSV.", run: relFrequencia },
    { icon: FileBarChart, title: "Relatório de mobilização", desc: "Turmas, vagas e ocupação.", run: relTurmas },
    { icon: BadgeCheck, title: "Certificados emitidos", desc: "Histórico com código de validação.", run: relCertificados },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={CalendarDays} value={turmas.length} label="Turmas no período" tone="forest" />
        <StatTile icon={UsersRound} value={inscricoes.length} label="Inscrições totais" tone="moss" />
        <StatTile icon={Clock} value={`${totalHoras}h`} label="Carga horária mobilizada" tone="harvest" />
        <StatTile icon={TrendingUp} value={certificados.length || resumo.certificadosAptos} label={certificados.length ? "Certificados emitidos" : "Aptos a certificado"} tone="guava" />
      </div>

      <Panel title="Prestação de contas ao SENAR-SP" description="Exportações prontas para envio (baixam de verdade)">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {reports.map((r) => (
            <button key={r.title} type="button" onClick={r.run} className="group flex items-center gap-4 rounded-xl border border-line bg-paper p-4 text-left transition hover:border-mist hover:bg-cream">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-forest/8 text-forest"><r.icon className="size-5" aria-hidden /></span>
              <div className="min-w-0 flex-1"><p className="font-semibold text-pine">{r.title}</p><p className="text-xs text-ink-soft">{r.desc}</p></div>
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
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-forest/8 text-forest"><GraduationCap className="size-5" aria-hidden /></span>
                <div className="min-w-0 flex-1"><p className="font-semibold text-pine">{inst.nome}</p><p className="truncate text-xs text-ink-soft">{inst.especialidades.join(" · ")}</p></div>
                {inst.credenciado ? <span className="chip bg-leaf/15 text-forest">Credenciado</span> : null}
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Supervisão SENAR">
          {supervisores.length === 0 ? (
            <p className="text-sm text-ink-soft">Nenhum supervisor vinculado às turmas atuais.</p>
          ) : (
            <ul className="space-y-3">
              {supervisores.map((nome) => (
                <li key={nome} className="flex items-center gap-3 rounded-xl border border-line bg-paper px-4 py-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-harvest/15 text-harvest-deep"><ShieldCheck className="size-5" aria-hidden /></span>
                  <div className="min-w-0 flex-1"><p className="font-semibold text-pine">{nome}</p><p className="text-xs text-ink-soft">Supervisor(a) SENAR-SP</p></div>
                  <span className="chip bg-paper-2 text-ink-soft">{turmas.filter((t) => t.supervisorSenar?.nome === nome).length} turmas</span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

/* ================= Modais ================= */
function fieldClass() {
  return "field-input";
}

function TurmaFormModal({ open, turma, onClose }: { open: boolean; turma: Turma | null; onClose: () => void }) {
  const { addTurma, updateTurma } = useStore();
  const editing = Boolean(turma);

  const [cursoId, setCursoId] = useState(cursos[0].id);
  const [local, setLocal] = useState("Sede do Sindicato Rural");
  const [municipio, setMunicipio] = useState("São José dos Campos");
  const [instrutorId, setInstrutorId] = useState<string>("");
  const [capacidade, setCapacidade] = useState(20);
  const [dataInicio, setDataInicio] = useState("");
  const [qtdEncontros, setQtdEncontros] = useState(3);
  const [cargaPorEncontro, setCargaPorEncontro] = useState(8);
  const [status, setStatus] = useState<TurmaStatus>("mobilizacao");
  const [numeroOficio, setNumeroOficio] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [supervisor, setSupervisor] = useState("");

  // Prefill on open / when turma changes.
  const initedRef = useRef<string | null>(null);
  const openKey = open ? (turma?.id ?? "novo") : null;
  if (open && initedRef.current !== openKey) {
    initedRef.current = openKey;
    if (turma) {
      setCursoId(turma.cursoId);
      setLocal(turma.local);
      setMunicipio(turma.municipio);
      setInstrutorId(turma.instrutorId ?? "");
      setCapacidade(turma.capacidade);
      setDataInicio(turma.encontros[0]?.data.slice(0, 10) ?? "");
      setQtdEncontros(turma.encontros.length || 1);
      setCargaPorEncontro(turma.encontros[0]?.cargaHoraria ?? 8);
      setStatus(turma.status);
      setNumeroOficio(turma.numeroOficio ?? "");
      setWhatsapp(turma.whatsappGrupoUrl ?? "");
      setSupervisor(turma.supervisorSenar?.nome ?? "");
    } else {
      setCursoId(cursos[0].id);
      setLocal("Sede do Sindicato Rural");
      setMunicipio("São José dos Campos");
      setInstrutorId("");
      setCapacidade(20);
      setDataInicio("");
      setQtdEncontros(3);
      setCargaPorEncontro(8);
      setStatus("mobilizacao");
      setNumeroOficio("");
      setWhatsapp("");
      setSupervisor("");
    }
  }
  if (!open && initedRef.current !== null) initedRef.current = null;

  function buildEncontros() {
    if (!dataInicio) return [];
    const base = new Date(`${dataInicio}T08:00:00-03:00`);
    return Array.from({ length: Math.max(1, qtdEncontros) }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return { data: d.toISOString(), cargaHoraria: cargaPorEncontro };
    });
  }

  function submit() {
    const curso = cursos.find((c) => c.id === cursoId)!;
    const inst = instrutores.find((i) => i.id === instrutorId) ?? null;
    const base: NovaTurmaInput = {
      cursoId,
      cursoNome: curso.nome,
      local,
      municipio,
      instrutorId: inst?.id ?? null,
      instrutorNome: inst?.nome ?? null,
      capacidade,
      encontros: buildEncontros(),
      status,
      numeroOficio: numeroOficio.trim() || null,
      whatsappGrupoUrl: whatsapp.trim() || null,
      supervisorSenar: supervisor.trim() ? { nome: supervisor.trim(), contato: "" } : null,
    };
    if (editing && turma) {
      updateTurma(turma.id, {
        cursoId: base.cursoId, cursoNome: base.cursoNome, local: base.local, municipio: base.municipio,
        instrutorId: base.instrutorId, instrutorNome: base.instrutorNome, capacidade: base.capacidade,
        encontros: base.encontros.length ? base.encontros : turma.encontros, status: base.status,
        numeroOficio: base.numeroOficio, whatsappGrupoUrl: base.whatsappGrupoUrl, supervisorSenar: base.supervisorSenar,
      });
    } else {
      addTurma(base);
    }
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? "Editar turma" : "Nova turma"}
      description="Os cursos seguem o catálogo do SENAR-SP mobilizado pelo sindicato."
      size="lg"
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-light !py-2 text-sm">Cancelar</button>
          <button type="button" onClick={submit} className="btn btn-primary !py-2 text-sm">{editing ? "Salvar alterações" : "Criar turma"}</button>
        </>
      }
    >
      <div className="grid gap-4">
        <Labeled label="Curso">
          <select value={cursoId} onChange={(e) => setCursoId(e.target.value)} className={fieldClass()}>
            {cursos.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        </Labeled>
        <div className="grid gap-4 sm:grid-cols-2">
          <Labeled label="Local"><input value={local} onChange={(e) => setLocal(e.target.value)} className={fieldClass()} /></Labeled>
          <Labeled label="Município"><input value={municipio} onChange={(e) => setMunicipio(e.target.value)} className={fieldClass()} /></Labeled>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Labeled label="Instrutor">
            <select value={instrutorId} onChange={(e) => setInstrutorId(e.target.value)} className={fieldClass()}>
              <option value="">A definir</option>
              {instrutores.map((i) => <option key={i.id} value={i.id}>{i.nome}</option>)}
            </select>
          </Labeled>
          <Labeled label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as TurmaStatus)} className={fieldClass()}>
              {(Object.keys(turmaStatusLabels) as TurmaStatus[]).map((s) => <option key={s} value={s}>{turmaStatusLabels[s]}</option>)}
            </select>
          </Labeled>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Labeled label="Data de início"><input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className={fieldClass()} /></Labeled>
          <Labeled label="Capacidade (vagas)"><input type="number" min={1} value={capacidade} onChange={(e) => setCapacidade(Number(e.target.value))} className={fieldClass()} /></Labeled>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Labeled label="Nº de encontros"><input type="number" min={1} value={qtdEncontros} onChange={(e) => setQtdEncontros(Number(e.target.value))} className={fieldClass()} /></Labeled>
          <Labeled label="Horas por encontro"><input type="number" min={1} value={cargaPorEncontro} onChange={(e) => setCargaPorEncontro(Number(e.target.value))} className={fieldClass()} /></Labeled>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Labeled label="Nº do ofício (opcional)"><input value={numeroOficio} onChange={(e) => setNumeroOficio(e.target.value)} placeholder="OF-2026-0000" className={fieldClass()} /></Labeled>
          <Labeled label="Supervisor SENAR (opcional)"><input value={supervisor} onChange={(e) => setSupervisor(e.target.value)} className={fieldClass()} /></Labeled>
        </div>
        <Labeled label="Grupo de WhatsApp (opcional)"><input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="https://wa.me/55..." className={fieldClass()} /></Labeled>
      </div>
    </Modal>
  );
}

function AlunoFormModal({ open, onClose, onSave }: { open: boolean; onClose: () => void; onSave: (input: NovoAlunoInput) => void }) {
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [categoria, setCategoria] = useState<CategoriaAluno>("produtor");
  const [municipio, setMunicipio] = useState("São José dos Campos");
  const [atividade, setAtividade] = useState("");
  const [associado, setAssociado] = useState(false);

  const initedRef = useRef(false);
  if (open && !initedRef.current) {
    initedRef.current = true;
    setNome(""); setCpf(""); setTelefone(""); setCategoria("produtor"); setMunicipio("São José dos Campos"); setAtividade(""); setAssociado(false);
  }
  if (!open && initedRef.current) initedRef.current = false;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo aluno"
      description="Cadastro manual de produtor ou trabalhador rural."
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-light !py-2 text-sm">Cancelar</button>
          <button
            type="button"
            onClick={() => { if (nome.trim()) onSave({ nome: nome.trim(), cpf, telefone, categoria, municipio, atividadePrincipal: atividade || "Não informado", associado }); }}
            className="btn btn-primary !py-2 text-sm"
          >
            Adicionar
          </button>
        </>
      }
    >
      <div className="grid gap-4">
        <Labeled label="Nome completo"><input value={nome} onChange={(e) => setNome(e.target.value)} className={fieldClass()} /></Labeled>
        <div className="grid gap-4 sm:grid-cols-2">
          <Labeled label="CPF"><input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" className={fieldClass()} /></Labeled>
          <Labeled label="WhatsApp"><input value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="(12) 99999-9999" className={fieldClass()} /></Labeled>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Labeled label="Categoria">
            <select value={categoria} onChange={(e) => setCategoria(e.target.value as CategoriaAluno)} className={fieldClass()}>
              {Object.entries(categoriaLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </Labeled>
          <Labeled label="Município"><input value={municipio} onChange={(e) => setMunicipio(e.target.value)} className={fieldClass()} /></Labeled>
        </div>
        <Labeled label="Atividade principal"><input value={atividade} onChange={(e) => setAtividade(e.target.value)} placeholder="Ex.: Fruticultura" className={fieldClass()} /></Labeled>
        <label className="flex items-center gap-2 text-sm font-semibold text-pine">
          <input type="checkbox" checked={associado} onChange={(e) => setAssociado(e.target.checked)} className="size-4 accent-[var(--color-forest)]" />
          Associado ao sindicato
        </label>
      </div>
    </Modal>
  );
}

function CertUploadModal({ inscricaoId, onClose, onEmit }: { inscricaoId: string | null; onClose: () => void; onEmit: (file: { fileName: string; dataUrl: string } | null) => void }) {
  const [file, setFile] = useState<{ fileName: string; dataUrl: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const initedRef = useRef(false);
  const open = inscricaoId !== null;
  if (open && !initedRef.current) { initedRef.current = true; setFile(null); }
  if (!open && initedRef.current) initedRef.current = false;

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setBusy(true);
    try {
      const dataUrl = await readFileAsDataURL(f);
      setFile({ fileName: f.name, dataUrl });
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Emitir certificado"
      description="Anexe o certificado (PDF) fornecido pelo SENAR. O aluno baixará exatamente este arquivo."
      footer={
        <>
          <button type="button" onClick={onClose} className="btn btn-light !py-2 text-sm">Cancelar</button>
          <button type="button" onClick={() => onEmit(file)} className="btn btn-primary !py-2 text-sm" disabled={busy}>
            {file ? "Emitir com este arquivo" : "Emitir (gerar na plataforma)"}
          </button>
        </>
      }
    >
      <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-mist bg-cream px-6 py-10 text-center hover:border-forest">
        <Upload className="size-7 text-forest" aria-hidden />
        <span className="font-semibold text-pine">{file ? file.fileName : "Selecionar arquivo do certificado"}</span>
        <span className="text-xs text-ink-soft">PDF ou imagem · opcional</span>
        <input type="file" accept=".pdf,image/*" onChange={onPick} className="hidden" />
      </label>
      <p className="mt-4 flex items-start gap-2 text-xs text-ink-soft">
        <Info className="mt-0.5 size-3.5 shrink-0 text-forest" aria-hidden />
        Sem anexo, a plataforma gera um certificado padrão com o código de validação — útil para testes até o PDF oficial chegar.
      </p>
    </Modal>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-pine">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
