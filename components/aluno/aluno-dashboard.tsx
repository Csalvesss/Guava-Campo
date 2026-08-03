"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock,
  ClipboardList,
  Download,
  LayoutDashboard,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  ShieldCheck,
  Sprout,
  UserRound,
} from "lucide-react";
import { DashboardShell, type NavItem } from "@/components/app/dashboard-shell";
import { InscricaoBadge, Panel, Progress, StatTile, TurmaBadge } from "@/components/app/ui";
import { calcularPercentualFrequencia } from "@/lib/business-rules";
import {
  cursoTipoCurto,
  formatFullDate,
  formatShortDate,
  periodoTurma,
  turmaOfCourse,
  vagasRestantes,
} from "@/lib/catalog";
import { alunos, cursos, inscricoes, turmas } from "@/lib/seed";
import { categoriaLabels } from "@/lib/types";

const aluno = alunos.find((a) => a.id === "aluno-marina") ?? alunos[0];
const minhasInscricoes = inscricoes.filter((i) => i.alunoId === aluno.id);
const concluidos = cursos.filter((c) => aluno.cursosConcluidos.includes(c.id));
const disponiveis = cursos.filter(
  (c) => !aluno.cursosConcluidos.includes(c.id) && !minhasInscricoes.some((i) => i.cursoId === c.id),
);

function proximoEncontro() {
  const now = new Date("2026-08-03T00:00:00-03:00").getTime();
  const futuros = minhasInscricoes
    .flatMap((i) => {
      const turma = turmas.find((t) => t.id === i.turmaId);
      return turma ? turma.encontros.map((e) => ({ data: e.data, turma })) : [];
    })
    .filter((e) => new Date(e.data).getTime() >= now)
    .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
  return futuros[0];
}

const primeiroNome = aluno.nome.split(" ")[0];
const proximo = proximoEncontro();

const nav: NavItem[] = [
  { id: "painel", label: "Meu painel", icon: LayoutDashboard },
  { id: "inscricoes", label: "Minhas inscrições", icon: ClipboardList, badge: minhasInscricoes.length },
  { id: "certificados", label: "Certificados", icon: BadgeCheck },
  { id: "cursos", label: "Cursos disponíveis", icon: BookOpen },
  { id: "dados", label: "Meus dados", icon: UserRound },
];

const titles: Record<string, { title: string; subtitle: string }> = {
  painel: { title: `Olá, ${primeiroNome} 👋`, subtitle: "Acompanhe suas capacitações com o Sindicato Rural." },
  inscricoes: { title: "Minhas inscrições", subtitle: "Status, turmas e grupos das suas capacitações." },
  certificados: { title: "Meus certificados", subtitle: "Documentos concluídos e validação SENAR." },
  cursos: { title: "Cursos disponíveis", subtitle: "Novas turmas abertas para você." },
  dados: { title: "Meus dados", subtitle: "Informações de contato e da propriedade." },
};

export function AlunoDashboard() {
  const [active, setActive] = useState("painel");
  const meta = titles[active];

  return (
    <DashboardShell
      role="Área do aluno"
      userName={aluno.nome}
      userMeta={`CPF ${aluno.cpf}`}
      nav={nav}
      active={active}
      onSelect={setActive}
      title={meta.title}
      subtitle={meta.subtitle}
      actions={
        <Link href="/#inscricao" className="btn btn-primary !px-4 !py-2 text-sm">
          <Sprout className="size-4" aria-hidden />
          <span className="hidden sm:inline">Nova inscrição</span>
        </Link>
      }
    >
      {active === "painel" ? <Painel onNavigate={setActive} /> : null}
      {active === "inscricoes" ? <Inscricoes /> : null}
      {active === "certificados" ? <Certificados /> : null}
      {active === "cursos" ? <Cursos /> : null}
      {active === "dados" ? <Dados /> : null}
    </DashboardShell>
  );
}

