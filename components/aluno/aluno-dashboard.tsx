"use client";

import Image from "next/image";
import { useState } from "react";
import {
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
import { CourseEnrollment } from "@/components/aluno/course-enrollment";
import { InscricaoBadge, Panel, Progress, StatTile, TurmaBadge } from "@/components/app/ui";
import {
  cursoTipoCurto,
  formatFullDate,
  formatShortDate,
  periodoTurma,
} from "@/lib/catalog";
import { downloadBlob, downloadDataUrl, gerarCertificadoHTML } from "@/lib/exports";
import { cursos } from "@/lib/seed";
import { useStore, type Certificado } from "@/lib/store";
import { categoriaLabels } from "@/lib/types";
import type { Aluno, Curso, Inscricao, Turma } from "@/lib/types";

const REF_DATE = new Date("2026-08-04T00:00:00-03:00").getTime();

export function AlunoDashboard({ alunoId, courseId }: { alunoId: string; courseId?: string }) {
  const store = useStore();
  const [active, setActive] = useState(courseId ? "cursos" : "painel");

  const aluno = store.alunos.find((a) => a.id === alunoId) ?? store.alunos[0];
  const minhasInscricoes = store.inscricoes.filter((i) => i.alunoId === aluno.id);
  const meusCertificados = store.certificados.filter((c) => c.alunoId === aluno.id);
  const concluidos = cursos.filter((c) => aluno.cursosConcluidos.includes(c.id));
  const disponiveis = cursos.filter(
    (c) => !aluno.cursosConcluidos.includes(c.id) && !minhasInscricoes.some((i) => i.cursoId === c.id),
  );

  const proximo = (() => {
    const futuros = minhasInscricoes
      .flatMap((i) => {
        const turma = store.turmas.find((t) => t.id === i.turmaId);
        return turma ? turma.encontros.map((e) => ({ data: e.data, turma })) : [];
      })
      .filter((e) => new Date(e.data).getTime() >= REF_DATE)
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
    return futuros[0];
  })();

  const primeiroNome = aluno.nome.split(" ")[0];
  const totalCertificados = meusCertificados.length + concluidos.filter((c) => !meusCertificados.some((m) => m.cursoId === c.id)).length;

  const nav: NavItem[] = [
    { id: "painel", label: "Meu painel", icon: LayoutDashboard },
    { id: "inscricoes", label: "Minhas inscrições", icon: ClipboardList, badge: minhasInscricoes.length || undefined },
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
        <button type="button" onClick={() => setActive("cursos")} className="btn btn-primary !px-4 !py-2 text-sm">
          <Sprout className="size-4" aria-hidden />
          <span className="hidden sm:inline">Nova inscrição</span>
        </button>
      }
    >
      {active === "painel" ? (
        <Painel
          minhasInscricoes={minhasInscricoes}
          turmas={store.turmas}
          disponiveis={disponiveis}
          concluidos={concluidos}
          totalCertificados={totalCertificados}
          proximo={proximo}
          onNavigate={setActive}
        />
      ) : null}
      {active === "inscricoes" ? <Inscricoes minhasInscricoes={minhasInscricoes} turmas={store.turmas} onNavigate={setActive} /> : null}
      {active === "certificados" ? <Certificados certificados={meusCertificados} concluidos={concluidos} aluno={aluno} /> : null}
      {active === "cursos" ? <CourseEnrollment aluno={aluno} requestedCourseId={courseId} /> : null}
      {active === "dados" ? <Dados aluno={aluno} /> : null}
    </DashboardShell>
  );
}

