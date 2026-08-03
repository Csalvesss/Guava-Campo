"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  ClipboardCheck,
  MapPin,
  MessageCircle,
  Phone,
  Quote,
  Search,
  Sparkles,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { EixoIcon } from "@/components/ui/eixo-icon";
import { prioridadePorCategoria, turmaTemVaga } from "@/lib/business-rules";
import {
  cursoTipoCurto,
  formatShortDate,
  formatFullDate,
  periodoTurma,
  turmaOfCourse,
  vagasRestantes,
} from "@/lib/catalog";
import { cursos, inscricoes } from "@/lib/seed";
import { contato, depoimentos, eixos, faq, numeros, passos } from "@/lib/site-content";
import { categoriaLabels, type CategoriaAluno } from "@/lib/types";

const passoIcons: Record<string, LucideIcon> = {
  search: Search,
  clipboard: ClipboardCheck,
  message: MessageCircle,
  badge: BadgeCheck,
};

type FormState = { nome: string; cpf: string; telefone: string; categoria: CategoriaAluno };
const initialForm: FormState = { nome: "", cpf: "", telefone: "", categoria: "produtor" };

export function Landing() {
  const [selectedCourseId, setSelectedCourseId] = useState(cursos[0].id);
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const selectedCourse = cursos.find((c) => c.id === selectedCourseId) ?? cursos[0];
  const selectedTurma = turmaOfCourse(selectedCourse.id);
  const hasSeat = selectedTurma ? turmaTemVaga(selectedTurma, inscricoes) : true;

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((c) => ({ ...c, [key]: value }));
    setSubmitted(false);
  }

  function selectCourse(id: string) {
    setSelectedCourseId(id);
    setSubmitted(false);
    document.getElementById("inscricao")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden bg-pine text-cream">
        <div className="absolute inset-0">
          <Image
            src="/hero-cursos-senar.png"
            alt="Capacitação rural em campo"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-pine via-pine/90 to-pine/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-pine via-transparent to-pine/40" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-paper to-transparent" />
        </div>

        <div className="relative mx-auto grid min-h-[620px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <div className="max-w-2xl">
            <span
              className="reveal chip bg-white/10 text-cream ring-1 ring-white/20 backdrop-blur"
              style={{ animationDelay: "40ms" }}
            >
              <Sparkles className="size-3.5 text-harvest" aria-hidden />
              Cursos presenciais e gratuitos do SENAR-SP
            </span>

            <h1
              className="reveal mt-6 font-display text-[2.7rem] font-semibold leading-[1.02] text-white sm:text-6xl lg:text-[4.1rem]"
              style={{ animationDelay: "120ms" }}
            >
              Capacitação que nasce{" "}
              <span className="italic text-harvest">no campo</span> de São José dos Campos.
            </h1>

            <p
              className="reveal mt-6 max-w-xl text-lg leading-relaxed text-cream/85"
              style={{ animationDelay: "220ms" }}
            >
              O Sindicato Rural mobiliza as turmas do SENAR para o produtor, o trabalhador rural
              e a família do campo. Escolha o curso, faça a pré-inscrição pelo celular e receba a
              confirmação da sua vaga.
            </p>

            <div
              className="reveal mt-9 flex flex-col gap-3 sm:flex-row"
              style={{ animationDelay: "320ms" }}
            >
              <Link href="#cursos" className="btn btn-gold text-base">
                Ver cursos abertos
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/entrar?perfil=aluno"
                className="btn text-base text-white ring-1 ring-white/30 backdrop-blur hover:bg-white/10"
              >
                <UserRound className="size-4" aria-hidden />
                Entrar como aluno
              </Link>
            </div>

            <div
              className="reveal mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-sm text-cream/75"
              style={{ animationDelay: "420ms" }}
            >
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-harvest" aria-hidden /> 100% gratuito
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-harvest" aria-hidden /> Certificado SENAR
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-harvest" aria-hidden /> Presencial no Vale do Paraíba
              </span>
            </div>
          </div>

          {/* Featured turma card */}
          <aside
            className="reveal card card-soft w-full max-w-md justify-self-end p-5 lg:p-6"
            style={{ animationDelay: "380ms" }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-line pb-4">
              <div>
                <span className="eyebrow no-rule text-harvest-deep">Turma em destaque</span>
                <h2 className="mt-1.5 font-display text-2xl font-semibold text-pine">
                  {selectedCourse.nome}
                </h2>
              </div>
              <Image
                src="/senar-sp.png"
                alt="SENAR São Paulo"
                width={60}
                height={60}
                className="size-14 shrink-0 rounded-lg object-contain"
              />
            </div>

            {selectedTurma ? (
              <dl className="mt-5 grid gap-2.5 text-sm">
                <HeroRow icon={CalendarDays} label="Datas">
                  {periodoTurma(selectedTurma)}
                </HeroRow>
                <HeroRow icon={MapPin} label="Local">
                  {selectedTurma.local}
                </HeroRow>
                <HeroRow icon={Clock} label="Carga horária">
                  {selectedCourse.cargaHoraria} horas
                </HeroRow>
                <HeroRow icon={UsersRound} label="Vagas">
                  {hasSeat ? `${vagasRestantes(selectedTurma)} disponíveis` : "Lista de espera"}
                </HeroRow>
              </dl>
            ) : (
              <p className="mt-5 rounded-xl bg-paper-2 p-4 text-sm text-ink-soft">
                Mobilização aberta — deixe seu interesse e avisamos quando a turma for confirmada.
              </p>
            )}

            <Link href="#inscricao" className="btn btn-primary mt-5 w-full">
              Fazer pré-inscrição
            </Link>
          </aside>
        </div>
      </section>

      {/* ============ NÚMEROS ============ */}
      <section className="border-b border-line bg-paper-2">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
          {numeros.map((n) => (
            <div key={n.rotulo} className="border-l-2 border-harvest pl-4">
              <p className="font-display text-4xl font-semibold text-forest lg:text-5xl">{n.valor}</p>
              <p className="mt-1 text-sm font-bold text-pine">{n.rotulo}</p>
              <p className="text-xs leading-snug text-ink-soft">{n.detalhe}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ CURSOS ============ */}
      <section id="cursos" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
        <SectionHead
          kicker="Cursos e capacitações"
          title="Turmas abertas neste momento"
          text="Selecione uma turma para ver os detalhes e ir direto para a pré-inscrição. Novas turmas são abertas ao longo do ano."
        />

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cursos.map((curso, index) => {
            const turma = turmaOfCourse(curso.id);
            const selected = selectedCourseId === curso.id;
            const vagas = turma ? vagasRestantes(turma) : null;
            const emMobilizacao = !turma || turma.status === "mobilizacao";

            return (
              <article
                key={curso.id}
                className={`group flex flex-col overflow-hidden rounded-[var(--radius-card)] border bg-cream transition duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] ${
                  selected ? "border-forest ring-2 ring-leaf/40" : "border-line"
                }`}
              >
                <div className="relative h-40 overflow-hidden bg-pine">
                  <Image
                    src="/hero-cursos-senar.png"
                    alt=""
                    fill
                    className="object-cover opacity-90 transition duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    style={{ objectPosition: `${18 + index * 12}% center` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-pine via-pine/40 to-transparent" />
                  <span className="chip absolute left-3 top-3 bg-cream/95 text-forest">
                    {cursoTipoCurto[curso.tipo]}
                  </span>
                  <span
                    className={`chip absolute right-3 top-3 ${
                      emMobilizacao ? "bg-harvest/95 text-pine" : "bg-forest text-cream"
                    }`}
                  >
                    {emMobilizacao ? "Mobilização" : "Confirmada"}
                  </span>
                  <div className="absolute inset-x-4 bottom-3">
                    <p className="text-[0.7rem] font-bold uppercase tracking-wide text-harvest">
                      {curso.eixo}
                    </p>
                    <h3 className="mt-0.5 font-display text-xl font-semibold leading-tight text-white">
                      {curso.nome}
                    </h3>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <p className="text-sm leading-relaxed text-ink-soft">{curso.descricao}</p>

                  <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
                    <Metric value={`${curso.cargaHoraria}h`} label="Carga" />
                    <Metric value={vagas !== null ? String(vagas) : "—"} label="Vagas" />
                    <Metric
                      value={turma ? formatShortDate(turma.encontros[0].data) : "—"}
                      label="Início"
                    />
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-xs text-ink-soft">
                    <MapPin className="size-3.5 text-moss" aria-hidden />
                    {turma ? turma.local : "Local a definir"}
                  </div>

                  <button
                    type="button"
                    onClick={() => selectCourse(curso.id)}
                    className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition ${
                      selected
                        ? "bg-forest text-cream"
                        : "border border-mist text-forest hover:bg-paper-2"
                    }`}
                  >
                    {selected ? "Selecionado" : emMobilizacao ? "Tenho interesse" : "Quero me inscrever"}
                    <ArrowRight className="size-4" aria-hidden />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ============ COMO FUNCIONA ============ */}
      <section id="como-funciona" className="scroll-mt-24 border-y border-line bg-forest text-cream">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="eyebrow text-harvest">Como funciona</span>
            <h2 className="mt-3 font-display text-4xl font-semibold text-white sm:text-5xl">
              Da propriedade ao certificado, em quatro passos
            </h2>
          </div>

          <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {passos.map((passo, i) => {
              const Icon = passoIcons[passo.icon] ?? ClipboardCheck;
              return (
                <li key={passo.numero} className="relative">
                  <div className="flex items-center gap-3">
                    <span className="grid size-12 place-items-center rounded-2xl bg-white/10 text-harvest ring-1 ring-white/15">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    <span className="font-display text-3xl font-semibold text-white/25">
                      {passo.numero}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-semibold text-white">{passo.titulo}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-cream/75">{passo.texto}</p>
                  {i < passos.length - 1 ? (
                    <span className="absolute -right-3 top-6 hidden text-harvest/40 lg:block">
                      <ArrowRight className="size-5" aria-hidden />
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* ============ EIXOS ============ */}
      <section id="eixos" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
        <SectionHead
          kicker="Áreas de capacitação"
          title="Do pomar ao pasto, uma trilha para cada atividade"
          text="O SENAR-SP oferece cursos em dezenas de cadeias produtivas. Estes são os eixos mais mobilizados no Vale do Paraíba."
        />

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {eixos.map((eixo) => (
            <div
              key={eixo.nome}
              className="group card card-soft flex flex-col p-5 transition hover:-translate-y-1"
            >
              <span className="grid size-12 place-items-center rounded-2xl bg-forest/8 text-forest transition group-hover:bg-forest group-hover:text-cream">
                <EixoIcon name={eixo.icon} className="size-6" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-pine">{eixo.nome}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{eixo.descricao}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ DEPOIMENTOS ============ */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHead kicker="Quem vive o campo" title="Histórias da nossa gente" />
        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          {depoimentos.map((d, i) => (
            <figure
              key={d.nome}
              className={`card flex flex-col p-7 ${i === 1 ? "lg:-translate-y-4 lg:shadow-[var(--shadow-lift)]" : "card-soft"}`}
            >
              <Quote className="size-8 text-guava/70" aria-hidden />
              <blockquote className="mt-4 flex-1 font-display text-lg leading-snug text-pine">
                “{d.texto}”
              </blockquote>
              <figcaption className="mt-6 border-t border-line pt-4">
                <p className="font-bold text-forest">{d.nome}</p>
                <p className="text-sm text-ink-soft">{d.papel}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ============ PRÉ-INSCRIÇÃO ============ */}
      <section id="inscricao" className="scroll-mt-24 border-y border-line bg-cream">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1fr_460px] lg:px-8">
          <div>
            <span className="eyebrow">Pré-inscrição</span>
            <h2 className="mt-3 max-w-xl font-display text-4xl font-semibold text-pine sm:text-5xl">
              Garanta sua vaga com o sindicato
            </h2>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-soft">
              Preencha seus dados e a equipe de mobilização confirma sua participação. A ordem segue
              a prioridade do público SENAR e a data da solicitação.
            </p>

            <div className="mt-8 card border-forest/15 bg-forest/5 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="eyebrow no-rule text-moss">Curso selecionado</span>
                  <h3 className="mt-1 font-display text-2xl font-semibold text-pine">
                    {selectedCourse.nome}
                  </h3>
                  <p className="mt-1 text-sm text-ink-soft">
                    {selectedTurma
                      ? `${selectedTurma.local} · ${periodoTurma(selectedTurma)}`
                      : "Turma em mobilização"}
                  </p>
                </div>
                <span className="chip shrink-0 self-start bg-cream text-forest ring-1 ring-mist">
                  Prioridade {prioridadePorCategoria(form.categoria)}
                </span>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-xl bg-paper-2 p-4 text-sm text-ink-soft">
              <Phone className="mt-0.5 size-4 shrink-0 text-forest" aria-hidden />
              <span>
                Prefere falar com a equipe? Ligue para {contato.telefone} ou escreva para{" "}
                <a href={`mailto:${contato.email}`} className="font-semibold text-forest underline">
                  {contato.email}
                </a>
                .
              </span>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSubmitted(true);
            }}
            className="card card-soft h-fit p-6"
          >
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <span className="grid size-12 place-items-center rounded-xl bg-forest/10 text-forest">
                <ClipboardCheck className="size-6" aria-hidden />
              </span>
              <div>
                <h3 className="font-display text-xl font-semibold text-pine">Solicitar inscrição</h3>
                <p className="text-sm text-ink-soft">Resposta após análise do sindicato.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <FormField label="Nome completo">
                <input
                  required
                  value={form.nome}
                  onChange={(e) => updateField("nome", e.target.value)}
                  placeholder="Ex.: Maria Aparecida Souza"
                  className="field-input"
                />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="CPF">
                  <input
                    required
                    value={form.cpf}
                    onChange={(e) => updateField("cpf", e.target.value)}
                    placeholder="000.000.000-00"
                    className="field-input"
                  />
                </FormField>
                <FormField label="WhatsApp">
                  <input
                    required
                    value={form.telefone}
                    onChange={(e) => updateField("telefone", e.target.value)}
                    placeholder="(12) 99999-9999"
                    className="field-input"
                  />
                </FormField>
              </div>
              <FormField label="Você é">
                <select
                  value={form.categoria}
                  onChange={(e) => updateField("categoria", e.target.value as CategoriaAluno)}
                  className="field-input"
                >
                  {Object.entries(categoriaLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </FormField>
            </div>

            <button type="submit" className="btn btn-primary mt-6 w-full text-base">
              Enviar pré-inscrição
              <ArrowRight className="size-4" aria-hidden />
            </button>

            {submitted ? (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-leaf/40 bg-leaf/10 p-4 text-sm font-semibold text-forest">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0" aria-hidden />
                Solicitação recebida! O sindicato entrará em contato pelo WhatsApp para confirmar
                sua vaga.
              </div>
            ) : (
              <p className="mt-4 text-center text-xs text-ink-soft">
                Já tem cadastro?{" "}
                <Link href="/entrar?perfil=aluno" className="font-semibold text-forest underline">
                  Acesse a área do aluno
                </Link>
              </p>
            )}
          </form>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section id="duvidas" className="mx-auto max-w-4xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8">
        <SectionHead kicker="Dúvidas frequentes" title="O que você precisa saber" center />
        <div className="mt-10 divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line bg-cream">
          {faq.map((item, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={item.pergunta}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="font-display text-lg font-semibold text-pine">{item.pergunta}</span>
                  <ChevronDown
                    className={`size-5 shrink-0 text-forest transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                    aria-hidden
                  />
                </button>
                <div
                  className={`grid transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-ink-soft">{item.resposta}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative overflow-hidden bg-pine">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "repeating-radial-gradient(circle at 20% 120%, rgba(216,161,58,0.55) 0 1px, transparent 1px 30px)",
          }}
          aria-hidden
        />
        <div className="relative mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 py-20 text-center sm:px-6 lg:px-8">
          <span className="eyebrow no-rule text-harvest">Vamos começar?</span>
          <h2 className="max-w-3xl font-display text-4xl font-semibold text-white sm:text-5xl">
            A próxima turma está esperando por você
          </h2>
          <p className="max-w-xl text-lg text-cream/80">
            Faça sua pré-inscrição hoje e capacite-se com o SENAR pelo Sindicato Rural de São José
            dos Campos.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="#cursos" className="btn btn-gold text-base">
              Ver cursos abertos
              <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/entrar?perfil=sindicato"
              className="btn text-base text-white ring-1 ring-white/30 hover:bg-white/10"
            >
              Sou do sindicato
              <ArrowUpRight className="size-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

/* -------- local helpers -------- */

function HeroRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[20px_1fr] gap-3 rounded-xl bg-paper p-3">
      <Icon className="mt-0.5 size-5 text-forest" aria-hidden />
      <div>
        <dt className="text-[0.7rem] font-bold uppercase tracking-wide text-ink-soft">{label}</dt>
        <dd className="mt-0.5 font-semibold text-pine">{children}</dd>
      </div>
    </div>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <span className="rounded-xl bg-paper-2 py-2">
      <strong className="block font-display text-lg font-semibold text-pine">{value}</strong>
      <span className="text-xs text-ink-soft">{label}</span>
    </span>
  );
}

function SectionHead({
  kicker,
  title,
  text,
  center,
}: {
  kicker: string;
  title: string;
  text?: string;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className={`eyebrow ${center ? "no-rule justify-center" : ""}`}>{kicker}</span>
      <h2 className="mt-3 font-display text-4xl font-semibold text-pine sm:text-5xl">{title}</h2>
      {text ? <p className="mt-4 text-base leading-relaxed text-ink-soft">{text}</p> : null}
    </div>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-pine">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
