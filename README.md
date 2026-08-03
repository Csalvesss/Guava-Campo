# Guava Campo

Plataforma de gestão de cursos do SENAR para sindicatos rurais. Esta primeira versão foi preparada para o **Sindicato Rural de São José dos Campos**, com portal do aluno, painel operacional e base Firebase.

## O que já está nesta entrega

- App Next.js com TypeScript e Tailwind.
- Portal do aluno com catálogo, trava de curso único por CPF e inscrição/lista de espera simulada.
- Painel do sindicato com fila por prioridade SENAR, confirmação de inscrição e liberação de grupo WhatsApp.
- Frequência e certificação com regra de 80% + aprovação do instrutor.
- Visão Guava Admin com inquilino, plano, slug e mapa de cobertura.
- Firebase configurado para Auth, Firestore, Storage, Functions e Analytics.
- Regras iniciais de Firestore/Storage com isolamento por `sindicatoId`.
- Configuração pronta para conectar o repositório ao Netlify.

## Rodar localmente

```bash
npm install
npm run dev
```

Depois abra `http://localhost:3000`.

## Variáveis do Firebase

Crie um arquivo `.env.local` usando `.env.example` como base. As variáveis `NEXT_PUBLIC_` são usadas pelo app no navegador.

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

## Deploy no Netlify

1. Envie este repositório para o GitHub.
2. No Netlify, crie um novo site conectado ao repositório `Csalvesss/Guava-Campo`.
3. Use o comando de build `npm run build`.
4. Cadastre as variáveis do Firebase no painel do Netlify.

O Netlify detecta Next.js automaticamente. O arquivo `netlify.toml` fixa o comando de build e Node 22.

## Firebase

O projeto está apontado para o projeto Firebase `guava-campo` em `.firebaserc`.

Arquivos principais:

- `firebase/firestore.rules`: regras de segurança do banco.
- `firebase/storage.rules`: regras de arquivos de comprovantes, logos e certificados.
- `firebase/firestore.indexes.json`: índices iniciais para filas e consultas por inquilino.
- `functions/src/index.ts`: funções derivadas para prioridade, frequência, aptidão de certificado e vagas preenchidas.

## Próximos blocos de produto

1. Login real com perfis por custom claims.
2. Rotas por slug público do sindicato.
3. Escrita real no Firestore para inscrições, confirmações e frequência.
4. Geração de PDF do certificado com QR de validação pública.
5. Relatórios PDF/CSV de prestação de contas ao SENAR.