/* ---------------- Painel ---------------- */
function Painel({
  minhasInscricoes,
  turmas,
  disponiveis,
  concluidos,
  totalCertificados,
  proximo,
  onNavigate,
}: {
  minhasInscricoes: Inscricao[];
  turmas: Turma[];
  disponiveis: Curso[];
  concluidos: Curso[];
  totalCertificados: number;
  proximo?: { data: string; turma: Turma };
  onNavigate: (id: string) => void;
}) {
  const ativas = minhasInscricoes.filter((i) => ["pendente", "confirmada", "lista_espera"].includes(i.status)).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile icon={ClipboardList} value={ativas} label="Inscrições ativas" hint="em andamento" tone="forest" />
        <StatTile icon={Award} value={concluidos.length} label="Cursos concluídos" hint="no seu histórico" tone="moss" />
        <StatTile icon={BadgeCheck} value={totalCertificados} label="Certificados" hint="prontos para baixar" tone="harvest" />
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
                <span className="font-display text-4xl font-semibold leading-none">{new Date(proximo.data).getDate()}</span>
                <span className="mt-1 text-xs font-bold uppercase tracking-widest text-harvest">
                  {new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(new Date(proximo.data)).replace(".", "")}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl font-semibold text-pine">{proximo.turma.cursoNome}</h3>
                <div className="mt-2 grid gap-1.5 text-sm text-ink-soft">
                  <p className="flex items-center gap-2"><Clock className="size-4 text-forest" aria-hidden /> {formatFullDate(proximo.data)} · início às 08h</p>
                  <p className="flex items-center gap-2"><MapPin className="size-4 text-forest" aria-hidden /> {proximo.turma.local}</p>
                </div>
                {proximo.turma.whatsappGrupoUrl ? (
                  <a href={proximo.turma.whatsappGrupoUrl} target="_blank" rel="noreferrer" className="btn btn-gold mt-4 !py-2 text-sm">
                    <MessageCircle className="size-4" aria-hidden /> Grupo da turma
                  </a>
                ) : null}
              </div>
            </div>
          </Panel>
        ) : (
          <Panel title="Sua agenda" description="Nenhum encontro marcado">
            <p className="text-sm text-ink-soft">Assim que uma turma for confirmada, o próximo encontro aparece aqui.</p>
          </Panel>
        )}

        <Panel title="Continue sua trilha" description="Cursos que combinam com você">
          <ul className="space-y-3">
            {disponiveis.slice(0, 3).map((curso) => (
              <li key={curso.id} className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-forest/8 text-forest"><Sprout className="size-5" aria-hidden /></span>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold text-pine">{curso.nome}</p><p className="text-xs text-ink-soft">{curso.eixo} · {curso.cargaHoraria}h</p></div>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => onNavigate("cursos")} className="btn btn-light mt-4 w-full !py-2 text-sm">Ver todos os cursos</button>
        </Panel>
      </div>

      <Panel title="Inscrições recentes" action={<button type="button" onClick={() => onNavigate("inscricoes")} className="text-sm font-semibold text-forest hover:underline">Ver todas</button>}>
        {minhasInscricoes.length === 0 ? (
          <p className="text-sm text-ink-soft">Você ainda não tem inscrições. Explore os cursos disponíveis.</p>
        ) : (
          <div className="space-y-3">
            {minhasInscricoes.map((insc) => {
              const turma = turmas.find((t) => t.id === insc.turmaId);
              return (
                <button key={insc.id} type="button" onClick={() => onNavigate(["concluida"].includes(insc.status) ? "certificados" : "inscricoes")} className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl bg-paper-2 px-4 py-3 text-left transition hover:bg-mist/40">
                  <div className="min-w-0"><p className="truncate font-semibold text-pine">{turma?.cursoNome}</p><p className="text-xs text-ink-soft">{turma ? periodoTurma(turma) : ""} · {turma?.local}</p></div>
                  <InscricaoBadge status={insc.status} />
                </button>
              );
            })}
          </div>
        )}
      </Panel>
    </div>
  );
}

