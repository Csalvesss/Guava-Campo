import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";
import { contato } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Saiba como o portal trata e protege os dados pessoais de alunos e visitantes.",
};

const listClass = "list-disc space-y-2 pl-5 marker:text-harvest";
const officialLinkClass = "font-semibold text-forest underline underline-offset-2";

const sections: LegalSection[] = [
  {
    id: "controlador",
    title: "Quem cuida dos seus dados",
    content: (
      <>
        <p>O controlador dos dados pessoais tratados neste portal é o <strong className="text-pine">{contato.nome}</strong>. As decisões sobre cadastro, inscrições, turmas, comunicação e certificados são tomadas pelo sindicato no contexto dos cursos oferecidos pelo SENAR-SP.</p>
        <p>Dúvidas ou solicitações sobre privacidade podem ser enviadas para <a href={`mailto:${contato.email}`} className={officialLinkClass}>{contato.email}</a> ou pelo telefone {contato.telefone}.</p>
      </>
    ),
  },
  {
    id: "dados",
    title: "Dados que podemos tratar",
    content: (
      <ul className={listClass}>
        <li><strong className="text-pine">Identificação:</strong> nome, CPF e data de nascimento.</li>
        <li><strong className="text-pine">Contato e perfil rural:</strong> telefone, município, categoria, atividade principal e vínculo associativo.</li>
        <li><strong className="text-pine">Jornada de capacitação:</strong> cursos solicitados, turma, situação da inscrição, presença, aprovação e certificado.</li>
        <li><strong className="text-pine">Dados técnicos:</strong> preferências de cookies, informações básicas de acesso e eventos de navegação, quando autorizados.</li>
      </ul>
    ),
  },
  {
    id: "finalidades",
    title: "Por que usamos esses dados",
    content: (
      <>
        <p>Usamos os dados estritamente necessários para identificar o aluno, criar e manter o cadastro, receber pedidos de inscrição, organizar turmas, enviar comunicações, controlar presença e disponibilizar certificados.</p>
        <p>As principais bases legais são os procedimentos solicitados pelo próprio titular e a execução da relação de capacitação, o cumprimento de obrigações legais ou regulatórias e o legítimo interesse na segurança do portal. Dados de análise de uso só são ativados mediante consentimento nas preferências de cookies.</p>
      </>
    ),
  },
  {
    id: "compartilhamento",
    title: "Com quem os dados podem ser compartilhados",
    content: (
      <>
        <p>Os dados podem ser compartilhados, dentro da necessidade de cada atividade, com SENAR-SP e entidades do Sistema FAESP, instrutores e equipes responsáveis pelas turmas, fornecedores de tecnologia e autoridades públicas quando houver obrigação legal.</p>
        <p>Netlify e Google Firebase podem atuar como fornecedores de infraestrutura, hospedagem, autenticação, banco de dados ou análise, conforme os recursos efetivamente ativados. O sindicato não vende dados pessoais.</p>
      </>
    ),
  },
  {
    id: "armazenamento",
    title: "Armazenamento e prazo de conservação",
    content: (
      <>
        <p>Na versão atual do portal, a sessão do aluno e os dados de demonstração são mantidos no navegador. Quando os serviços online forem ativados, os registros poderão ser armazenados em infraestrutura contratada pelo sindicato.</p>
        <p>Os dados são mantidos enquanto forem necessários para inscrição, execução das turmas, emissão e comprovação de certificados, atendimento a direitos e cumprimento de obrigações. Depois disso, serão eliminados, anonimizados ou conservados apenas quando houver fundamento legal.</p>
      </>
    ),
  },
  {
    id: "seguranca",
    title: "Como protegemos as informações",
    content: (
      <p>Adotamos controles de acesso, limitação de permissões, conexão segura e medidas organizacionais compatíveis com a natureza dos dados. Nenhum sistema é totalmente isento de riscos; incidentes relevantes serão avaliados e comunicados conforme a LGPD e as orientações da ANPD.</p>
    ),
  },
  {
    id: "direitos",
    title: "Seus direitos",
    content: (
      <>
        <p>Você pode solicitar confirmação e acesso aos dados, correção, informação sobre compartilhamentos, revisão de decisões automatizadas, anonimização, bloqueio ou eliminação quando cabível, portabilidade e revogação de consentimentos.</p>
        <p>Envie o pedido para <a href={`mailto:${contato.email}`} className={officialLinkClass}>{contato.email}</a>. Podemos solicitar informações adicionais para confirmar sua identidade e proteger o cadastro contra acesso indevido.</p>
      </>
    ),
  },
  {
    id: "decisoes",
    title: "Regras automáticas e revisão",
    content: (
      <p>O portal pode aplicar verificações automáticas de elegibilidade e agenda para apoiar a organização das turmas. Caso uma regra impeça uma solicitação, o aluno pode pedir explicação e revisão pela equipe do sindicato.</p>
    ),
  },
  {
    id: "menores",
    title: "Crianças e adolescentes",
    content: (
      <p>Quando uma atividade admitir participante menor de idade, o cadastro e o tratamento dos dados deverão observar o melhor interesse do menor e, quando aplicável, a participação do responsável legal.</p>
    ),
  },
  {
    id: "aceite",
    title: "Ciência, alterações e fontes oficiais",
    content: (
      <>
        <p>Ao marcar a opção no acesso do aluno, você confirma que teve acesso a esta política. Essa ciência não substitui o consentimento específico quando ele for exigido, como no caso de cookies de análise. A versão e a data da confirmação ficam registradas na sessão do navegador.</p>
        <p>Esta política pode ser atualizada para refletir mudanças no portal ou na legislação. Alterações relevantes serão informadas e poderão exigir nova ciência.</p>
        <p>Consulte a <a href="https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm" target="_blank" rel="noreferrer" className={officialLinkClass}>Lei Geral de Proteção de Dados</a> e os <a href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados-1/direito-dos-titulares" target="_blank" rel="noreferrer" className={officialLinkClass}>direitos explicados pela ANPD</a>.</p>
        <p>Para tecnologias de navegação, consulte também nossa <Link href="/politica-de-cookies" className={officialLinkClass}>Política de Cookies</Link>.</p>
      </>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="LGPD e transparência"
      title="Política de Privacidade"
      description="Explicamos de forma clara quais dados são usados no portal, por que são necessários e como você pode exercer seus direitos."
      updatedAt="4 de agosto de 2026"
      sections={sections}
    />
  );
}
