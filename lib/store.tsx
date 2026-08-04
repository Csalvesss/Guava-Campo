"use client";

/**
 * Loja de estado compartilhada e persistida em localStorage.
 *
 * Enquanto o backend (Firebase) não está conectado, esta loja torna o
 * protótipo funcional de verdade: o sindicato cria/edita/exclui turmas,
 * confirma pré-inscrições e emite certificados; o aluno vê o resultado e
 * baixa o certificado que o sindicato subiu. Tudo persiste no navegador e
 * é sincronizado entre as abas (aluno e sindicato).
 *
 * Ponto de migração: trocar `loadInitial()` e cada ação por leituras/escritas
 * no Firestore mantém a mesma interface para os componentes.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getEnrollmentBlock, prioridadePorCategoria, turmaTemVaga } from "./business-rules";
import { turmaOfCourseFrom } from "./catalog";
import {
  alunos as alunosSeed,
  cursos,
  inscricoes as inscricoesSeed,
  turmas as turmasSeed,
} from "./seed";
import type { Aluno, CategoriaAluno, Inscricao, InscricaoStatus, Turma } from "./types";

export type Certificado = {
  id: string;
  inscricaoId: string;
  alunoId: string;
  alunoNome: string;
  cursoId: string;
  cursoNome: string;
  turmaId: string;
  cargaHoraria: number;
  codigo: string;
  fileName: string | null;
  dataUrl: string | null;
  emitidoEm: string;
};

type PersistedState = {
  turmas: Turma[];
  inscricoes: Inscricao[];
  alunos: Aluno[];
  certificados: Certificado[];
};

export type NovaTurmaInput = {
  cursoId: string;
  cursoNome: string;
  local: string;
  endereco: string | null;
  mapsUrl: string | null;
  municipio: string;
  instrutorId: string | null;
  instrutorNome: string | null;
  capacidade: number;
  encontros: { data: string; cargaHoraria: number }[];
  status: Turma["status"];
  confirmacaoAutomatica: boolean;
  numeroOficio: string | null;
  whatsappGrupoUrl: string | null;
  supervisorSenar: { nome: string; contato: string } | null;
};

export type InscricaoPublicaInput = {
  nome: string;
  cpf: string;
  telefone: string;
  categoria: CategoriaAluno;
  cursoId: string;
};

export type InscricaoPublicaResultado = {
  ok: boolean;
  status: InscricaoStatus | null;
  titulo: string;
  mensagem: string;
};

export type InscricaoAlunoInput = {
  alunoId: string;
  cursoId: string;
};

export type InscricaoAlunoResultado = InscricaoPublicaResultado & {
  inscricaoId: string | null;
};

export type NovoAlunoInput = {
  nome: string;
  cpf: string;
  telefone: string;
  categoria: CategoriaAluno;
  municipio: string;
  atividadePrincipal: string;
  associado: boolean;
};

type StoreValue = PersistedState & {
  hydrated: boolean;
  addTurma: (input: NovaTurmaInput) => void;
  updateTurma: (id: string, patch: Partial<Turma>) => void;
  deleteTurma: (id: string) => void;
  setInscricaoStatus: (id: string, status: InscricaoStatus) => void;
  updateInscricao: (id: string, patch: Partial<Inscricao>) => void;
  emitirCertificado: (
    inscricaoId: string,
    file: { fileName: string; dataUrl: string } | null,
  ) => void;
  addAluno: (input: NovoAlunoInput) => Aluno;
  importAlunos: (list: NovoAlunoInput[]) => number;
  inscreverAluno: (input: InscricaoAlunoInput) => InscricaoAlunoResultado;
  inscreverPublico: (input: InscricaoPublicaInput) => InscricaoPublicaResultado;
  resetDemo: () => void;
};

const KEY = "guava-campo-store-v2";
const SINDICATO_ID = "sindicato-sjc";

function loadInitial(): PersistedState {
  return {
    turmas: structuredClone(turmasSeed),
    inscricoes: structuredClone(inscricoesSeed),
    alunos: structuredClone(alunosSeed),
    certificados: [],
  };
}

function uid(prefix: string): string {
  const rand =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${rand}`;
}

function gerarCodigo(eixoOrCurso: string): string {
  const slug = eixoOrCurso.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() || "SNR";
  const num = Math.floor(1000 + Math.random() * 9000);
  return `SJC-2026-${slug}-${num}`;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadInitial);
  const [hydrated, setHydrated] = useState(false);
  const writing = useRef(false);

  // Hydrate from localStorage on mount.
  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      try {
        const raw = localStorage.getItem(KEY);
        if (raw) setState(JSON.parse(raw) as PersistedState);
      } catch {
        /* ignore corrupt storage */
      }
      setHydrated(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  // Persist on change (after hydration).
  useEffect(() => {
    if (!hydrated) return;
    try {
      writing.current = true;
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or unavailable */
    }
  }, [state, hydrated]);

  // Sync across tabs (aluno <-> sindicato).
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === KEY && e.newValue) {
        try {
          setState(JSON.parse(e.newValue) as PersistedState);
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addTurma = useCallback((input: NovaTurmaInput) => {
    const now = new Date().toISOString();
    const turma: Turma = {
      id: uid("turma"),
      sindicatoId: SINDICATO_ID,
      cursoId: input.cursoId,
      cursoNome: input.cursoNome,
      instrutorId: input.instrutorId,
      instrutorNome: input.instrutorNome,
      local: input.local,
      endereco: input.endereco,
      mapsUrl: input.mapsUrl,
      municipio: input.municipio,
      encontros: input.encontros,
      capacidade: input.capacidade,
      vagasPreenchidas: 0,
      status: input.status,
      publicadaNoPortal: true,
      confirmacaoAutomatica: input.confirmacaoAutomatica,
      whatsappGrupoUrl: input.whatsappGrupoUrl,
      supervisorSenar: input.supervisorSenar,
      numeroOficio: input.numeroOficio,
      createdAt: now,
      updatedAt: now,
    };
    setState((s) => ({ ...s, turmas: [turma, ...s.turmas] }));
  }, []);

  const updateTurma = useCallback((id: string, patch: Partial<Turma>) => {
    setState((s) => ({
      ...s,
      turmas: s.turmas.map((t) =>
        t.id === id ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t,
      ),
    }));
  }, []);

  const deleteTurma = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      turmas: s.turmas.filter((t) => t.id !== id),
      inscricoes: s.inscricoes.filter((i) => i.turmaId !== id),
    }));
  }, []);

  const setInscricaoStatus = useCallback((id: string, status: InscricaoStatus) => {
    setState((s) => ({
      ...s,
      inscricoes: s.inscricoes.map((i) =>
        i.id === id
          ? { ...i, status, grupoLiberado: status === "confirmada" ? true : i.grupoLiberado }
          : i,
      ),
    }));
  }, []);

  const updateInscricao = useCallback((id: string, patch: Partial<Inscricao>) => {
    setState((s) => ({
      ...s,
      inscricoes: s.inscricoes.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }));
  }, []);

  const emitirCertificado = useCallback(
    (inscricaoId: string, file: { fileName: string; dataUrl: string } | null) => {
      setState((s) => {
        const insc = s.inscricoes.find((i) => i.id === inscricaoId);
        if (!insc) return s;
        const turma = s.turmas.find((t) => t.id === insc.turmaId);
        const cargaHoraria = turma
          ? turma.encontros.reduce((sum, e) => sum + e.cargaHoraria, 0)
          : 0;
        const codigo = insc.certificadoCodigoValidacao ?? gerarCodigo(turma?.cursoNome ?? "");
        const cert: Certificado = {
          id: uid("cert"),
          inscricaoId,
          alunoId: insc.alunoId,
          alunoNome: insc.alunoNome,
          cursoId: insc.cursoId,
          cursoNome: turma?.cursoNome ?? "",
          turmaId: insc.turmaId,
          cargaHoraria,
          codigo,
          fileName: file?.fileName ?? null,
          dataUrl: file?.dataUrl ?? null,
          emitidoEm: new Date().toISOString(),
        };
        return {
          ...s,
          certificados: [cert, ...s.certificados.filter((c) => c.inscricaoId !== inscricaoId)],
          inscricoes: s.inscricoes.map((i) =>
            i.id === inscricaoId
              ? {
                  ...i,
                  status: "concluida",
                  certificadoEmitido: true,
                  aptoCertificado: true,
                  certificadoUrl: file?.fileName ?? i.certificadoUrl,
                  certificadoCodigoValidacao: codigo,
                }
              : i,
          ),
          alunos: s.alunos.map((a) =>
            a.id === insc.alunoId && !a.cursosConcluidos.includes(insc.cursoId)
              ? { ...a, cursosConcluidos: [...a.cursosConcluidos, insc.cursoId] }
              : a,
          ),
        };
      });
    },
    [],
  );

  const addAluno = useCallback((input: NovoAlunoInput): Aluno => {
    const now = new Date().toISOString();
    const aluno: Aluno = {
      id: uid("aluno"),
      sindicatoId: SINDICATO_ID,
      nome: input.nome,
      cpf: input.cpf,
      dataNascimento: "",
      telefone: input.telefone,
      email: null,
      categoria: input.categoria,
      propriedade: {
        nome: "Não informado",
        municipio: input.municipio,
        car: null,
        itr: null,
        atividadePrincipal: input.atividadePrincipal,
      },
      comprovanteAtividadeUrl: null,
      associado: input.associado,
      cursosConcluidos: [],
      createdAt: now,
      updatedAt: now,
    };
    setState((s) => ({ ...s, alunos: [aluno, ...s.alunos] }));
    return aluno;
  }, []);

  const importAlunos = useCallback((list: NovoAlunoInput[]): number => {
    if (list.length === 0) return 0;
    const now = new Date().toISOString();
    setState((s) => {
      const existentes = new Set(s.alunos.map((a) => a.cpf.replace(/\D/g, "")));
      const novos: Aluno[] = [];
      for (const input of list) {
        const cpfDigits = input.cpf.replace(/\D/g, "");
        if (cpfDigits && existentes.has(cpfDigits)) continue;
        existentes.add(cpfDigits);
        novos.push({
          id: uid("aluno"),
          sindicatoId: SINDICATO_ID,
          nome: input.nome,
          cpf: input.cpf,
          dataNascimento: "",
          telefone: input.telefone,
          email: null,
          categoria: input.categoria,
          propriedade: {
            nome: "Não informado",
            municipio: input.municipio,
            car: null,
            itr: null,
            atividadePrincipal: input.atividadePrincipal,
          },
          comprovanteAtividadeUrl: null,
          associado: input.associado,
          cursosConcluidos: [],
          createdAt: now,
          updatedAt: now,
        });
      }
      return { ...s, alunos: [...novos, ...s.alunos] };
    });
    return list.length;
  }, []);

  const inscreverAluno = useCallback((input: InscricaoAlunoInput): InscricaoAlunoResultado => {
    const curso = cursos.find((c) => c.id === input.cursoId);
    let resultado: InscricaoAlunoResultado = {
      ok: false,
      status: null,
      titulo: "Não foi possível concluir",
      mensagem: "Tente novamente em instantes.",
      inscricaoId: null,
    };

    setState((s) => {
      const aluno = s.alunos.find((a) => a.id === input.alunoId);
      const turma = turmaOfCourseFrom(s.turmas, input.cursoId);

      if (!aluno || !curso) {
        resultado = {
          ok: false,
          status: null,
          titulo: "Cadastro não encontrado",
          mensagem: "Entre novamente na área do aluno ou atualize seu cadastro.",
          inscricaoId: null,
        };
        return s;
      }

      if (!turma) {
        resultado = {
          ok: false,
          status: null,
          titulo: "Sem turma aberta",
          mensagem: "No momento não há turma publicada para este curso.",
          inscricaoId: null,
        };
        return s;
      }

      const bloqueio = getEnrollmentBlock(aluno, curso, turma, s.inscricoes, s.turmas);
      if (bloqueio) {
        resultado = {
          ok: false,
          status: null,
          titulo: "Inscrição não permitida",
          mensagem: bloqueio,
          inscricaoId: null,
        };
        return s;
      }

      const temVaga = turmaTemVaga(turma, s.inscricoes);
      const status: InscricaoStatus = !temVaga
        ? "lista_espera"
        : turma.confirmacaoAutomatica
          ? "confirmada"
          : "pendente";

      const inscricao: Inscricao = {
        id: uid("insc"),
        sindicatoId: SINDICATO_ID,
        turmaId: turma.id,
        cursoId: turma.cursoId,
        alunoId: aluno.id,
        alunoNome: aluno.nome,
        cpfSnapshot: aluno.cpf,
        categoriaSnapshot: aluno.categoria,
        prioridade: prioridadePorCategoria(aluno.categoria),
        status,
        grupoLiberado: status === "confirmada",
        documentacaoOk: false,
        dataInscricao: new Date().toISOString(),
        presencas: [],
        percentualFrequencia: 0,
        aprovadoInstrutor: false,
        aptoCertificado: false,
        certificadoEmitido: false,
        certificadoUrl: null,
        certificadoCodigoValidacao: null,
      };

      resultado =
        status === "confirmada"
          ? {
              ok: true,
              status,
              titulo: "Vaga confirmada!",
              mensagem: `Sua vaga em "${turma.cursoNome}" está confirmada. Acompanhe datas, local e grupo em Minhas inscrições.`,
              inscricaoId: inscricao.id,
            }
          : status === "lista_espera"
            ? {
                ok: true,
                status,
                titulo: "Você entrou na lista de espera",
                mensagem: `A turma "${turma.cursoNome}" está cheia. Sua solicitação ficou registrada na lista de espera.`,
                inscricaoId: inscricao.id,
              }
            : {
                ok: true,
                status,
                titulo: "Inscrição recebida!",
                mensagem: `Sua solicitação para "${turma.cursoNome}" foi enviada ao sindicato para confirmação.`,
                inscricaoId: inscricao.id,
              };

      return {
        ...s,
        turmas:
          status === "confirmada"
            ? s.turmas.map((t) =>
                t.id === turma.id ? { ...t, vagasPreenchidas: t.vagasPreenchidas + 1 } : t,
              )
            : s.turmas,
        inscricoes: [inscricao, ...s.inscricoes],
      };
    });

    return resultado;
  }, []);

  const inscreverPublico = useCallback((input: InscricaoPublicaInput): InscricaoPublicaResultado => {
    const curso = cursos.find((c) => c.id === input.cursoId);
    let resultado: InscricaoPublicaResultado = {
      ok: false,
      status: null,
      titulo: "Não foi possível concluir",
      mensagem: "Tente novamente em instantes.",
    };

    setState((s) => {
      // Melhor turma publicada para o curso.
      const turma = [...s.turmas]
        .filter((t) => t.cursoId === input.cursoId && t.publicadaNoPortal)
        .sort((a, b) => {
          const rank = (t: Turma) =>
            t.status === "confirmada" || t.status === "em_andamento" ? 0 : t.status === "mobilizacao" || t.status === "solicitada" ? 1 : 2;
          return rank(a) - rank(b);
        })[0];

      if (!turma || !curso) {
        resultado = { ok: false, status: null, titulo: "Sem turma aberta", mensagem: "No momento não há turma aberta para este curso. Deixe seu contato com o sindicato." };
        return s;
      }

      const cpfDigits = input.cpf.replace(/\D/g, "");
      let aluno = s.alunos.find((a) => a.cpf.replace(/\D/g, "") === cpfDigits && cpfDigits.length > 0);
      let alunos = s.alunos;
      if (!aluno) {
        aluno = {
          id: uid("aluno"),
          sindicatoId: SINDICATO_ID,
          nome: input.nome,
          cpf: input.cpf,
          dataNascimento: "",
          telefone: input.telefone,
          email: null,
          categoria: input.categoria,
          propriedade: { nome: "Não informado", municipio: "São José dos Campos", car: null, itr: null, atividadePrincipal: "Não informado" },
          comprovanteAtividadeUrl: null,
          associado: false,
          cursosConcluidos: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        alunos = [aluno, ...s.alunos];
      }

      const bloqueio = getEnrollmentBlock(aluno, curso, turma, s.inscricoes, s.turmas);
      if (bloqueio) {
        resultado = { ok: false, status: null, titulo: "Inscrição não permitida", mensagem: bloqueio };
        return { ...s, alunos };
      }

      const prioridade = prioridadePorCategoria(input.categoria);
      const autoConfirma = turma.confirmacaoAutomatica;
      const status: InscricaoStatus = autoConfirma ? "confirmada" : "pendente";

      const inscricao: Inscricao = {
        id: uid("insc"),
        sindicatoId: SINDICATO_ID,
        turmaId: turma.id,
        cursoId: turma.cursoId,
        alunoId: aluno.id,
        alunoNome: aluno.nome,
        cpfSnapshot: aluno.cpf,
        categoriaSnapshot: input.categoria,
        prioridade,
        status,
        grupoLiberado: autoConfirma,
        documentacaoOk: false,
        dataInscricao: new Date().toISOString(),
        presencas: [],
        percentualFrequencia: 0,
        aprovadoInstrutor: false,
        aptoCertificado: false,
        certificadoEmitido: false,
        certificadoUrl: null,
        certificadoCodigoValidacao: null,
      };

      resultado = autoConfirma
        ? { ok: true, status, titulo: "Vaga confirmada!", mensagem: `Sua vaga em “${turma.cursoNome}” está confirmada. Você já pode acessar a área do aluno.` }
        : { ok: true, status, titulo: "Pré-inscrição recebida!", mensagem: `Você entrou na fila de “${turma.cursoNome}” com prioridade ${prioridade}. O sindicato vai confirmar pelo WhatsApp.` };

      return {
        ...s,
        alunos,
        turmas: autoConfirma
          ? s.turmas.map((t) => (t.id === turma.id ? { ...t, vagasPreenchidas: t.vagasPreenchidas + 1 } : t))
          : s.turmas,
        inscricoes: [inscricao, ...s.inscricoes],
      };
    });

    return resultado;
  }, []);

  const resetDemo = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setState(loadInitial());
  }, []);

  const value = useMemo<StoreValue>(
    () => ({
      ...state,
      hydrated,
      addTurma,
      updateTurma,
      deleteTurma,
      setInscricaoStatus,
      updateInscricao,
      emitirCertificado,
      addAluno,
      importAlunos,
      inscreverAluno,
      inscreverPublico,
      resetDemo,
    }),
    [
      state,
      hydrated,
      addTurma,
      updateTurma,
      deleteTurma,
      setInscricaoStatus,
      updateInscricao,
      emitirCertificado,
      addAluno,
      importAlunos,
      inscreverAluno,
      inscreverPublico,
      resetDemo,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore precisa estar dentro de <StoreProvider>");
  return ctx;
}

// Prioridade recalculada por categoria (usada ao editar/adicionar inscrição).
export function prioridadeAluno(categoria: CategoriaAluno): number {
  return prioridadePorCategoria(categoria);
}
