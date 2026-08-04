import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";
import { CookieSettingsButton } from "@/components/privacy/cookie-settings-button";
import { contato } from "@/lib/site-content";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Entenda e gerencie as tecnologias de armazenamento usadas pelo portal.",
};

const linkClass = "font-semibold text-forest underline underline-offset-2";

const sections: LegalSection[] = [
  {
    id: "conceito",
    title: "O que são cookies e tecnologias semelhantes",
    content: (
      <p>Cookies são pequenos arquivos gravados pelo navegador. O portal também usa armazenamento local, que cumpre função semelhante ao guardar preferências e informações da sessão no seu dispositivo.</p>
    ),
  },
  {
    id: "categorias",
    title: "Categorias utilizadas",
    content: (
      <div className="overflow-hidden rounded-lg border border-line">
        <div className="grid gap-1 border-b border-line bg-paper-2 p-4 sm:grid-cols-[160px_1fr]">
          <strong className="text-pine">Necessários</strong>
          <span>Mantêm preferências, sessão do aluno e recursos essenciais. Permanecem ativos porque o portal não funciona corretamente sem eles.</span>
        </div>
        <div className="grid gap-1 p-4 sm:grid-cols-[160px_1fr]">
          <strong className="text-pine">Análise de uso</strong>
          <span>Ajudam a entender visitas e navegação de forma agregada. São opcionais, ficam desligados por padrão e só são ativados após a sua escolha.</span>
        </div>
      </div>
    ),
  },
  {
    id: "tecnologias",
    title: "O que pode ser armazenado",
    content: (
      <ul className="space-y-3">
        <li><strong className="text-pine">guava-campo-cookie-consent-v1:</strong> registra sua preferência por até 12 meses ou até uma nova versão da política.</li>
        <li><strong className="text-pine">guava-campo-student-session-v1:</strong> mantém o acesso do aluno neste navegador até a saída ou limpeza dos dados locais.</li>
        <li><strong className="text-pine">guava-campo-store-v2:</strong> guarda dados funcionais do ambiente de demonstração até a redefinição ou limpeza do navegador.</li>
        <li><strong className="text-pine">Google Analytics/Firebase Analytics:</strong> quando autorizado, pode usar identificadores como <code className="rounded bg-paper-2 px-1.5 py-0.5 text-sm text-pine">_ga</code> para métricas de uso, conforme os prazos configurados pelo fornecedor.</li>
      </ul>
    ),
  },
  {
    id: "bases-legais",
    title: "Bases legais e fornecedores",
    content: (
      <>
        <p>O armazenamento necessário é usado para fornecer os recursos solicitados, preservar a segurança e manter o funcionamento do portal. A análise de uso é baseada no consentimento e pode ser recusada ou revogada a qualquer momento.</p>
        <p>Quando autorizado, o Google Firebase pode tratar identificadores técnicos como fornecedor de análise. A hospedagem do portal é realizada pela Netlify.</p>
      </>
    ),
  },
  {
    id: "gerenciamento",
    title: "Como gerenciar ou retirar sua escolha",
    content: (
      <>
        <p>Você pode aceitar todos, manter somente os necessários ou escolher por categoria no banner. A recusa não impede o acesso ao conteúdo e aos recursos essenciais.</p>
        <div className="inline-flex rounded-lg border border-line bg-cream px-4 py-3 font-semibold text-forest">
          <CookieSettingsButton />
        </div>
        <p>Também é possível apagar cookies e dados locais nas configurações do navegador. A remoção da sessão exigirá novo acesso à área do aluno.</p>
      </>
    ),
  },
  {
    id: "contato",
    title: "Privacidade, atualizações e contato",
    content: (
      <>
        <p>Esta política pode ser atualizada quando as tecnologias do portal mudarem. Em caso de dúvida, fale com o {contato.nome} pelo e-mail <a href={`mailto:${contato.email}`} className={linkClass}>{contato.email}</a>.</p>
        <p>Leia também a <Link href="/politica-de-privacidade" className={linkClass}>Política de Privacidade</Link> e o <a href="https://www.gov.br/anpd/pt-br/centrais-de-conteudo/materiais-educativos-e-publicacoes/guia-orientativo-cookies-e-protecao-de-dados-pessoais.pdf" target="_blank" rel="noreferrer" className={linkClass}>Guia de Cookies da ANPD</a>.</p>
      </>
    ),
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalPage
      eyebrow="Preferências de navegação"
      title="Política de Cookies"
      description="Você decide sobre tecnologias opcionais. Os recursos necessários continuam disponíveis mesmo quando cookies de análise são recusados."
      updatedAt="4 de agosto de 2026"
      sections={sections}
    />
  );
}
