import type { Aluno, CategoriaAluno, Curso, Inscricao, InscricaoStatus, Turma } from "./types";

const STATUS_INSCRICAO_ATIVA: InscricaoStatus[] = ["pendente", "confirmada", "lista_espera"];

export function normalizarCpf(cpf: string) {
  return cpf.replace(/\D/g, "");
}

function dataAulaKey(value: string) {
  return value.slice(0, 10);
}

function formatarDataConflito(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function inscricaoPertenceAoCpf(inscricao: Inscricao, aluno: Aluno) {
  const cpfAluno = normalizarCpf(aluno.cpf);
  if (!cpfAluno) return inscricao.alunoId === aluno.id;

  return inscricao.alunoId === aluno.id || normalizarCpf(inscricao.cpfSnapshot) === cpfAluno;
}

export function prioridadePorCategoria(categoria: CategoriaAluno) {
  const prioridades: Record<CategoriaAluno, number> = {
    produtor: 1,
    familiar: 2,
    colaborador: 3,
    publico_geral: 4,
  };

  return prioridades[categoria];
}

export function calcularPercentualFrequencia(inscricao: Inscricao) {
  if (inscricao.presencas.length === 0) {
    return 0;
  }

  const presencas = inscricao.presencas.filter((presenca) => presenca.presente).length;
  return Math.round((presencas / inscricao.presencas.length) * 100);
}

export function podeEmitirCertificado(inscricao: Inscricao) {
  return inscricao.percentualFrequencia >= 80 && inscricao.aprovadoInstrutor;
}

export function getEnrollmentBlock(
  aluno: Aluno,
  curso: Curso,
  turmaAlvo: Turma | null,
  inscricoes: Inscricao[],
  turmas: Turma[] = [],
) {
  if (aluno.cursosConcluidos.includes(curso.id)) {
    return "Curso já concluído por este CPF.";
  }

  const inscricoesDoCpf = inscricoes.filter((inscricao) => inscricaoPertenceAoCpf(inscricao, aluno));

  const concluidaPorCpf = inscricoesDoCpf.find(
    (inscricao) => inscricao.cursoId === curso.id && inscricao.status === "concluida",
  );

  if (concluidaPorCpf) {
    return "Curso já concluído por este CPF.";
  }

  const ativa = inscricoesDoCpf.find(
    (inscricao) =>
      inscricao.cursoId === curso.id && STATUS_INSCRICAO_ATIVA.includes(inscricao.status),
  );

  if (ativa) {
    return `Já existe inscrição ${ativa.status.replace("_", " ")} para este curso.`;
  }

  if (!turmaAlvo) {
    return null;
  }

  const datasAlvo = new Set(turmaAlvo.encontros.map((encontro) => dataAulaKey(encontro.data)));
  const conflito = inscricoesDoCpf.find((inscricao) => {
    if (!STATUS_INSCRICAO_ATIVA.includes(inscricao.status)) return false;
    if (inscricao.turmaId === turmaAlvo.id) return false;

    const turmaAtual = turmas.find((turma) => turma.id === inscricao.turmaId);
    if (!turmaAtual) return false;

    return turmaAtual.encontros.some((encontro) => datasAlvo.has(dataAulaKey(encontro.data)));
  });

  if (conflito) {
    const turmaConflito = turmas.find((turma) => turma.id === conflito.turmaId);
    const dataConflito = turmaConflito?.encontros.find((encontro) =>
      datasAlvo.has(dataAulaKey(encontro.data)),
    );
    const data = dataConflito ? ` em ${formatarDataConflito(dataConflito.data)}` : "";
    const cursoConflito = turmaConflito?.cursoNome ?? "outra turma";
    return `Você já está inscrito em ${cursoConflito}${data}. Não é possível se inscrever em duas turmas no mesmo dia.`;
  }

  return null;
}

export function turmaTemVaga(turma: Turma, inscricoes: Inscricao[]) {
  const ocupadas = inscricoes.filter(
    (inscricao) =>
      inscricao.turmaId === turma.id &&
      ["pendente", "confirmada", "concluida"].includes(inscricao.status),
  ).length;

  return Math.max(ocupadas, turma.vagasPreenchidas) < turma.capacidade;
}

export function ordenarFilaPorPrioridade(inscricoes: Inscricao[]) {
  return [...inscricoes].sort((a, b) => {
    if (a.prioridade !== b.prioridade) {
      return a.prioridade - b.prioridade;
    }

    return new Date(a.dataInscricao).getTime() - new Date(b.dataInscricao).getTime();
  });
}

export function resumirSindicato(
  cursos: Curso[],
  turmas: Turma[],
  inscricoes: Inscricao[],
  alunos: Aluno[],
) {
  const inscricoesAtivas = inscricoes.filter((inscricao) =>
    ["pendente", "confirmada", "lista_espera"].includes(inscricao.status),
  );
  const certificadosAptos = inscricoes.filter((inscricao) => inscricao.aptoCertificado).length;
  const abaixoDaFrequencia = inscricoes.filter(
    (inscricao) => inscricao.percentualFrequencia > 0 && inscricao.percentualFrequencia < 80,
  ).length;

  return {
    cursosPublicados: cursos.filter((curso) => curso.ativo).length,
    turmasEmAndamento: turmas.filter((turma) =>
      ["confirmada", "em_andamento"].includes(turma.status),
    ).length,
    inscricoesAtivas: inscricoesAtivas.length,
    alunosCadastrados: alunos.length,
    certificadosAptos,
    abaixoDaFrequencia,
  };
}
