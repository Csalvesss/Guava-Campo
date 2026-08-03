"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  BadgeCheck,
  Bell,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileText,
  GraduationCap,
  LayoutDashboard,
  LockKeyhole,
  MapPinned,
  MessageCircle,
  Plus,
  Search,
  Send,
  ShieldCheck,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import {
  getEnrollmentBlock,
  ordenarFilaPorPrioridade,
  podeEmitirCertificado,
  prioridadePorCategoria,
  resumirSindicato,
  turmaTemVaga,
} from "@/lib/business-rules";
import { alunos, cursos, inscricoes, sindicato, turmas } from "@/lib/seed";
import {
  categoriaLabels,
  inscricaoStatusLabels,
  turmaStatusLabels,
  type CategoriaAluno,
  type Inscricao,
} from "@/lib/types";

type TabId = "portal" | "gestao" | "guava";

const tabs: Array<{ id: TabId; label: string; icon: typeof GraduationCap }> = [
  { id: "portal", label: "Portal do aluno", icon: GraduationCap },
  { id: "gestao", label: "Painel do sindicato", icon: LayoutDashboard },
  { id: "guava", label: "Guava admin", icon: ShieldCheck },
];

const statusTone: Record<string, string> = {
  pendente: "border-[var(--gold)] bg-[#fff8e8] text-[#7b4a05]",
  confirmada: "border-[var(--blue)] bg-[#edf6ff] text-[#0d4e82]",
  lista_espera: "border-[#a5abb0] bg-[#f4f6f7] text-[#4b5861]",
  concluida: "border-[var(--primary)] bg-[#ecf8f0] text-[var(--primary-dark)]",
  reprovada: "border-[var(--danger)] bg-[#fff1ef] text-[var(--danger)]",
  desistente: "border-[#a5abb0] bg-[#f4f6f7] text-[#4b5861]",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function formatRange(dates: string[]) {
  if (dates.length === 0) {
    return "Data a definir";
  }

  if (dates.length === 1) {
    return formatDate(dates[0]);
  }

  return `${formatDate(dates[0])} a ${formatDate(dates[dates.length - 1])}`;
}

function StatusPill({ status }: { status: keyof typeof inscricaoStatusLabels }) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold ${statusTone[status]}`}
    >
      {inscricaoStatusLabels[status]}
    </span>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  accent = "text-[var(--primary)]",
}: {
  icon: typeof Users;
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="surface rounded-lg p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-[var(--muted)]">{label}</span>
        <Icon className={`size-5 ${accent}`} aria-hidden />
      </div>
      <strong className="mt-3 block text-3xl font-semibold tracking-normal">{value}</strong>
    </div>
  );
}

export function GuavaCampoApp() {
  const [activeTab, setActiveTab] = useState<TabId>("portal");
  const [selectedCourseId, setSelectedCourseId] = useState(cursos[0].id);
  const [selectedCategory, setSelectedCategory] = useState<CategoriaAluno>("produtor");
  const [inscricoesState, setInscricoesState] = useState<Inscricao[]>(inscricoes);
  const [lastAction, setLastAction] = useState("Pronto para receber novas inscrições.");

  const alunoPortal = alunos[0];
  const selectedCourse = cursos.find((curso) => curso.id === selectedCourseId) ?? cursos[0];
  const selectedTurma =
    turmas.find((turma) => turma.cursoId === selectedCourse.id && turma.publicadaNoPortal) ??
    turmas[0];
  const enrollmentBlock = getEnrollmentBlock(alunoPortal, selectedCourse, inscricoesState);
  const hasSeat = turmaTemVaga(selectedTurma, inscricoesState);
  const metrics = useMemo(
    () => resumirSindicato(cursos, turmas, inscricoesState, alunos),
    [inscricoesState],
  );
  const fila = ordenarFilaPorPrioridade(
    inscricoesState.filter((inscricao) =>
      ["pendente", "lista_espera"].includes(inscricao.status),
    ),
  );
  const confirmadas = inscricoesState.filter((inscricao) => inscricao.status === "confirmada");

  function simulateEnrollment() {
    if (enrollmentBlock) {
      setLastAction(enrollmentBlock);
      return;
    }

    const status = hasSeat ? "pendente" : "lista_espera";
    const novaInscricao: Inscricao = {
      id: `inscricao-${selectedCourse.id}-${Date.now()}`,
      sindicatoId: sindicato.id,
      turmaId: selectedTurma.id,
      cursoId: selectedCourse.id,
      alunoId: alunoPortal.id,
      alunoNome: alunoPortal.nome,
      cpfSnapshot: alunoPortal.cpf,
      categoriaSnapshot: selectedCategory,
      prioridade: prioridadePorCategoria(selectedCategory),
      status,
      grupoLiberado: false,
      documentacaoOk: selectedCategory !== "publico_geral",
      dataInscricao: new Date().toISOString(),
      presencas: [],
      percentualFrequencia: 0,
      aprovadoInstrutor: false,
      aptoCertificado: false,
      certificadoEmitido: false,
      certificadoUrl: null,
      certificadoCodigoValidacao: null,
    };

    setInscricoesState((current) => [novaInscricao, ...current]);
    setLastAction(
      status === "pendente"
        ? "Inscrição criada como pendente. O grupo de WhatsApp será liberado após confirmação."
        : "Turma cheia. A inscrição entrou automaticamente na lista de espera.",
    );
  }

  function confirmEnrollment(id: string) {
    setInscricoesState((current) =>
      current.map((inscricao) =>
        inscricao.id === id
          ? { ...inscricao, status: "confirmada", grupoLiberado: true }
          : inscricao,
      ),
    );
    setLastAction("Participação confirmada e grupo de WhatsApp liberado para o aluno.");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-[var(--line)] pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white shadow-sm">
            <Image
              src={sindicato.marca.logoUrl}
              alt={sindicato.nome}
              width={56}
              height={56}
              priority
              className="h-14 w-14 object-contain"
            />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-[var(--primary)]">
              Guava Campo
            </p>
            <h1 className="max-w-[760px] text-2xl font-semibold tracking-normal sm:text-3xl">
              {sindicato.nome}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Cursos SENAR, inscrições, frequência, grupos e certificados em um fluxo único.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Image
            src={sindicato.marca.senarLogoUrl}
            alt="SENAR São Paulo"
            width={64}
            height={64}
            className="h-14 w-14 rounded-lg bg-white object-contain p-1 shadow-sm"
          />
          <button
            className="inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--primary-dark)]"
            type="button"
          >
            <Plus className="size-4" aria-hidden />
            Nova turma
          </button>
        </div>
      </header>

      <nav
        className="surface grid gap-2 rounded-lg p-2 sm:grid-cols-3"
        aria-label="Areas do produto"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition ${
                active
                  ? "bg-[var(--primary)] text-white"
                  : "text-[var(--muted)] hover:bg-[#eef6f1] hover:text-[var(--foreground)]"
              }`}
            >
              <Icon className="size-4" aria-hidden />
              {tab.label}
            </button>
          );
        })}
      </nav>

      <section className="grid tight-grid gap-3">
        <Metric icon={BookOpen} label="Cursos publicados" value={metrics.cursosPublicados} />
        <Metric icon={CalendarDays} label="Turmas ativas" value={metrics.turmasEmAndamento} accent="text-[var(--blue)]" />
        <Metric icon={Users} label="Inscrições abertas" value={metrics.inscricoesAtivas} accent="text-[var(--gold)]" />
        <Metric icon={BadgeCheck} label="Aptos a certificado" value={metrics.certificadosAptos} accent="text-[var(--teal)]" />
      </section>

      {activeTab === "portal" ? (
        <PortalView
          selectedCourseId={selectedCourseId}
          selectedCategory={selectedCategory}
          lastAction={lastAction}
          enrollmentBlock={enrollmentBlock}
          hasSeat={hasSeat}
          onCategoryChange={setSelectedCategory}
          onCourseSelect={setSelectedCourseId}
          onEnroll={simulateEnrollment}
        />
      ) : null}

      {activeTab === "gestao" ? (
        <GestaoView
          fila={fila}
          confirmadas={confirmadas}
          lastAction={lastAction}
          onConfirm={confirmEnrollment}
        />
      ) : null}

      {activeTab === "guava" ? <GuavaAdminView /> : null}
    </main>
  );
}

