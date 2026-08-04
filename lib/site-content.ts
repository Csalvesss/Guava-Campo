/**
 * Static institutional + marketing content for the public site.
 * Grounded in public information about SENAR-SP / FAESP and the
 * Sindicato Rural de São José dos Campos (Vale do Paraíba).
 * Contact details marked "editável" should be confirmed by the sindicato.
 */

export const contato = {
  nome: "Sindicato Rural de São José dos Campos",
  curto: "Sindicato Rural de S.J. dos Campos",
  sistema: "Sistema FAESP · SENAR-SP · CAESP",
  regiao: "Vale do Paraíba · São Paulo",
  municipio: "São José dos Campos — SP",
  presidente: "Renato Veneziani",
  email: "sindicatoruralsjc@gmail.com",
  telefone: "(12) 3922-0000", // editável
  whatsapp: "https://wa.me/5512999999999", // editável
  endereco: "São José dos Campos · Vale do Paraíba · SP", // editável
  horario: "Seg. a Sex., 8h às 17h",
  instagram: "@sindicatoruralsjc", // editável
};

export type IconKey =
  | "sprout"
  | "cow"
  | "milk"
  | "drone"
  | "leaf"
  | "bee"
  | "shield"
  | "chart";

/** Eixos temáticos SENAR-SP com cursos mobilizados pelo sindicato. */
export const eixos: {
  icon: IconKey;
  nome: string;
  descricao: string;
}[] = [
  { icon: "sprout", nome: "Fruticultura", descricao: "Goiaba, citros e frutas do Vale, do manejo à colheita." },
  { icon: "cow", nome: "Pecuária de Corte", descricao: "Manejo, nutrição e ganho de peso do rebanho." },
  { icon: "milk", nome: "Pecuária de Leite", descricao: "Ordenha higiênica e qualidade do leite." },
  { icon: "drone", nome: "Mecanização Agrícola", descricao: "Máquinas, implementos e pulverização com drones." },
  { icon: "leaf", nome: "Olericultura", descricao: "Produção de hortaliças e acesso a mercados." },
  { icon: "bee", nome: "Apicultura", descricao: "Produção de mel e renda para a família rural." },
  { icon: "shield", nome: "Segurança do Trabalho", descricao: "NR-31 e operação segura no campo." },
  { icon: "chart", nome: "Gestão e Empreendedorismo", descricao: "Custos, planejamento e o Empresário Rural." },
];

/** Números institucionais (sistema FAESP/SENAR-SP). */
export const numeros: { valor: string; rotulo: string; detalhe: string }[] = [
  { valor: "645", rotulo: "municípios de SP", detalhe: "atendidos pelo Sistema FAESP/SENAR-SP" },
  { valor: "237", rotulo: "sindicatos rurais", detalhe: "filiados em todo o estado" },
  { valor: "100%", rotulo: "gratuito", detalhe: "para o produtor e o trabalhador rural" },
  { valor: "24h", rotulo: "pré-inscrição online", detalhe: "sem sair da propriedade" },
];

/** Passo a passo do aluno. */
export const passos: { numero: string; titulo: string; texto: string; icon: string }[] = [
  {
    numero: "01",
    titulo: "Escolha o curso",
    texto: "Veja as turmas abertas do SENAR mobilizadas pelo sindicato e o eixo que combina com a sua propriedade.",
    icon: "search",
  },
  {
    numero: "02",
    titulo: "Entre na área do aluno",
    texto: "Acesse com seu CPF, confira o histórico e solicite a vaga usando os dados do seu cadastro.",
    icon: "clipboard",
  },
  {
    numero: "03",
    titulo: "Confirmação e grupo",
    texto: "Ao confirmar a vaga, o sindicato libera o grupo de WhatsApp da turma com datas, local e materiais.",
    icon: "message",
  },
  {
    numero: "04",
    titulo: "Certificado",
    texto: "Com 80% de frequência e aprovação do instrutor, o certificado SENAR fica disponível para download.",
    icon: "badge",
  },
];

