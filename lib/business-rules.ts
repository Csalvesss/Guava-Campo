import type { Aluno, CategoriaAluno, Curso, Inscricao, Turma } from "./types";

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
  inscricoes: Inscricao[],
) {
  if (aluno.cursosConcluidos.includes(curso.id)) {
    return "Curso já concluído por este CPF.";
  }

  const ativa = inscricoes.find(
    (inscricao) =>
      inscricao.alunoId === aluno.id &&
      inscricao.cursoId === curso.id &&
      ["pendente", "confirmada", "lista_espera", "concluida"].includes(inscricao.status),
  );

  if (ativa) {
    return `Já existe inscrição ${ativa.status.replace("_", " ")} para este curso.`;
  }

  return null;
}

export function turmaTemVaga(turma: Turma, inscricoes: Inscricao[]) {
  const ocupadas = inscricoes.filter(
    (inscricao) =>
      inscricao.turmaId === turma.id &&
      ["pendente", "confirmada", "concluida"].includes(inscricao.status),
  ).length;

  return ocupadas < turma.capacidade;
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
