"use client";

import Image from "next/image";
import { useState } from "react";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  ClipboardList,
  Clock,
  FileCheck2,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Phone,
  Search,
  ShieldCheck,
  UserCheck,
  UserRound,
  UsersRound,
} from "lucide-react";
import { prioridadePorCategoria, turmaTemVaga } from "@/lib/business-rules";
import { cursos, inscricoes, sindicato, turmas } from "@/lib/seed";
import { categoriaLabels, type CategoriaAluno } from "@/lib/types";

type FormState = {
  nome: string;
  cpf: string;
  telefone: string;
  categoria: CategoriaAluno;
};

type AccessType = "aluno" | "sindicato";

const initialForm: FormState = {
  nome: "",
  cpf: "",
  telefone: "",
  categoria: "produtor",
};

const accessDetails = {
  aluno: {
    eyebrow: "Área do aluno",
    title: "Consulte sua inscrição e seus certificados.",
    description:
      "Acesso para o participante acompanhar pedidos, confirmações, grupos de turma e certificados emitidos.",
    userLabel: "CPF",
    userPlaceholder: "000.000.000-00",
    passwordLabel: "Data de nascimento",
    passwordPlaceholder: "dd/mm/aaaa",
    button: "Entrar na área do aluno",
    features: [
      { icon: ClipboardCheck, title: "Inscrições", text: "Status do pedido e posição na fila." },
      { icon: MessageCircle, title: "Grupos", text: "WhatsApp liberado após confirmação." },
      { icon: BadgeCheck, title: "Certificados", text: "Documentos disponíveis para baixar." },
      { icon: UserCheck, title: "Dados", text: "Atualização de contato e categoria." },
    ],
  },
  sindicato: {
    eyebrow: "Área do sindicato",
    title: "Gerencie turmas, inscrições e presença.",
    description:
      "Acesso restrito para a equipe do sindicato rural organizar mobilização, aprovar vagas e acompanhar cursos.",
    userLabel: "E-mail institucional",
    userPlaceholder: "contato@sindicatorural.com.br",
    passwordLabel: "Senha",
    passwordPlaceholder: "Digite sua senha",
    button: "Entrar na área do sindicato",
    features: [
      { icon: ClipboardList, title: "Pré-inscrições", text: "Fila por prioridade e documentação." },
      { icon: LayoutDashboard, title: "Turmas", text: "Agenda, vagas e status operacional." },
      { icon: UsersRound, title: "Frequência", text: "Lista de presença e aprovação." },
      { icon: FileCheck2, title: "Certificados", text: "Liberação e histórico dos alunos." },
    ],
  },
} satisfies Record<
  AccessType,
  {
    eyebrow: string;
    title: string;
    description: string;
    userLabel: string;
    userPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    button: string;
    features: {
      icon: typeof ClipboardCheck;
      title: string;
      text: string;
    }[];
  }
>;

