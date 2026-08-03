export type PlanoSindicato = "basico" | "pro" | "enterprise";
export type CursoTipo = "FPR" | "PromocaoSocial" | "Tecnico";
export type CategoriaAluno = "produtor" | "familiar" | "colaborador" | "publico_geral";
export type TurmaStatus =
  | "mobilizacao"
  | "solicitada"
  | "confirmada"
  | "em_andamento"
  | "concluida"
  | "cancelada";
export type InscricaoStatus =
  | "pendente"
  | "confirmada"
  | "lista_espera"
  | "concluida"
  | "reprovada"
  | "desistente";

export type Perfil =
  | "super_admin"
  | "admin_sindicato"
  | "mobilizador"
  | "instrutor"
  | "aluno";

export interface Sindicato {
  id: string;
  nome: string;
  municipio: string;
  cnpj: string;
  marca: {
    logoUrl: string;
    senarLogoUrl: string;
    corPrimaria: string;
    corSecundaria: string;
  };
  slug: string;
  plano: PlanoSindicato;
  assinaturaAtiva: boolean;
  createdAt: string;
}

export interface Aluno {
  id: string;
  sindicatoId: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
  telefone: string;
  email: string | null;
  categoria: CategoriaAluno;
  propriedade: {
    nome: string;
    municipio: string;
    car: string | null;
    itr: string | null;
    atividadePrincipal: string;
  };
  comprovanteAtividadeUrl: string | null;
  associado: boolean;
  cursosConcluidos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Curso {
  id: string;
  sindicatoId: string;
  nome: string;
  tipo: CursoTipo;
  eixo: string;
  cargaHoraria: number;
  descricao: string;
  objetivos: string[];
  imagemUrl: string | null;
  codigoSenar: string | null;
  ativo: boolean;
}

export interface Instrutor {
  id: string;
  sindicatoId: string;
  nome: string;
  cpf: string;
  telefone: string;
  email: string | null;
  especialidades: string[];
  credenciado: boolean;
}

export interface Encontro {
  data: string;
  cargaHoraria: number;
}

export interface Turma {
  id: string;
  sindicatoId: string;
  cursoId: string;
  cursoNome: string;
  instrutorId: string | null;
  instrutorNome: string | null;
  local: string;
  endereco?: string | null;
  mapsUrl?: string | null;
  municipio: string;
  encontros: Encontro[];
  capacidade: number;
  vagasPreenchidas: number;
  status: TurmaStatus;
  publicadaNoPortal: boolean;
  confirmacaoAutomatica: boolean;
  whatsappGrupoUrl: string | null;
  supervisorSenar: { nome: string; contato: string } | null;
  numeroOficio: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Presenca {
  encontroData: string;
  presente: boolean;
}

export interface Inscricao {
  id: string;
  sindicatoId: string;
  turmaId: string;
  cursoId: string;
  alunoId: string;
  alunoNome: string;
  cpfSnapshot: string;
  categoriaSnapshot: CategoriaAluno;
  prioridade: number;
  status: InscricaoStatus;
  grupoLiberado: boolean;
  documentacaoOk: boolean;
  dataInscricao: string;
  presencas: Presenca[];
  percentualFrequencia: number;
  aprovadoInstrutor: boolean;
  aptoCertificado: boolean;
  certificadoEmitido: boolean;
  certificadoUrl: string | null;
  certificadoCodigoValidacao: string | null;
}

export const categoriaLabels: Record<CategoriaAluno, string> = {
  produtor: "Produtor rural",
  familiar: "Familiar de produtor",
  colaborador: "Colaborador de produtor",
  publico_geral: "Público geral",
};

export const turmaStatusLabels: Record<TurmaStatus, string> = {
  mobilizacao: "Mobilização",
  solicitada: "Solicitada",
  confirmada: "Confirmada",
  em_andamento: "Em andamento",
  concluida: "Concluída",
  cancelada: "Cancelada",
};

export const inscricaoStatusLabels: Record<InscricaoStatus, string> = {
  pendente: "Pendente",
  confirmada: "Confirmada",
  lista_espera: "Lista de espera",
  concluida: "Concluída",
  reprovada: "Reprovada",
  desistente: "Desistente",
};