function PortalView({
  selectedCourseId,
  selectedCategory,
  lastAction,
  enrollmentBlock,
  hasSeat,
  onCategoryChange,
  onCourseSelect,
  onEnroll,
}: {
  selectedCourseId: string;
  selectedCategory: CategoriaAluno;
  lastAction: string;
  enrollmentBlock: string | null;
  hasSeat: boolean;
  onCategoryChange: (category: CategoriaAluno) => void;
  onCourseSelect: (courseId: string) => void;
  onEnroll: () => void;
}) {
  const alunoPortal = alunos[0];
  const selectedCourse = cursos.find((curso) => curso.id === selectedCourseId) ?? cursos[0];
  const selectedTurma =
    turmas.find((turma) => turma.cursoId === selectedCourse.id && turma.publicadaNoPortal) ??
    turmas[0];
  const concluido = alunoPortal.cursosConcluidos.includes(selectedCourse.id);

  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-normal">Catálogo público</h2>
            <p className="text-sm text-[var(--muted)]">
              CPF ativo: {alunoPortal.cpf} | {categoriaLabels[alunoPortal.categoria]}
            </p>
          </div>
          <label className="relative block sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[var(--muted)]" />
            <input
              className="w-full rounded-md border border-[var(--line)] bg-white py-2 pl-9 pr-3 text-sm"
              placeholder="Buscar curso"
              aria-label="Buscar curso"
            />
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {cursos.map((curso) => {
            const turma = turmas.find((item) => item.cursoId === curso.id);
            const isSelected = curso.id === selectedCourseId;
            const isDone = alunoPortal.cursosConcluidos.includes(curso.id);

            return (
              <article
                key={curso.id}
                className={`rounded-lg border bg-white p-4 transition ${
                  isSelected
                    ? "border-[var(--primary)] shadow-[0_0_0_3px_rgba(8,122,61,0.12)]"
                    : "border-[var(--line)] shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-[#e8f5ee] text-[var(--primary)]">
                      <BookOpen className="size-5" aria-hidden />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-normal text-[var(--teal)]">
                        {curso.eixo}
                      </p>
                      <h3 className="text-base font-semibold tracking-normal">{curso.nome}</h3>
                    </div>
                  </div>
                  {isDone ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#ecf8f0] px-2 py-1 text-xs font-semibold text-[var(--primary-dark)]">
                      <CheckCircle2 className="size-3.5" aria-hidden />
                      Concluído
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--muted)]">
                  {curso.descricao}
                </p>

                <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                  <span className="rounded-md bg-[#f4f8f6] px-2 py-2">
                    <strong className="block">{curso.cargaHoraria}h</strong>
                    Carga
                  </span>
                  <span className="rounded-md bg-[#f4f8f6] px-2 py-2">
                    <strong className="block">{turma ? turma.capacidade - turma.vagasPreenchidas : 0}</strong>
                    Vagas
                  </span>
                  <span className="rounded-md bg-[#f4f8f6] px-2 py-2">
                    <strong className="block">{curso.tipo}</strong>
                    Tipo
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onCourseSelect(curso.id)}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-[var(--line)] px-3 py-2 text-sm font-semibold transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                  <ArrowUpDown className="size-4" aria-hidden />
                  Ver detalhes
                </button>
              </article>
            );
          })}
        </div>
      </div>

      <aside className="space-y-4">
        <section className="surface rounded-lg p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-[var(--primary)]">
                Próxima turma
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-normal">{selectedCourse.nome}</h2>
            </div>
            {concluido ? (
              <LockKeyhole className="size-5 text-[var(--gold)]" aria-label="Curso bloqueado" />
            ) : (
              <GraduationCap className="size-5 text-[var(--primary)]" aria-hidden />
            )}
          </div>

          <dl className="mt-4 grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
              <dt className="text-[var(--muted)]">Período</dt>
              <dd className="font-semibold">
                {formatRange(selectedTurma.encontros.map((encontro) => encontro.data))}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
              <dt className="text-[var(--muted)]">Local</dt>
              <dd className="font-semibold">{selectedTurma.local}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
              <dt className="text-[var(--muted)]">Status</dt>
              <dd className="font-semibold">{turmaStatusLabels[selectedTurma.status]}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[var(--muted)]">WhatsApp</dt>
              <dd className="font-semibold text-[var(--muted)]">Liberado após confirmação</dd>
            </div>
          </dl>

          <div className="mt-5 rounded-lg border border-[var(--line)] bg-[#f8fbf9] p-4">
            <label className="text-sm font-semibold" htmlFor="categoria">
              Categoria para priorização de vaga
            </label>
            <select
              id="categoria"
              className="mt-2 w-full rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm"
              value={selectedCategory}
              onChange={(event) => onCategoryChange(event.target.value as CategoriaAluno)}
            >
              {Object.entries(categoriaLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label} | prioridade {prioridadePorCategoria(value as CategoriaAluno)}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onEnroll}
              disabled={Boolean(enrollmentBlock)}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--primary-dark)] disabled:cursor-not-allowed disabled:bg-[#9eb9a9]"
            >
              {enrollmentBlock ? (
                <LockKeyhole className="size-4" aria-hidden />
              ) : (
                <Send className="size-4" aria-hidden />
              )}
              {enrollmentBlock ? "Inscrição bloqueada" : hasSeat ? "Solicitar inscrição" : "Entrar na lista de espera"}
            </button>
          </div>

          <p className="mt-4 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm text-[var(--muted)]">
            {lastAction}
          </p>
        </section>

        <section className="surface rounded-lg p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-normal">
            <MessageCircle className="size-5 text-[var(--blue)]" aria-hidden />
            Area do aluno
          </h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-md border border-[var(--line)] bg-white p-3">
              <p className="text-sm font-semibold">Historico por CPF</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {alunoPortal.cursosConcluidos.length} curso concluído impede nova inscrição duplicada.
              </p>
            </div>
            <div className="rounded-md border border-[var(--line)] bg-white p-3">
              <p className="text-sm font-semibold">Grupo da turma</p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                O link fica oculto até a participação ser confirmada pelo sindicato.
              </p>
            </div>
          </div>
        </section>
      </aside>
    </section>
  );
}

function GestaoView({
  fila,
  confirmadas,
  lastAction,
  onConfirm,
}: {
  fila: Inscricao[];
  confirmadas: Inscricao[];
  lastAction: string;
  onConfirm: (id: string) => void;
}) {
  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
      <div className="space-y-5">
        <section>
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-normal">Fila de inscrições</h2>
              <p className="text-sm text-[var(--muted)]">
                Ordenada por regra SENAR: produtor, familiar, colaborador e público geral.
              </p>
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--line)] bg-white px-3 py-2 text-sm font-semibold transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
              type="button"
            >
              <Download className="size-4" aria-hidden />
              Exportar CSV
            </button>
          </div>

          <div className="overflow-hidden rounded-lg border border-[var(--line)] bg-white">
            <div className="grid grid-cols-[1.2fr_0.8fr_0.55fr_0.7fr_0.75fr] gap-3 border-b border-[var(--line)] bg-[#f4f8f6] px-4 py-3 text-xs font-semibold uppercase tracking-normal text-[var(--muted)]">
              <span>Aluno</span>
              <span>Curso</span>
              <span>Prioridade</span>
              <span>Status</span>
              <span className="text-right">Acao</span>
            </div>
            {fila.map((inscricao) => {
              const curso = cursos.find((item) => item.id === inscricao.cursoId);

              return (
                <div
                  key={inscricao.id}
                  className="grid grid-cols-1 gap-3 border-b border-[var(--line)] px-4 py-4 text-sm last:border-b-0 md:grid-cols-[1.2fr_0.8fr_0.55fr_0.7fr_0.75fr] md:items-center"
                >
                  <div>
                    <strong className="block">{inscricao.alunoNome}</strong>
                    <span className="text-[var(--muted)]">
                      {categoriaLabels[inscricao.categoriaSnapshot]}
                    </span>
                  </div>
                  <span>{curso?.nome ?? "Curso"}</span>
                  <span className="font-semibold">{inscricao.prioridade}</span>
                  <StatusPill status={inscricao.status} />
                  <div className="flex justify-start md:justify-end">
                    <button
                      type="button"
                      onClick={() => onConfirm(inscricao.id)}
                      className="inline-flex items-center gap-2 rounded-md bg-[var(--primary)] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[var(--primary-dark)]"
                    >
                      <UserCheck className="size-4" aria-hidden />
                      Confirmar
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <div className="surface rounded-lg p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-normal">
              <ClipboardCheck className="size-5 text-[var(--primary)]" aria-hidden />
              Frequência
            </h2>
            <div className="mt-4 space-y-3">
              {confirmadas.map((inscricao) => (
                <div key={inscricao.id} className="rounded-md border border-[var(--line)] bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{inscricao.alunoNome}</p>
                      <p className="text-sm text-[var(--muted)]">
                        {inscricao.percentualFrequencia}% de presença
                      </p>
                    </div>
                    {inscricao.percentualFrequencia >= 80 ? (
                      <CheckCircle2 className="size-5 text-[var(--primary)]" aria-label="Frequência suficiente" />
                    ) : (
                      <XCircle className="size-5 text-[var(--danger)]" aria-label="Frequência insuficiente" />
                    )}
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e7ece9]">
                    <div
                      className={`h-full rounded-full ${
                        inscricao.percentualFrequencia >= 80
                          ? "bg-[var(--primary)]"
                          : "bg-[var(--danger)]"
                      }`}
                      style={{ width: `${inscricao.percentualFrequencia}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface rounded-lg p-5">
            <h2 className="flex items-center gap-2 text-lg font-semibold tracking-normal">
              <BadgeCheck className="size-5 text-[var(--gold)]" aria-hidden />
              Certificação
            </h2>
            <div className="mt-4 space-y-3">
              {confirmadas.map((inscricao) => {
                const apto = podeEmitirCertificado(inscricao);

                return (
                  <div key={inscricao.id} className="rounded-md border border-[var(--line)] bg-white p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{inscricao.alunoNome}</p>
                        <p className="text-sm text-[var(--muted)]">
                          {apto ? "80% + aprovação do instrutor" : "Trava ativa até cumprir os critérios"}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={!apto}
                        title={apto ? "Emitir certificado" : "Certificado bloqueado"}
                        className="inline-flex size-10 items-center justify-center rounded-md border border-[var(--line)] text-[var(--primary)] transition hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:text-[#9aa8a0]"
                      >
                        {apto ? <FileText className="size-5" aria-hidden /> : <LockKeyhole className="size-5" aria-hidden />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <aside className="space-y-4">
        <section className="surface rounded-lg p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-normal">
            <CalendarDays className="size-5 text-[var(--blue)]" aria-hidden />
            Máquina de estados
          </h2>
          <ol className="mt-4 space-y-3 text-sm">
            {["mobilizacao", "solicitada", "confirmada", "em_andamento", "concluida"].map(
              (status, index) => (
                <li key={status} className="flex items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-md bg-[#edf6ff] font-semibold text-[var(--blue)]">
                    {index + 1}
                  </span>
                  <span>{turmaStatusLabels[status as keyof typeof turmaStatusLabels]}</span>
                </li>
              ),
            )}
          </ol>
        </section>

        <section className="surface rounded-lg p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-normal">
            <MessageCircle className="size-5 text-[var(--primary)]" aria-hidden />
            Liberacao do grupo
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{lastAction}</p>
          <div className="mt-4 rounded-md border border-[var(--line)] bg-white p-3 text-sm">
            <strong>Regra aplicada</strong>
            <p className="mt-1 text-[var(--muted)]">
              Sem confirmação, sem link. Ao confirmar, o campo grupoLiberado vira verdadeiro.
            </p>
          </div>
        </section>
      </aside>
    </section>
  );
}

function GuavaAdminView() {
  return (
    <section className="grid gap-5 lg:grid-cols-[minmax(0,0.95fr)_minmax(360px,1.05fr)]">
      <div className="space-y-4">
        <section className="surface rounded-lg p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-normal">
            <Building2 className="size-5 text-[var(--primary)]" aria-hidden />
            Inquilino inicial
          </h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
              <dt className="text-[var(--muted)]">Sindicato</dt>
              <dd className="font-semibold">{sindicato.nome}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
              <dt className="text-[var(--muted)]">Slug público</dt>
              <dd className="font-mono text-xs font-semibold">/{sindicato.slug}</dd>
            </div>
            <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-3">
              <dt className="text-[var(--muted)]">Plano</dt>
              <dd className="font-semibold uppercase">{sindicato.plano}</dd>
            </div>
            <div className="flex items-center justify-between gap-3">
              <dt className="text-[var(--muted)]">Assinatura</dt>
              <dd className="inline-flex items-center gap-1 font-semibold text-[var(--primary)]">
                <CheckCircle2 className="size-4" aria-hidden />
                Ativa
              </dd>
            </div>
          </dl>
        </section>

        <section className="surface rounded-lg p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-normal">
            <MapPinned className="size-5 text-[var(--blue)]" aria-hidden />
            Cobertura de cursos
          </h2>
          <div className="mt-4 grid gap-3">
            {["Fruticultura", "Pecuária", "Segurança do Trabalho", "Agricultura"].map(
              (eixo, index) => (
                <div key={eixo} className="rounded-md border border-[var(--line)] bg-white p-3">
                  <div className="flex items-center justify-between text-sm">
                    <strong>{eixo}</strong>
                    <span className="text-[var(--muted)]">{82 - index * 11}% atendido</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e7ece9]">
                    <div
                      className="h-full rounded-full bg-[var(--blue)]"
                      style={{ width: `${82 - index * 11}%` }}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        </section>
      </div>

      <div className="space-y-4">
        <section className="surface rounded-lg p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-normal">
            <ShieldCheck className="size-5 text-[var(--primary)]" aria-hidden />
            Modelo multi-inquilino
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {[
              ["sindicatos", "Marca, slug, plano e assinatura"],
              ["alunos", "CPF único por sindicato"],
              ["cursos", "Catálogo publicado no portal"],
              ["turmas", "Estado, vagas e grupo WhatsApp"],
              ["inscrições", "Prioridade, frequência e certificado"],
              ["instrutores", "Credenciamento e alocacao"],
            ].map(([collection, detail]) => (
              <div key={collection} className="rounded-md border border-[var(--line)] bg-white p-3">
                <p className="font-mono text-sm font-semibold text-[var(--primary-dark)]">
                  {collection}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="surface rounded-lg p-5">
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-normal">
            <Bell className="size-5 text-[var(--gold)]" aria-hidden />
            Próximas automações
          </h2>
          <div className="mt-4 space-y-3">
            {[
              "Cloud Function recalcula vagas e lista de espera a cada inscrição.",
              "Cloud Function recalcula frequência e aptidão para certificado.",
              "Geração de PDF com QR de validação pública.",
              "Lembrete de aula por WhatsApp antes de cada encontro.",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-md border border-[var(--line)] bg-white p-3 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--primary)]" aria-hidden />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