/* ---------------- Inscrições ---------------- */
function Inscricoes({ minhasInscricoes, turmas, onNavigate }: { minhasInscricoes: Inscricao[]; turmas: Turma[]; onNavigate: (id: string) => void }) {
  if (minhasInscricoes.length === 0) {
    return <Panel><p className="text-sm text-ink-soft">Você ainda não tem inscrições.</p></Panel>;
  }
  return (
    <div className="space-y-5">
      {minhasInscricoes.map((insc) => {
        const turma = turmas.find((t) => t.id === insc.turmaId);
        const curso = cursos.find((c) => c.id === insc.cursoId);
        if (!turma || !curso) return null;
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
                  <p className="flex items-center gap-2"><MapPin className="size-4 text-forest" aria-hidden /> {turma.endereco || turma.local}</p>
                  <p className="flex items-center gap-2"><Clock className="size-4 text-forest" aria-hidden /> {curso.cargaHoraria} horas</p>
                  <p className="flex items-center gap-2"><ShieldCheck className="size-4 text-forest" aria-hidden /> Prioridade {insc.prioridade}</p>
                </div>
                {turma.mapsUrl ? (
                  <a href={turma.mapsUrl} target="_blank" rel="noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-forest hover:underline">
                    <MapPin className="size-4" aria-hidden /> Ver no mapa
                  </a>
                ) : null}
              </div>
              <div className="shrink-0"><InscricaoBadge status={insc.status} /></div>
            </div>

            <div className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
              <div>
                <div className="flex items-center justify-between text-sm"><span className="font-semibold text-pine">Frequência</span><span className="text-ink-soft">{insc.percentualFrequencia}%</span></div>
                <div className="mt-2"><Progress value={insc.percentualFrequencia} /></div>
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
                <a href={turma.whatsappGrupoUrl} target="_blank" rel="noreferrer" className="btn btn-gold !py-2 text-sm"><MessageCircle className="size-4" aria-hidden /> Entrar no grupo</a>
              ) : (
                <span className="chip bg-paper-2 text-ink-soft">Grupo liberado após confirmação</span>
              )}
              {insc.status === "pendente" ? <span className="chip bg-harvest/15 text-harvest-deep">Aguardando confirmação do sindicato</span> : null}
              {insc.status === "concluida" ? (
                <button type="button" onClick={() => onNavigate("certificados")} className="btn btn-primary !py-2 text-sm">
                  <BadgeCheck className="size-4" aria-hidden /> Ver meu certificado
                </button>
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
function Certificados({ certificados, concluidos, aluno }: { certificados: Certificado[]; concluidos: Curso[]; aluno: Aluno }) {
  // Cursos concluídos sem certificado emitido pelo sindicato (histórico) — gerados sob demanda.
  const historicos = concluidos.filter((c) => !certificados.some((cert) => cert.cursoId === c.id));

  function baixar(cert: Certificado) {
    if (cert.dataUrl) downloadDataUrl(cert.fileName ?? `certificado-${cert.codigo}.pdf`, cert.dataUrl);
    else downloadBlob(`certificado-${cert.codigo}.html`, gerarCertificadoHTML(cert), "text/html;charset=utf-8");
  }

  function baixarHistorico(curso: Curso) {
    const cert: Certificado = {
      id: curso.id, inscricaoId: "", alunoId: aluno.id, alunoNome: aluno.nome,
      cursoId: curso.id, cursoNome: curso.nome, turmaId: "", cargaHoraria: curso.cargaHoraria,
      codigo: `SJC-2026-${curso.eixo.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase()}-1001`,
      fileName: null, dataUrl: null, emitidoEm: "2026-07-20T00:00:00-03:00",
    };
    downloadBlob(`certificado-${cert.codigo}.html`, gerarCertificadoHTML(cert), "text/html;charset=utf-8");
  }

  if (certificados.length === 0 && historicos.length === 0) {
    return (
      <Panel>
        <p className="text-sm text-ink-soft">
          Você ainda não concluiu nenhum curso. Ao atingir 80% de frequência e ser aprovado pelo instrutor,
          seu certificado emitido pelo sindicato aparece aqui para download.
        </p>
      </Panel>
    );
  }

  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {certificados.map((cert) => (
        <CertCard key={cert.id} nome={cert.cursoNome} carga={cert.cargaHoraria} codigo={cert.codigo} emitido={new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(new Date(cert.emitidoEm))} anexo={cert.fileName} onDownload={() => baixar(cert)} />
      ))}
      {historicos.map((curso) => (
        <CertCard key={curso.id} nome={curso.nome} carga={curso.cargaHoraria} codigo={`SJC-2026-${curso.eixo.slice(0, 3).toUpperCase()}-1001`} emitido="Julho / 2026" anexo={null} onDownload={() => baixarHistorico(curso)} />
      ))}
    </div>
  );
}

function CertCard({ nome, carga, codigo, emitido, anexo, onDownload }: { nome: string; carga: number; codigo: string; emitido: string; anexo: string | null; onDownload: () => void }) {
  return (
    <div className="card card-soft overflow-hidden">
      <div className="relative flex items-center justify-between gap-4 bg-forest px-6 py-5 text-cream">
        <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: "repeating-linear-gradient(135deg, rgba(216,161,58,0.5) 0 1px, transparent 1px 12px)" }} aria-hidden />
        <div className="relative"><p className="text-xs font-bold uppercase tracking-widest text-harvest">Certificado SENAR</p><h3 className="mt-1 font-display text-lg font-semibold text-white">{nome}</h3></div>
        <Image src="/senar-sp.png" alt="SENAR" width={48} height={48} className="relative size-11 rounded-lg bg-white p-1 object-contain" />
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div><p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Carga horária</p><p className="font-semibold text-pine">{carga} horas</p></div>
          <div><p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Emitido</p><p className="font-semibold text-pine capitalize">{emitido}</p></div>
          <div className="col-span-2"><p className="text-xs font-bold uppercase tracking-wide text-ink-soft">Código de validação</p><p className="flex items-center gap-2 font-mono font-semibold text-forest"><QrCode className="size-4" aria-hidden /> {codigo}</p></div>
        </div>
        <button type="button" onClick={onDownload} className="btn btn-primary mt-5 w-full !py-2.5 text-sm"><Download className="size-4" aria-hidden /> {anexo ? "Baixar certificado" : "Baixar certificado (PDF)"}</button>
      </div>
    </div>
  );
}

/* ---------------- Dados ---------------- */
function Dados({ aluno }: { aluno: Aluno }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Dados pessoais">
        <dl className="grid gap-4 sm:grid-cols-2">
          <Info label="Nome completo" value={aluno.nome} />
          <Info label="CPF" value={aluno.cpf} />
          <Info label="Data de nascimento" value={aluno.dataNascimento ? formatFullDate(aluno.dataNascimento) : "Não informado"} />
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
        <button type="button" className="btn btn-primary mt-6 !py-2.5 text-sm">Atualizar dados</button>
      </Panel>
    </div>
  );
}

function Info({ label, value, icon: Icon }: { label: string; value: string; icon?: typeof Phone }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase tracking-wide text-ink-soft">{label}</dt>
      <dd className="mt-0.5 flex items-center gap-1.5 font-semibold text-pine">{Icon ? <Icon className="size-4 text-moss" aria-hidden /> : null}{value}</dd>
    </div>
  );
}
