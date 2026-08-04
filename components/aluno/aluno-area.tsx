"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { LogIn, UserPlus } from "lucide-react";
import { AlunoDashboard } from "@/components/aluno/aluno-dashboard";
import { Brand } from "@/components/ui/brand";
import { normalizarCpf } from "@/lib/business-rules";
import { loadStudentSession } from "@/lib/student-session";
import { useStore } from "@/lib/store";
import { categoriaLabels, type CategoriaAluno } from "@/lib/types";

type CadastroForm = {
  nome: string;
  telefone: string;
  categoria: CategoriaAluno;
  municipio: string;
  atividadePrincipal: string;
  associado: boolean;
};

const initialForm: CadastroForm = {
  nome: "",
  telefone: "",
  categoria: "produtor",
  municipio: "São José dos Campos",
  atividadePrincipal: "",
  associado: false,
};

function subscribeToSession(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSessionCpf() {
  return loadStudentSession()?.cpf ?? null;
}

export function AlunoArea({ courseId }: { courseId?: string }) {
  const store = useStore();
  const sessionCpf = useSyncExternalStore(subscribeToSession, getSessionCpf, () => null);

  const aluno = useMemo(() => {
    const cpf = normalizarCpf(sessionCpf ?? "");
    if (!cpf) return null;
    return store.alunos.find((item) => normalizarCpf(item.cpf) === cpf) ?? null;
  }, [sessionCpf, store.alunos]);

  if (!store.hydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper px-6 text-center">
        <div>
          <Brand href={null} />
          <p className="mt-4 text-sm text-ink-soft">Carregando sua área do aluno...</p>
        </div>
      </div>
    );
  }

  if (!sessionCpf) {
    return (
      <div className="grid min-h-screen place-items-center bg-paper px-6">
        <div className="card card-soft w-full max-w-lg p-7 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-forest/10 text-forest">
            <LogIn className="size-5" aria-hidden />
          </span>
          <h1 className="mt-5 font-display text-3xl font-semibold text-pine">Entre para continuar</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-soft">
            As inscrições são feitas dentro da área do aluno para validar CPF, histórico e agenda.
          </p>
          <Link href="/entrar?perfil=aluno" className="btn btn-primary mt-6 w-full">
            Acessar área do aluno
          </Link>
        </div>
      </div>
    );
  }

  if (!aluno) {
    return <CadastroAluno cpf={sessionCpf} onCadastrar={store.addAluno} />;
  }

  return <AlunoDashboard alunoId={aluno.id} courseId={courseId} />;
}

function CadastroAluno({
  cpf,
  onCadastrar,
}: {
  cpf: string;
  onCadastrar: ReturnType<typeof useStore>["addAluno"];
}) {
  const [form, setForm] = useState<CadastroForm>(initialForm);

  function updateField<K extends keyof CadastroForm>(key: K, value: CadastroForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCadastrar({
      nome: form.nome,
      cpf,
      telefone: form.telefone,
      categoria: form.categoria,
      municipio: form.municipio,
      atividadePrincipal: form.atividadePrincipal || "Não informado",
      associado: form.associado,
    });
  }

  return (
    <div className="grain min-h-screen bg-paper px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <Brand href="/" />
        <form onSubmit={handleSubmit} className="card card-soft mt-8 p-6 sm:p-8">
          <div className="flex items-start gap-4 border-b border-line pb-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-forest/10 text-forest">
              <UserPlus className="size-5" aria-hidden />
            </span>
            <div>
              <span className="eyebrow no-rule">Primeiro acesso</span>
              <h1 className="mt-1 font-display text-3xl font-semibold text-pine">Complete seu cadastro</h1>
              <p className="mt-2 text-sm text-ink-soft">CPF identificado: {cpf}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Nome completo" className="sm:col-span-2">
              <input required className="field-input" value={form.nome} onChange={(event) => updateField("nome", event.target.value)} />
            </Field>
            <Field label="WhatsApp">
              <input required className="field-input" value={form.telefone} onChange={(event) => updateField("telefone", event.target.value)} placeholder="(12) 99999-9999" />
            </Field>
            <Field label="Categoria">
              <select className="field-input" value={form.categoria} onChange={(event) => updateField("categoria", event.target.value as CategoriaAluno)}>
                {Object.entries(categoriaLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </Field>
            <Field label="Município">
              <input required className="field-input" value={form.municipio} onChange={(event) => updateField("municipio", event.target.value)} />
            </Field>
            <Field label="Atividade principal">
              <input className="field-input" value={form.atividadePrincipal} onChange={(event) => updateField("atividadePrincipal", event.target.value)} placeholder="Ex.: Fruticultura" />
            </Field>
          </div>

          <label className="mt-5 flex items-center gap-3 text-sm text-ink-soft">
            <input type="checkbox" checked={form.associado} onChange={(event) => updateField("associado", event.target.checked)} />
            Sou associado ao sindicato rural
          </label>

          <button type="submit" className="btn btn-primary mt-6 w-full">
            Salvar e ver cursos
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return <label className={className}><span className="mb-1.5 block text-sm font-semibold text-pine">{label}</span>{children}</label>;
}