/** Diferenciais do portal (argumento de venda para outros sindicatos). */
export const diferenciais: { titulo: string; texto: string; icon: string }[] = [
  {
    titulo: "Fila por prioridade automática",
    texto: "Produtor, familiar, colaborador e público geral entram na ordem certa, seguindo as regras do SENAR.",
    icon: "list",
  },
  {
    titulo: "Trava de curso único por CPF",
    texto: "O sistema evita inscrição duplicada e curso repetido, protegendo a prestação de contas.",
    icon: "lock",
  },
  {
    titulo: "Grupos de turma no WhatsApp",
    texto: "Cada turma confirmada ganha um grupo liberado só para quem foi aprovado.",
    icon: "message",
  },
  {
    titulo: "Frequência e certificado digital",
    texto: "Lista de presença, aprovação do instrutor e certificado com código de validação pública.",
    icon: "badge",
  },
  {
    titulo: "Painel de gestão do sindicato",
    texto: "Turmas, vagas, documentação e indicadores em um só lugar, prontos para o dia a dia da equipe.",
    icon: "dashboard",
  },
  {
    titulo: "Relatórios de prestação de contas",
    texto: "Dados organizados por turma e supervisor para a prestação ao SENAR-SP em poucos cliques.",
    icon: "report",
  },
];

/** Depoimentos ilustrativos (representativos do público-alvo). */
export const depoimentos: { nome: string; papel: string; texto: string }[] = [
  {
    nome: "Marina Costa",
    papel: "Produtora de goiaba · Sítio Santa Rita",
    texto:
      "Fiz a pré-inscrição do celular, no meio da lida. Em dois dias já estava no grupo da turma com todas as datas. Muito mais fácil do que ir até a cidade.",
  },
  {
    nome: "João Marcos Silva",
    papel: "Pecuarista familiar · Fazenda Boa Vista",
    texto:
      "O certificado saiu direto no portal, com código pra validar. Ajudou demais na hora de comprovar a capacitação da equipe.",
  },
  {
    nome: "Equipe de mobilização",
    papel: "Sindicato Rural de São José dos Campos",
    texto:
      "Antes controlávamos tudo no caderno e no grupo. Agora a fila já vem por prioridade e a frequência fica registrada. Sobra tempo pra ir a campo.",
  },
];

/** Perguntas frequentes. */
export const faq: { pergunta: string; resposta: string }[] = [
  {
    pergunta: "Os cursos são pagos?",
    resposta:
      "Não. Os cursos de Formação Profissional Rural e de Promoção Social do SENAR são gratuitos para o público-alvo, custeados pela contribuição do setor agropecuário. O sindicato apenas mobiliza e organiza as turmas.",
  },
  {
    pergunta: "Quem pode participar?",
    resposta:
      "Prioritariamente produtores rurais, trabalhadores rurais e seus familiares. Vagas remanescentes podem ser abertas ao público geral, conforme cada turma. A fila segue a prioridade definida pelo SENAR.",
  },
  {
    pergunta: "Preciso ser associado ao sindicato?",
    resposta:
      "Não é obrigatório para se inscrever. Ser associado ajuda o sindicato a manter a mobilização e pode dar prioridade em algumas ações.",
  },
  {
    pergunta: "Como recebo o certificado?",
    resposta:
      "Com frequência mínima de 80% dos encontros e aprovação do instrutor, o certificado SENAR é liberado na sua área do aluno, com código para validação pública.",
  },
  {
    pergunta: "Onde acontecem as aulas?",
    resposta:
      "Na sede do Sindicato Rural, em propriedades parceiras e em bairros rurais de São José dos Campos e região do Vale do Paraíba, sempre de forma presencial.",
  },
  {
    pergunta: "Posso fazer o mesmo curso de novo?",
    resposta:
      "Cada CPF realiza um curso uma única vez. O portal também bloqueia inscrições em turmas que tenham aula no mesmo dia de outra inscrição ativa.",
  },
];
