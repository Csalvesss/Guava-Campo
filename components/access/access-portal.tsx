"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ArrowLeft,
  BadgeCheck,
  Building2,
  ClipboardList,
  FileCheck2,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  MessageCircle,
  ShieldCheck,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { Brand } from "@/components/ui/brand";
import { contato } from "@/lib/site-content";

type Perfil = "aluno" | "sindicato";

const detalhes: Record<
  Perfil,
  {
    titulo: string;
    subtitulo: string;
    userLabel: string;
    userPlaceholder: string;
    userType: string;
    userDemo: string;
    passLabel: string;
    passPlaceholder: string;
    passType: string;
    passDemo: string;
    botao: string;
    destino: string;
    features: { icon: LucideIcon; title: string; text: string }[];
  }
> = {
  aluno: {
    titulo: "Área do aluno",
    subtitulo: "Acompanhe suas inscrições, turmas e certificados em um só lugar.",
    userLabel: "CPF",
    userPlaceholder: "000.000.000-00",
    userType: "text",
    userDemo: "123.456.789-10",
    passLabel: "Data de nascimento",
    passPlaceholder: "dd/mm/aaaa",
    passType: "text",
    passDemo: "11/04/1989",
    botao: "Entrar na área do aluno",
    destino: "/aluno",
    features: [
      { icon: ClipboardList, title: "Minhas inscrições", text: "Status do pedido e posição na fila." },
      { icon: MessageCircle, title: "Grupos de turma", text: "WhatsApp liberado após a confirmação." },
      { icon: BadgeCheck, title: "Certificados", text: "Documentos prontos para download." },
      { icon: UserRound, title: "Meus dados", text: "Contato, categoria e propriedade." },
    ],
  },
  sindicato: {
    titulo: "Área do sindicato",
    subtitulo: "Gerencie a mobilização, as turmas e a prestação de contas ao SENAR.",
    userLabel: "E-mail institucional",
    userPlaceholder: "equipe@sindicatoruralsjc.com.br",
    userType: "email",
    userDemo: contato.email,
    passLabel: "Senha",
    passPlaceholder: "Digite sua senha",
    passType: "password",
    passDemo: "demo1234",
    botao: "Entrar na área do sindicato",
    destino: "/sindicato",
    features: [
      { icon: ClipboardList, title: "Pré-inscrições", text: "Fila por prioridade e documentação." },
      { icon: LayoutDashboard, title: "Turmas", text: "Agenda, vagas e status operacional." },
      { icon: UsersRound, title: "Frequência", text: "Presença e aprovação do instrutor." },
      { icon: FileCheck2, title: "Certificados", text: "Emissão e histórico dos alunos." },
    ],
  },
};

export function AccessPortal({ initialPerfil }: { initialPerfil: Perfil }) {
  const router = useRouter();
  const [perfil, setPerfil] = useState<Perfil>(initialPerfil);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);
  const d = detalhes[perfil];

  function switchPerfil(next: Perfil) {
    setPerfil(next);
    setUser("");
    setPass("");
  }

  function fillDemo() {
    setUser(d.userDemo);
    setPass(d.passDemo);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    // Protótipo: autenticação real via Firebase Auth entra aqui.
    setTimeout(() => router.push(d.destino), 500);
  }

  return (
    <div className="grain grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      {/* Brand / marketing panel */}
      <aside className="relative hidden overflow-hidden bg-pine text-cream lg:flex lg:flex-col">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              "repeating-radial-gradient(circle at 80% 15%, rgba(216,161,58,0.6) 0 1px, transparent 1px 28px)",
          }}
          aria-hidden
        />
        <div className="relative flex flex-1 flex-col p-12">
          <Brand tone="light" size="lg" />

          <div className="mt-auto max-w-md">
            <span className="eyebrow no-rule text-harvest">{d.titulo}</span>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-white">
              {d.subtitulo}
            </h1>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {d.features.map((f) => (
                <li
                  key={f.title}
                  className="rounded-2xl bg-white/8 p-4 backdrop-blur"
                >
                  <f.icon className="size-5 text-harvest" aria-hidden />
                  <p className="mt-2.5 font-semibold text-white">{f.title}</p>
                  <p className="mt-0.5 text-sm text-cream/70">{f.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <p className="relative mt-10 text-sm text-cream/60">
            {contato.sistema} · {contato.regiao}
          </p>
        </div>
      </aside>

      {/* Form panel */}
      <div className="relative flex flex-col bg-paper">
        <div className="flex items-center justify-between px-6 py-5 sm:px-10">
          <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-ink-soft hover:text-forest">
            <ArrowLeft className="size-4" aria-hidden />
            Voltar ao site
          </Link>
          <div className="lg:hidden">
            <Brand size="sm" href={null} />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 pb-12 sm:px-10">
          <div className="w-full max-w-md">
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-paper-2 p-1" role="tablist" aria-label="Tipo de acesso">
              {(["aluno", "sindicato"] as Perfil[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  role="tab"
                  aria-selected={perfil === p}
                  onClick={() => switchPerfil(p)}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-bold transition ${
                    perfil === p ? "bg-cream text-forest shadow-[var(--shadow-soft)]" : "text-ink-soft hover:text-forest"
                  }`}
                >
                  {p === "aluno" ? <UserRound className="size-4" aria-hidden /> : <Building2 className="size-4" aria-hidden />}
                  {p === "aluno" ? "Aluno" : "Sindicato"}
                </button>
              ))}
            </div>

            <div className="mt-8">
              <span className="eyebrow no-rule text-moss">{d.titulo}</span>
              <h2 className="mt-2 font-display text-3xl font-semibold text-pine">
                {perfil === "aluno" ? "Bem-vindo de volta" : "Acesso restrito da equipe"}
              </h2>
              <p className="mt-2 text-sm text-ink-soft">{d.subtitulo}</p>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 grid gap-4">
              <label className="block">
                <span className="flex items-center gap-2 text-sm font-semibold text-pine">
                  {perfil === "aluno" ? <ShieldCheck className="size-4 text-forest" aria-hidden /> : <UserRound className="size-4 text-forest" aria-hidden />}
                  {d.userLabel}
                </span>
                <input
                  className="field-input mt-1.5"
                  placeholder={d.userPlaceholder}
                  type={d.userType}
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  required
                />
              </label>
              <label className="block">
                <span className="flex items-center gap-2 text-sm font-semibold text-pine">
                  <KeyRound className="size-4 text-forest" aria-hidden />
                  {d.passLabel}
                </span>
                <input
                  className="field-input mt-1.5"
                  placeholder={d.passPlaceholder}
                  type={d.passType}
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  required
                />
              </label>

              <button type="submit" className="btn btn-primary mt-2 w-full text-base" disabled={loading}>
                <LockKeyhole className="size-5" aria-hidden />
                {loading ? "Entrando…" : d.botao}
              </button>
            </form>

            <div className="mt-4 flex items-center justify-between text-sm">
              <button type="button" onClick={fillDemo} className="font-semibold text-forest underline underline-offset-2">
                Usar acesso de demonstração
              </button>
              {perfil === "aluno" ? (
                <Link href="/#inscricao" className="flex items-center gap-1 text-ink-soft hover:text-forest">
                  Criar cadastro
                </Link>
              ) : (
                <a href={`mailto:${contato.email}`} className="text-ink-soft hover:text-forest">
                  Preciso de acesso
                </a>
              )}
            </div>

            <p className="mt-8 rounded-xl bg-paper-2 p-3 text-center text-xs text-ink-soft">
              Ambiente de demonstração — os dados exibidos nos painéis são fictícios.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
