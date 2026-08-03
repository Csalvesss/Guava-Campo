"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  FileCheck2,
  GraduationCap,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  UserRound,
  UsersRound,
} from "lucide-react";
import { getEnrollmentBlock, prioridadePorCategoria, turmaTemVaga } from "@/lib/business-rules";
import { alunos, cursos, inscricoes, sindicato, turmas } from "@/lib/seed";
import { categoriaLabels, type CategoriaAluno } from "@/lib/types";

type FormState = {
  nome: string;
  cpf: string;
  telefone: string;
  categoria: CategoriaAluno;
};

const initialForm: FormState = {
  nome: "",
  cpf: "",
  telefone: "",
  categoria: "produtor",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
  })
    .format(new Date(value))
    .replace(".", "");
}

function formatFullDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function getTurmaForCourse(courseId: string) {
  return turmas.find((turma) => turma.cursoId === courseId && turma.publicadaNoPortal) ?? turmas[0];
}

function LogoMark() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-16 shrink-0 items-center justify-center rounded-md border border-[#d9e8de] bg-white p-1.5 shadow-sm sm:size-20">
        <Image
          src="/sindicato-sjc.png"
          alt={sindicato.nome}
          width={88}
          height={88}
          priority
          className="h-full w-full object-contain"
        />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase text-[var(--primary)] sm:text-sm">
          Sindicato Rural
        </p>
        <p className="text-lg font-extrabold leading-tight text-[var(--foreground)] sm:text-2xl">
          São José dos Campos
        </p>
      </div>
    </div>
  );
}