/* ---------------- Painel ---------------- */
function Painel({ onNavigate }: { onNavigate: (id: string) => void }) {
  const ativas = minhasInscricoes.filter((i) =>
    ["pendente", "confirmada", "lista_espera"].includes(i.status),
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={ClipboardList} value={ativas} label="Inscrições ativas" hint="em andamento" tone="forest" />
        <StatTile icon={Award} value={concluidos.length} label="Cursos concluídos" hint="no seu histórico" tone="moss" />
        <StatTile icon={BadgeCheck} value={concluidos.length} label="Certificados" hint="prontos para baixar" tone="harvest" />
        <StatTile
          icon={CalendarDays}
          value={proximo ? formatShortDate(proximo.data) : "—"}
          label="Próximo encontro"
          hint={proximo ? proximo.turma.cursoNome.split(":")[0] : "sem agenda"}
          tone="guava"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {proximo ? (
          <Panel title="Próximo encontro" description="Prepare-se para o dia da capacitação">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="grid shrink-0 place-items-center rounded-2xl bg-forest px-6 py-4 text-cream">
                <span className="font-display text-4xl font-semibold leading-none">
                  {new Date(proximo.data).getDate()}
                </span>
                <span className="mt-1 text-xs font-bold uppercase tracking-widest text-harvest">
                  {new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(proximo.data)).replace(".", "")}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl font-semibold text-pine">{proximo.turma.cursoNome}</h3>
                <div className="mt-2 grid gap-1.5 text-sm text-ink-soft">
                  <p className="flex items-center gap-2">
                    <Clock className="size-4 text-forest" aria-hidden /> {formatFullDate(proximo.data)} · início às 08h
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="size-4 text-forest" aria-hidden /> {proximo.turma.local}
                  </p>
                </div>
                {proximo.turma.whatsappGrupoUrl ? (
                  <a
                    href={proximo.turma.whatsappGrupoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-gold mt-4 !py-2 text-sm"
                  >
                    <MessageCircle className="size-4" aria-hidden /> Grupo da turma
                  </a>
                ) : null}
              </div>
            </div>
          </Panel>
        ) : null}

        <Panel title="Continue sua trilha" description="Cursos que combinam com você">
          <ul className="space-y-3">
            {disponiveis.slice(0, 3).map((curso) => (
              <li key={curso.id} className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-forest/8 text-forest">
                  <Sprout className="size-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-pine">{curso.nome}</p>
                  <p className="text-xs text-ink-soft">{curso.eixo} · {curso.cargaHoraria}h</p>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => onNavigate("cursos")}
            className="btn btn-light mt-4 w-full !py-2 text-sm"
          >
            Ver todos os cursos <ArrowRight className="size-4" aria-hidden />
          </button>
        </Panel>
      </div>

      <Panel title="Inscrições recentes" action={<button type="button" onClick={() => onNavigate("inscricoes")} className="text-sm font-semibold text-forest hover:underline">Ver todas</button>}>
        <div className="space-y-3">
          {minhasInscricoes.map((insc) => {
            const turma = turmas.find((t) => t.id === insc.turmaId);
            return (
              <div key={insc.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-paper px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-pine">{turma?.cursoNome}</p>
                  <p className="text-xs text-ink-soft">{turma ? periodoTurma(turma) : ""} · {turma?.local}</p>
                </div>
                <InscricaoBadge status={insc.status} />
              </div>
            );
          })}
        </div>
      </Panel>
    </div>
  );
}

/* ---------------- Inscrições ---------------- */
function Inscricoes() {
  return (
    <div className="space-y-5">
      {minhasInscricoes.map((insc) => {
        const turma = turmas.find((t) => t.id === insc.turmaId);
        const curso = cursos.find((c) => c.id === insc.cursoId);
        if (!turma || !curso) return null;
        const freq = calcularPercentualFrequencia(insc);
        return (
          <Panel key={insc.id}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="chip bg-forest/8 text-forest">{cursoTipoCurto[curso.tipo]}</span>
                  <TurmaBadge status={turma.status} />
                </div>
                <h3 className="mt-2 font-display text-xl font-semibold text-pine">{curso.nome}</h3>
                <div className="mt-2 grid gap-1.5 text-sm text-ink-soft sm:grid-cols-2">
                  <p className="flex items-center gap-2"><CalendarDays className="size-4 text-forest" aria-hidden /> {periodoTurma(turma)}</p>
                  <p className="flex items-center gap-2"><MapPin className="size-4 text-forest" aria-hidden /> {turma.local}</p>
                  <p className="flex items-center gap-2"><Clock className="size-4 text-forest" aria-hidden /> {curso.cargaHoraria} horas</p>
                  <p className="flex items-center gap-2"><ShieldCheck className="size-4 text-forest" aria-hidden /> Prioridade {insc.prioridade}</p>
                </div>
              </div>
              <div className="shrink-0 text-left sm:text-right">
                <InscricaoBadge status={insc.status} />
              </div>
            </div>

            <div className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between text-sm">
                  <span className="font-semibold text-pine">Frequência</span>
                  <span className="text-ink-soft">{freq}%</span>
                </div>
                <div className="mt-2"><Progress value={freq} /></div>
                <p className="mt-1.5 text-xs text-ink-soft">Mínimo de 80% para o certificado.</p>
              </div>
              <div className="grid gap-2 text-sm">
                <StatusLine ok={insc.documentacaoOk} label="Documentação" />
                <StatusLine ok={insc.grupoLiberado} label="Grupo de WhatsApp liberado" />
                <StatusLine ok={insc.aptoCertificado} label="Apto para certificado" />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {turma.whatsappGrupoUrl && insc.grupoLiberado ? (
                <a href={turma.whatsappGrupoUrl} target="_blank" rel="noreferrer" className="btn btn-gold !py-2 text-sm">
                  <MessageCircle className="size-4" aria-hidden /> Entrar no grupo
                </a>
              ) : (
                <span className="chip bg-paper-2 text-ink-soft">Grupo liberado após confirmação</span>
              )}
              {insc.status === "pendente" ? (
                <span className="chip bg-harvest/15 text-harvest-deep">Aguardando confirmação do sindicato</span>
              ) : null}
            </div>
          </Panel>
        );
      })}
    </div>
  );
}

function StatusLine({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <CheckCircle2 className={`size-4 ${ok ? "text-leaf" : "text-line"}`} aria-hidden />
      <span className={ok ? "text-pine" : "text-ink-soft"}>{label}</span>
    </span>
  );
}

/* ---------------- Certificados ---------------- */
function Certificados() {
  if (concluidos.length === 0) {
    return (
      <Panel>
        <p className="text-sm text-ink-soft">
          Você ainda não concluiu nenhum curso. Ao atingir 80% de frequência e ser aprovado pelo
          instrutor, seu certificado aparece aqui.
        </p>
      </Panel>
    );
  }
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {concluidos.map((curso, i) => {
        const codigo = `SJC-2026-${curso.eixo.slice(0, 3).toUpperCase()}-${String(1001 + i)}`;
        return (
          <div key={curso.id} className="card card-soft overflow-hidden">
            <div className="relative flex items-center justify-between gap-4 bg-forest px-6 py-5 text-cream">
              <div
                className="pointer-events-none absolute inset-0 opacity-20"
                style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(216,161,58,0.5) 0 1px, transparent 1px 12px)" }}
                aria-hidden
              />
              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-widest text-harvest">Certificado SENAR</p>
                <h3 className="mt-1 font-display text-lg font-semibold text-white">{curso.nome}</h3>
              </div>
              <Image src="/senar-sp.png" alt="SENAR" width={48} height={48} className="relative size-11 rounded-lg bg-white p-1 object-contain" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Carga horária</p>
                  <p className="font-semibold text-pine">{curso.cargaHoraria} horas</p>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Concluído em</p>
                  <p className="font-semibold text-pine">Julho / 2026</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Código de validação</p>
                  <p className="flex items-center gap-2 font-mono font-semibold text-forest">
                    <QrCode className="size-4" aria-hidden /> {codigo}
                  </p>
                </div>
              </div>
              <button type="button" className="btn btn-primary mt-5 w-full !py-2.5 text-sm">
                <Download className="size-4" aria-hidden /> Baixar certificado (PDF)
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Cursos ---------------- */
function Cursos() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {disponiveis.map((curso) => {
        const turma = turmaOfCourse(curso.id);
        return (
          <div key={curso.id} className="card card-soft flex flex-col p-5">
            <div className="flex items-center justify-between">
              <span className="chip bg-forest/8 text-forest">{cursoTipoCurto[curso.tipo]}</span>
              {turma ? <TurmaBadge status={turma.status} /> : null}
            </div>
            <h3 className="mt-3 font-display text-lg font-semibold text-pine">{curso.nome}</h3>
            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-soft">{curso.descricao}</p>
            <div className="mt-4 flex items-center gap-4 text-xs text-ink-soft">
              <span className="flex items-center gap-1"><Clock className="size-3.5 text-moss" aria-hidden /> {curso.cargaHoraria}h</span>
              {turma ? <span className="flex items-center gap-1"><CalendarDays className="size-3.5 text-moss" aria-hidden /> {formatShortDate(turma.encontros[0].data)}</span> : null}
              {turma ? <span className="flex items-center gap-1"><UserRound className="size-3.5 text-moss" aria-hidden /> {vagasRestantes(turma)} vagas</span> : null}
            </div>
            <Link href="/#inscricao" className="btn btn-light mt-5 w-full !py-2 text-sm">
              Fazer pré-inscrição <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- Dados ---------------- */
function Dados() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Dados pessoais">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Info label="Nome completo" value={aluno.nome} />
          <Info label="CPF" value={aluno.cpf} />
          <Info label="Data de nascimento" value={formatFullDate(aluno.dataNascimento)} />
          <Info label="Categoria" value={categoriaLabels[aluno.categoria]} />
          <Info label="WhatsApp" value={aluno.telefone} icon={Phone} />
          <Info label="E-mail" value={aluno.email ?? "Não informado"} icon={Mail} />
        </dl>
      </Panel>

      <Panel title="Propriedade rural">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Info label="Propriedade" value={aluno.propriedade.nome} />
          <Info label="Município" value={aluno.propriedade.municipio} />
          <Info label="Atividade principal" value={aluno.propriedade.atividadePrincipal} />
          <Info label="CAR" value={aluno.propriedade.car ?? "Não informado"} />
          <Info label="Associado" value={aluno.associado ? "Sim" : "Não"} />
        </dl>
        <button type="button" className="btn btn-primary mt-6 !py-2.5 text-sm">
          Atualizar dados
        </button>
      </Panel>
    </div>
  );
}

function Info({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof Phone }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-ink-soft">{label}</dt>
      <dd className="mt-0.5 flex items-center gap-1.5 font-semibold text-pine">
        {Icon ? <Icon className="size-4 text-moss" aria-hidden /> : null}
        {value}
      </dd>
    </div>
  );
}