function formatShortDate(value: string) {
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

export function GuavaCampoApp() {
  const [selectedCourseId, setSelectedCourseId] = useState(cursos[0].id);
  const [accessType, setAccessType] = useState<AccessType>("aluno");
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const selectedCourse = cursos.find((curso) => curso.id === selectedCourseId) ?? cursos[0];
  const selectedTurma = getTurmaForCourse(selectedCourse.id);
  const hasSeat = turmaTemVaga(selectedTurma, inscricoes);
  const activeAccess = accessDetails[accessType];

  function updateField<Key extends keyof FormState>(key: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [key]: value }));
    setSubmitted(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen bg-[#f7faf8] text-[var(--foreground)]">
      <header className="sticky top-0 z-40 border-b border-[#d7e5db] bg-white/95 shadow-sm backdrop-blur">
        <div className="bg-[var(--primary-dark)] text-white">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 text-xs font-semibold sm:px-6 lg:px-8">
            <span>SENAR-SP • Mobilização de cursos rurais</span>
            <a href="tel:+551239000000" className="hidden items-center gap-2 sm:inline-flex">
              <Phone className="size-3.5" aria-hidden />
              Atendimento do sindicato
            </a>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <a href="#" className="flex min-w-0 items-center gap-4" aria-label="Início">
            <div className="flex size-16 shrink-0 items-center justify-center rounded-md border border-[#d7e5db] bg-white p-2 shadow-sm sm:size-24">
              <Image
                src="/sindicato-sjc.png"
                alt={sindicato.nome}
                width={96}
                height={96}
                priority
                className="h-full w-full object-contain"
              />
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="text-sm font-extrabold uppercase text-[var(--primary)]">
                Sindicato Rural
              </p>
              <p className="whitespace-nowrap text-xl font-black leading-tight tracking-normal text-[var(--foreground)] xl:text-2xl">
                São José dos Campos
              </p>
            </div>
          </a>

          <nav className="hidden items-center gap-6 text-sm font-bold text-[#4b6256] lg:flex xl:gap-8">
            <a href="#cursos" className="whitespace-nowrap transition hover:text-[var(--primary)]">
              Cursos
            </a>
            <a href="#inscricao" className="whitespace-nowrap transition hover:text-[var(--primary)]">
              Inscrição
            </a>
            <a href="#acessos" className="whitespace-nowrap transition hover:text-[var(--primary)]">
              Acessos
            </a>
            <a href="#como-funciona" className="whitespace-nowrap transition hover:text-[var(--primary)]">
              Como funciona
            </a>
          </nav>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap sm:justify-end sm:gap-3">
            <a
              href="#acessos"
              onClick={() => setAccessType("aluno")}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--primary)] bg-white px-3 py-2.5 text-sm font-extrabold text-[var(--primary)] transition hover:bg-[#edf8f1] sm:px-4"
            >
              <UserRound className="size-4" aria-hidden />
              <span className="hidden 2xl:inline">Área do aluno</span>
              <span className="2xl:hidden">Aluno</span>
            </a>
            <a
              href="#acessos"
              onClick={() => setAccessType("sindicato")}
              className="inline-flex items-center justify-center gap-2 rounded-md border border-[var(--primary)] bg-white px-3 py-2.5 text-sm font-extrabold text-[var(--primary)] transition hover:bg-[#edf8f1] sm:px-4"
            >
              <Building2 className="size-4" aria-hidden />
              <span className="hidden 2xl:inline">Área do sindicato</span>
              <span className="2xl:hidden">Sindicato</span>
            </a>
            <a
              href="#inscricao"
              className="inline-flex items-center justify-center rounded-md bg-[var(--primary)] px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[var(--primary-dark)] sm:px-5"
            >
              Inscreva-se
            </a>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[#0d3f2a]">
        <div className="absolute inset-0">
          <Image
            src="/hero-cursos-senar.png"
            alt="Capacitação rural em campo"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#07351f] via-[#07351f]/82 to-[#07351f]/18" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f7faf8] to-transparent" />
        </div>

        <div className="relative mx-auto grid min-h-[560px] max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_390px] lg:px-8">
          <div className="max-w-3xl text-white">
            <div className="inline-flex items-center gap-2 rounded-md bg-white/12 px-3 py-2 text-sm font-extrabold ring-1 ring-white/20 backdrop-blur">
              <GraduationCap className="size-4" aria-hidden />
              Cursos presenciais do SENAR-SP
            </div>
            <h1 className="mt-6 text-4xl font-black leading-[1.03] tracking-normal sm:text-5xl lg:text-6xl">
              Cursos rurais com inscrição pelo Sindicato Rural de São José dos Campos
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-white/90 sm:text-xl">
              Veja as próximas turmas, escolha sua capacitação e envie seus dados para
              análise da equipe de mobilização do sindicato.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                href="#cursos"
                className="inline-flex items-center justify-center rounded-md bg-white px-5 py-3 text-base font-black text-[var(--primary-dark)] shadow-sm transition hover:bg-[#eff8f2]"
              >
                Ver cursos disponíveis
              </a>
              <a
                href="#acessos"
                onClick={() => setAccessType("aluno")}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-white/35 bg-white/10 px-5 py-3 text-base font-bold text-white backdrop-blur transition hover:bg-white/18"
              >
                <UserRound className="size-5" aria-hidden />
                Entrar como aluno
              </a>
            </div>
          </div>

          <aside className="rounded-md border border-white/18 bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#dfeae3] pb-4">
              <div>
                <p className="text-sm font-extrabold uppercase text-[var(--primary)]">
                  Destaque da semana
                </p>
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
              className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-[var(--primary)] px-5 py-3 text-base font-black text-white transition hover:bg-[var(--primary-dark)]"
            >
              Fazer pré-inscrição
            </a>
          </aside>
        </div>
      </section>

      <section id="cursos" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-8 h-1 w-36 bg-[var(--primary)]" />
            <p className="text-sm font-extrabold uppercase text-[var(--primary)]">
              Cursos e capacitações
            </p>
            <h2 className="mt-2 max-w-3xl text-3xl font-black tracking-normal sm:text-5xl">
              Confira as próximas turmas oferecidas
            </h2>
          </div>
          <label className="relative block w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#789088]" />
            <input
              className="w-full rounded-md border border-[#d7e5db] bg-white py-3 pl-12 pr-4 text-base shadow-sm"
              placeholder="Buscar curso"
              aria-label="Buscar curso"
            />
          </label>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-4">
          {cursos.map((curso, index) => {
            const turma = getTurmaForCourse(curso.id);
            const selected = selectedCourseId === curso.id;
            const vagas = Math.max(turma.capacidade - turma.vagasPreenchidas, 0);

            return (
              <article
                key={curso.id}
                className={`group overflow-hidden rounded-md border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
                  selected ? "border-[var(--primary)] ring-4 ring-[#b9e6c9]" : "border-[#dce8df]"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setSelectedCourseId(curso.id)}
                  className="block w-full text-left"
                >
                  <div className="relative h-44 overflow-hidden bg-[#123e2a]">
                    <Image
                      src="/hero-cursos-senar.png"
                      alt=""
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 25vw"
                      style={{ objectPosition: `${20 + index * 18}% center` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#062d1d]/92 via-[#062d1d]/40 to-transparent" />
                    <div className="absolute left-4 top-4 rounded-md bg-white/95 px-2.5 py-1 text-xs font-black text-[var(--primary-dark)]">
                      Presencial
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-xs font-extrabold uppercase text-[#b9e6c9]">
                        {curso.eixo}
                      </p>
                      <h3 className="mt-1 text-xl font-black leading-tight text-white">
                        {curso.nome}
                      </h3>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="min-h-[72px] text-sm leading-6 text-[#607369]">{curso.descricao}</p>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                      <span className="rounded-md bg-[#f4f8f6] p-2">
                        <strong className="block">{curso.cargaHoraria}h</strong>
                        Carga
                      </span>
                      <span className="rounded-md bg-[#f4f8f6] p-2">
                        <strong className="block">{vagas}</strong>
                        Vagas
                      </span>
                      <span className="rounded-md bg-[#f4f8f6] p-2">
                        <strong className="block">{formatShortDate(turma.encontros[0].data)}</strong>
                        Início
                      </span>
                    </div>
                    <span className="mt-4 inline-flex w-full items-center justify-center rounded-md border border-[#cfe0d5] px-4 py-2.5 text-sm font-black text-[var(--primary)]">
                      Selecionar
                    </span>
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      </section>

      <section id="acessos" className="border-y border-[#dce8df] bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-[0.85fr_1fr] lg:items-end">
            <div>
              <p className="text-sm font-extrabold uppercase text-[var(--primary)]">
                Acessos do portal
              </p>
              <h2 className="mt-2 max-w-3xl text-3xl font-black tracking-normal sm:text-5xl">
                Duas áreas separadas para aluno e sindicato rural
              </h2>
            </div>
            <p className="max-w-2xl text-base leading-7 text-[#607369]">
              O aluno acompanha a própria inscrição. A equipe do sindicato entra em uma
              área restrita para organizar turmas, confirmar vagas e registrar frequência.
            </p>
          </div>

          <div className="mt-9 grid gap-6 lg:grid-cols-[420px_1fr]">
            <form
              onSubmit={(event) => event.preventDefault()}
              className="rounded-md border border-[#dce8df] bg-[#f7faf8] p-5 shadow-lg shadow-[#153a250c]"
            >
              <div
                className="grid grid-cols-2 gap-1 rounded-md bg-[#e8f2ec] p-1"
                role="tablist"
                aria-label="Tipo de acesso"
              >
                <button
                  type="button"
                  role="tab"
                  onClick={() => setAccessType("aluno")}
                  aria-selected={accessType === "aluno"}
                  className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-3 text-sm font-black transition ${
                    accessType === "aluno"
                      ? "bg-white text-[var(--primary-dark)] shadow-sm"
                      : "text-[#607369] hover:text-[var(--primary)]"
                  }`}
                >
                  <UserRound className="size-4" aria-hidden />
                  Aluno
                </button>
                <button
                  type="button"
                  role="tab"
                  onClick={() => setAccessType("sindicato")}
                  aria-selected={accessType === "sindicato"}
                  className={`inline-flex items-center justify-center gap-2 rounded-md px-3 py-3 text-sm font-black transition ${
                    accessType === "sindicato"
                      ? "bg-white text-[var(--primary-dark)] shadow-sm"
                      : "text-[#607369] hover:text-[var(--primary)]"
                  }`}
                >
                  <Building2 className="size-4" aria-hidden />
                  Sindicato
                </button>
              </div>

              <div className="mt-6">
                <p className="text-sm font-extrabold uppercase text-[var(--primary)]">
                  {activeAccess.eyebrow}
                </p>
                <h3 className="mt-2 text-2xl font-black tracking-normal">{activeAccess.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#607369]">
                  {activeAccess.description}
                </p>
              </div>

              <div className="mt-6 grid gap-4">
                <Field label={activeAccess.userLabel} icon={accessType === "aluno" ? ShieldCheck : UserRound}>
                  <input
                    className="field-input"
                    placeholder={activeAccess.userPlaceholder}
                    type={accessType === "aluno" ? "text" : "email"}
                  />
                </Field>
                <Field label={activeAccess.passwordLabel} icon={KeyRound}>
                  <input
                    className="field-input"
                    placeholder={activeAccess.passwordPlaceholder}
                    type={accessType === "aluno" ? "text" : "password"}
                  />
                </Field>
              </div>

              <button
                type="submit"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[var(--primary)] px-5 py-3.5 text-base font-black text-white transition hover:bg-[var(--primary-dark)]"
              >
                <LockKeyhole className="size-5" aria-hidden />
                {activeAccess.button}
              </button>
            </form>

            <div className="grid gap-4 sm:grid-cols-2">
              {activeAccess.features.map((feature) => (
                <AccessFeature key={feature.title} icon={feature.icon} title={feature.title}>
                  {feature.text}
                </AccessFeature>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="inscricao" className="bg-white py-16">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(390px,0.62fr)] lg:px-8">
          <div>
            <p className="text-sm font-extrabold uppercase text-[var(--primary)]">
              Pré-inscrição
            </p>
            <h2 className="mt-2 max-w-3xl text-3xl font-black tracking-normal sm:text-5xl">
              Informe seus dados para o sindicato confirmar sua vaga
            </h2>
            <div className="mt-7 rounded-md border border-[#dce8df] bg-[#f7faf8] p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-extrabold uppercase text-[var(--teal)]">
                    Curso selecionado
                  </p>
                  <h3 className="mt-1 text-2xl font-black">{selectedCourse.nome}</h3>
                  <p className="mt-2 text-[#607369]">
                    {selectedTurma.local} · {formatShortDate(selectedTurma.encontros[0].data)} a{" "}
                    {formatShortDate(selectedTurma.encontros[selectedTurma.encontros.length - 1].data)}
                  </p>
                </div>
                <span className="rounded-md bg-white px-3 py-2 text-sm font-extrabold text-[var(--primary-dark)] shadow-sm">
                  Prioridade {prioridadePorCategoria(form.categoria)}
                </span>
              </div>
            </div>

            <div id="como-funciona" className="mt-8 grid gap-4 sm:grid-cols-3">
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
            className="rounded-md border border-[#dce8df] bg-white p-5 shadow-xl shadow-[#153a2510]"
          >
            <div className="flex items-center gap-3 border-b border-[#dce8df] pb-4">
              <div className="flex size-12 items-center justify-center rounded-md bg-[#e7f5eb] text-[var(--primary)]">
                <FileCheck2 className="size-6" aria-hidden />
              </div>
              <div>
                <h3 className="text-2xl font-black">Solicitar inscrição</h3>
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
              className="mt-6 inline-flex w-full items-center justify-center rounded-md bg-[var(--primary)] px-5 py-3.5 text-base font-black text-white transition hover:bg-[var(--primary-dark)]"
            >
              Enviar pré-inscrição
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
    <div className="rounded-md border border-[#dce8df] bg-white p-5">
      <Icon className="size-7 text-[var(--primary)]" aria-hidden />
      <h3 className="mt-4 text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#607369]">{children}</p>
    </div>
  );
}

function AccessFeature({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof ClipboardCheck;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-[#dce8df] bg-[#f7faf8] p-5">
      <div className="flex size-11 items-center justify-center rounded-md bg-white text-[var(--primary)] shadow-sm">
        <Icon className="size-5" aria-hidden />
      </div>
      <h3 className="mt-4 text-lg font-black">{title}</h3>
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