export function GuavaCampoApp() {
  const [selectedCourseId, setSelectedCourseId] = useState(cursos[0].id);
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const selectedCourse = cursos.find((curso) => curso.id === selectedCourseId) ?? cursos[0];
  const selectedTurma = getTurmaForCourse(selectedCourse.id);
  const alunoDemo = alunos[0];
  const enrollmentBlock = getEnrollmentBlock(alunoDemo, selectedCourse, inscricoes);
  const hasSeat = turmaTemVaga(selectedTurma, inscricoes);

  const stats = useMemo(() => {
    const abertas = turmas.filter((turma) => turma.publicadaNoPortal).length;
    const vagas = turmas.reduce(
      (total, turma) => total + Math.max(turma.capacidade - turma.vagasPreenchidas, 0),
      0,
    );

    return [
      { label: "Cursos com inscrições", value: cursos.filter((curso) => curso.ativo).length },
      { label: "Turmas em mobilização", value: abertas },
      { label: "Vagas disponíveis", value: vagas },
    ];
  }, []);

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
    setSubmitted(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#f6faf7] text-[var(--foreground)]">
      <header className="sticky top-0 z-30 border-b border-[#dce8df] bg-white/92 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <LogoMark />
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#4d6257] md:flex">
            <a href="#cursos" className="transition hover:text-[var(--primary)]">
              Cursos
            </a>
            <a href="#inscricao" className="transition hover:text-[var(--primary)]">
              Inscrição
            </a>
            <a href="#como-funciona" className="transition hover:text-[var(--primary)]">
              Como funciona
            </a>
          </nav>
          <a
            href="#inscricao"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--primary-dark)]"
          >
            Inscrever-se
            <ArrowRight className="size-4" aria-hidden />
          </a>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#0d3f2a]">
        <div className="absolute inset-0">
          <Image
            src="/hero-cursos-senar.png"
            alt="Curso rural em campo aberto"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07351f] via-[#07351f]/78 to-[#07351f]/16" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#f6faf7] to-transparent" />
        </div>

        <div className="relative mx-auto grid min-h-[680px] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,0.92fr)_430px] lg:px-8">
          <div className="max-w-3xl pt-10 text-white">
            <div className="inline-flex items-center gap-2 rounded-md bg-white/12 px-3 py-2 text-sm font-bold ring-1 ring-white/20 backdrop-blur">
              <GraduationCap className="size-4" aria-hidden />
              Cursos SENAR mobilizados pelo sindicato
            </div>
            <h1 className="mt-6 text-4xl font-black leading-[1.03] tracking-normal sm:text-6xl lg:text-7xl">
              Capacitação rural para produtores de São José dos Campos
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/88 sm:text-xl">
              Consulte as próximas turmas, faça sua pré-inscrição e acompanhe a confirmação
              da sua vaga diretamente pelo Sindicato Rural de São José dos Campos.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#cursos"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 text-base font-extrabold text-[var(--primary-dark)] shadow-sm transition hover:bg-[#eff8f2]"
              >
                Ver cursos disponíveis
                <ArrowRight className="size-5" aria-hidden />
              </a>
              <a
                href="tel:+551239000000"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/35 bg-white/10 px-5 py-3 text-base font-bold text-white backdrop-blur transition hover:bg-white/18"
              >
                <Phone className="size-5" aria-hidden />
                Falar com o sindicato
              </a>
            </div>
          </div>

          <aside className="rounded-lg border border-white/18 bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between gap-4 border-b border-[#dfeae3] pb-4">
              <div>
                <p className="text-sm font-bold uppercase text-[var(--primary)]">Próxima turma</p>
                <h2 className="mt-1 text-2xl font-black tracking-normal">{selectedCourse.nome}</h2>
              </div>
              <Image
                src="/senar-sp.png"
                alt="SENAR São Paulo"
                width={74}
                height={74}
                className="size-16 shrink-0 object-contain"
              />
            </div>

            <div className="mt-5 grid gap-3 text-sm">
              <InfoRow icon={CalendarDays} label="Datas">
                {formatFullDate(selectedTurma.encontros[0].data)} a{" "}
                {formatFullDate(selectedTurma.encontros[selectedTurma.encontros.length - 1].data)}
              </InfoRow>
              <InfoRow icon={MapPin} label="Local">
                {selectedTurma.local}
              </InfoRow>
              <InfoRow icon={Clock} label="Carga horária">
                {selectedCourse.cargaHoraria} horas
              </InfoRow>
              <InfoRow icon={UsersRound} label="Vagas">
                {hasSeat ? `${selectedTurma.capacidade - selectedTurma.vagasPreenchidas} disponíveis` : "Lista de espera"}
              </InfoRow>
            </div>

            <a
              href="#inscricao"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-5 py-3 text-base font-extrabold text-white transition hover:bg-[var(--primary-dark)]"
            >
              Quero me inscrever
              <ArrowRight className="size-5" aria-hidden />
            </a>
          </aside>
        </div>
      </section>

      <section className="mx-auto -mt-10 grid max-w-7xl gap-3 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-[#dce8df] bg-white p-5 shadow-sm">
            <p className="text-sm font-semibold text-[#607369]">{stat.label}</p>
            <strong className="mt-2 block text-4xl font-black text-[var(--primary-dark)]">
              {stat.value}
            </strong>
          </div>
        ))}
      </section>

      <section id="cursos" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-extrabold uppercase text-[var(--primary)]">
              Inscrições abertas
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-normal sm:text-4xl">
              Escolha o curso que faz sentido para sua propriedade
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-[#607369]">
            A pré-inscrição entra para análise do sindicato. Produtores, familiares e
            colaboradores rurais têm prioridade conforme as regras do SENAR.
          </p>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-4">
          {cursos.map((curso) => {
            const turma = getTurmaForCourse(curso.id);
            const selected = selectedCourseId === curso.id;
            const vagas = Math.max(turma.capacidade - turma.vagasPreenchidas, 0);
            const blocked = getEnrollmentBlock(alunoDemo, curso, inscricoes);

            return (
              <article
                key={curso.id}
                className={`flex min-h-[330px] flex-col rounded-lg border bg-white p-5 shadow-sm transition ${
                  selected ? "border-[var(--primary)] ring-4 ring-[#b9e6c9]" : "border-[#dce8df]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex size-12 items-center justify-center rounded-md bg-[#e7f5eb] text-[var(--primary)]">
                    <BookOpen className="size-6" aria-hidden />
                  </div>
                  <span className="rounded-md bg-[#f1f7f3] px-2.5 py-1 text-xs font-extrabold text-[var(--primary-dark)]">
                    {curso.tipo}
                  </span>
                </div>
                <p className="mt-5 text-xs font-extrabold uppercase text-[var(--teal)]">
                  {curso.eixo}
                </p>
                <h3 className="mt-2 text-xl font-black leading-tight tracking-normal">{curso.nome}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-[#607369]">{curso.descricao}</p>
                <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
                  <span className="rounded-md bg-[#f5f8f6] p-3">
                    <strong className="block text-lg">{curso.cargaHoraria}h</strong>
                    Carga
                  </span>
                  <span className="rounded-md bg-[#f5f8f6] p-3">
                    <strong className="block text-lg">{vagas}</strong>
                    Vagas
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCourseId(curso.id)}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md border border-[#cfe0d5] px-4 py-3 text-sm font-extrabold transition hover:border-[var(--primary)] hover:text-[var(--primary)]"
                >
                  {blocked ? "Ver regra de bloqueio" : "Selecionar curso"}
                  <ArrowRight className="size-4" aria-hidden />
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section id="inscricao" className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(390px,0.62fr)] lg:px-8">
          <div>
            <p className="text-sm font-extrabold uppercase text-[var(--primary)]">
              Pré-inscrição
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-normal sm:text-4xl">
              Informe seus dados para o sindicato confirmar sua vaga
            </h2>
            <div className="mt-7 rounded-lg border border-[#dce8df] bg-[#f7faf8] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-extrabold uppercase text-[var(--teal)]">
                    Curso selecionado
                  </p>
                  <h3 className="mt-1 text-2xl font-black">{selectedCourse.nome}</h3>
                  <p className="mt-2 text-[#607369]">
                    {selectedTurma.local} · {formatDate(selectedTurma.encontros[0].data)} a{" "}
                    {formatDate(selectedTurma.encontros[selectedTurma.encontros.length - 1].data)}
                  </p>
                </div>
                <span className="rounded-md bg-white px-3 py-2 text-sm font-extrabold text-[var(--primary-dark)] shadow-sm">
                  Prioridade {prioridadePorCategoria(form.categoria)}
                </span>
              </div>
              {enrollmentBlock ? (
                <div className="mt-5 rounded-md border border-[#ead7a7] bg-[#fff8e8] p-4 text-sm font-semibold text-[#80550b]">
                  Exemplo de regra ativa: {enrollmentBlock}
                </div>
              ) : null}
            </div>

            <div id="como-funciona" className="mt-8 grid gap-3 sm:grid-cols-3">
              <Step icon={ClipboardCheck} title="1. Pré-inscrição">
                O sindicato recebe seus dados e organiza a fila por prioridade SENAR.
              </Step>
              <Step icon={MessageCircle} title="2. Confirmação">
                Após aprovação da vaga, o grupo de WhatsApp da turma é liberado.
              </Step>
              <Step icon={BadgeCheck} title="3. Certificado">
                Com frequência mínima e aprovação, o certificado fica disponível.
              </Step>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-[#dce8df] bg-white p-5 shadow-xl shadow-[#153a2510]"
          >
            <div className="flex items-center gap-3 border-b border-[#dce8df] pb-4">
              <div className="flex size-11 items-center justify-center rounded-md bg-[#e7f5eb] text-[var(--primary)]">
                <FileCheck2 className="size-6" aria-hidden />
              </div>
              <div>
                <h3 className="text-xl font-black">Solicitar inscrição</h3>
                <p className="text-sm text-[#607369]">Resposta após análise do sindicato.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <Field label="Nome completo" icon={UserRound}>
                <input
                  required
                  value={form.nome}
                  onChange={(event) => updateField("nome", event.target.value)}
                  placeholder="Ex.: Maria Aparecida Souza"
                  className="field-input"
                />
              </Field>
              <Field label="CPF" icon={ShieldCheck}>
                <input
                  required
                  value={form.cpf}
                  onChange={(event) => updateField("cpf", event.target.value)}
                  placeholder="000.000.000-00"
                  className="field-input"
                />
              </Field>
              <Field label="WhatsApp" icon={Phone}>
                <input
                  required
                  value={form.telefone}
                  onChange={(event) => updateField("telefone", event.target.value)}
                  placeholder="(12) 99999-9999"
                  className="field-input"
                />
              </Field>
              <label className="block">
                <span className="text-sm font-bold text-[#30463a]">Categoria</span>
                <select
                  value={form.categoria}
                  onChange={(event) => updateField("categoria", event.target.value as CategoriaAluno)}
                  className="field-input mt-2"
                >
                  {Object.entries(categoriaLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <button
              type="submit"
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-5 py-3.5 text-base font-black text-white transition hover:bg-[var(--primary-dark)]"
            >
              Enviar pré-inscrição
              <ArrowRight className="size-5" aria-hidden />
            </button>

            {submitted ? (
              <div className="mt-4 rounded-md border border-[#b9e6c9] bg-[#ecf8f0] p-4 text-sm font-semibold text-[var(--primary-dark)]">
                <CheckCircle2 className="mr-2 inline size-5 align-[-4px]" aria-hidden />
                Solicitação recebida. O sindicato entrará em contato para confirmar a vaga.
              </div>
            ) : null}
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-4 rounded-lg border border-[#dce8df] bg-[#0c3d28] p-6 text-white md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-extrabold uppercase text-[#b9e6c9]">
              <Sparkles className="size-4" aria-hidden />
              Mobilização rural organizada
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-normal">
              O sindicato acompanha inscrições, presença e certificados em um só fluxo.
            </h2>
          </div>
          <Image
            src="/senar-sp.png"
            alt="SENAR São Paulo"
            width={96}
            height={96}
            className="size-24 rounded-md bg-white object-contain p-2"
          />
        </div>
      </section>
    </main>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof CalendarDays;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[24px_1fr] gap-3 rounded-md bg-[#f6faf7] p-3">
      <Icon className="mt-0.5 size-5 text-[var(--primary)]" aria-hidden />
      <div>
        <p className="text-xs font-extrabold uppercase text-[#607369]">{label}</p>
        <p className="mt-1 font-bold text-[var(--foreground)]">{children}</p>
      </div>
    </div>
  );
}

function Step({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof ClipboardCheck;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-[#dce8df] bg-white p-4">
      <Icon className="size-6 text-[var(--primary)]" aria-hidden />
      <h3 className="mt-3 font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#607369]">{children}</p>
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof UserRound;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-bold text-[#30463a]">
        <Icon className="size-4 text-[var(--primary)]" aria-hidden />
        {label}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}
