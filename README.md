# Sindicato Rural de São José dos Campos — Portal SENAR

Portal de cursos gratuitos do **SENAR-SP** mobilizados pelo **Sindicato Rural de São José dos Campos** (Vale do Paraíba). O produtor encontra as turmas abertas, faz a pré-inscrição online e acompanha tudo pela área do aluno; a equipe do sindicato gerencia a mobilização, a fila de prioridade e a prestação de contas em uma área própria.

> Piloto do produto **Guava Campo** — pensado para ser replicado em outros sindicatos rurais do sistema FAESP/SENAR-SP.

## Identidade visual

Direção "editorial agrária": base de papel quente, verdes profundos (pinheiro/floresta), dourado de colheita e um coral-goiaba de assinatura. Tipografia **Fraunces** (display serifado) + **Hanken Grotesk** (interface).

## Estrutura de páginas

O site foi dividido em páginas separadas (antes tudo ficava numa página só):

| Rota | Descrição |
| --- | --- |
| `/` | Site público: hero, cursos abertos, como funciona, áreas de capacitação, diferenciais, depoimentos, pré-inscrição e dúvidas. |
| `/entrar` | Página de acesso, com abas **Aluno** e **Sindicato**. Aceita `?perfil=aluno` ou `?perfil=sindicato` e direciona o login para a área correta. |
| `/aluno` | **Área do aluno** (página própria): painel, minhas inscrições, certificados, cursos disponíveis e meus dados. |
| `/sindicato` | **Área do sindicato** (página própria): painel geral, fila de pré-inscrições por prioridade, turmas, alunos, certificados e relatórios de prestação de contas. |

O login é um **protótipo**: ao entrar, o usuário é encaminhado para o painel correspondente com dados de demonstração (fictícios). A autenticação real (Firebase Auth + custom claims) entra no lugar do `router.push` em `components/access/access-portal.tsx`.

## Organização do código

```
app/                     Rotas (App Router): /, /entrar, /aluno, /sindicato
components/
  site/                  Header, footer e landing pública
  access/                Página de acesso (login) com abas
  app/                   Shell de dashboard + primitivas (StatTile, Panel, badges)
  aluno/                 Painel do aluno
  sindicato/             Painel de gestão do sindicato
  ui/                    Marca (logo) e ícones de eixos
lib/
  seed.ts                Dados de demonstração (cursos, turmas, alunos, inscrições)
  business-rules.ts      Prioridade, frequência, fila e certificação
  catalog.ts             Helpers de catálogo e formatação de datas
  site-content.ts        Conteúdo institucional (eixos, números, FAQ, contato)
  types.ts               Tipos do domínio
  firebase.ts            Inicialização do Firebase
```

## Rodar localmente

```bash
npm install
npm run dev
```

Depois abra `http://localhost:3000`.

## Variáveis do Firebase

Crie um `.env.local` a partir de `.env.example`. As variáveis `NEXT_PUBLIC_` são usadas no navegador.

## Deploy no Netlify

1. Conecte o repositório `Csalvesss/Guava-Campo` no Netlify.
2. Comando de build: `npm run build` (o `netlify.toml` fixa Node 22).
3. Cadastre as variáveis do Firebase no painel do Netlify.

## Firebase

Projeto apontado para `guava-campo` em `.firebaserc`.

- `firebase/firestore.rules` — regras de segurança, isoladas por `sindicatoId`.
- `firebase/storage.rules` — comprovantes, logos e certificados.
- `firebase/firestore.indexes.json` — índices para filas e consultas por inquilino.
- `functions/src/index.ts` — funções derivadas (prioridade, frequência, aptidão a certificado, vagas).

## Próximos blocos de produto

1. Login real com perfis por custom claims e roteamento por permissão.
2. Rotas por slug público do sindicato (multi-tenant).
3. Escrita real no Firestore para inscrições, confirmações e frequência.
4. Geração de PDF do certificado com QR de validação pública.
5. Exportações reais (CSV/PDF) de prestação de contas ao SENAR.

## Referências

- Conteúdo baseado em informações públicas do sistema FAESP/SENAR-SP e do Sindicato Rural de São José dos Campos. Contatos marcados como *editável* no código devem ser confirmados pelo sindicato.
