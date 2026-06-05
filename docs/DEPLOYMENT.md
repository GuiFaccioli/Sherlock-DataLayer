# Deployment

## Visão geral

- Backend: Render, rodando NestJS.
- Banco: PostgreSQL em produção via `DATABASE_URL`.
- Frontend: Vercel no futuro. Atualmente não existe frontend no repositório.
- Branch de produção recomendada: `main`.

O projeto está estruturado como backend isolado na raiz do repositório. Não há pastas `backend/` ou `frontend/` neste momento.

## Scripts reais do projeto

```json
{
  "build": "nest build",
  "start:prod": "node dist/main.js",
  "prisma:generate": "npx prisma generate",
  "prisma:migrate:deploy": "npx prisma migrate deploy",
  "playwright:install": "playwright install --with-deps chromium",
  "render:build": "npm run prisma:generate && npm run playwright:install && npm run build"
}
```

## Backend no Render

Configuração recomendada do Web Service:

- Runtime: Node.js
- Root directory: vazio / raiz do repositório
- Branch: `main`
- Build command:

```bash
npm install && npm run render:build
```

- Start command:

```bash
npm run start:prod
```

- Health check path:

```txt
/health
```

O script `render:build` executa:

```bash
npm run prisma:generate && npm run playwright:install && npm run build
```

## Variáveis de ambiente do backend

Configure no Render:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
NODE_ENV=production
NPM_CONFIG_PRODUCTION=false
FRONTEND_URL="https://seu-frontend.vercel.app"
PLAYWRIGHT_TIMEOUT_MS=15000
```

`PORT` é fornecida dinamicamente pelo Render. O código usa `process.env.PORT` e fallback local para `3001`, portanto não é necessário definir `PORT` manualmente no Render.

`NPM_CONFIG_PRODUCTION=false` garante que dependências de desenvolvimento usadas durante o build, como `prisma`, `@nestjs/cli` e `typescript`, sejam instaladas no Render. Sem isso, o deploy pode falhar com `sh: 1: prisma: not found` ou erro equivalente durante `npm run render:build`.

Enquanto não houver frontend, `FRONTEND_URL` pode ficar como uma URL placeholder ou a origem que será usada futuramente. Para desenvolvimento local, use `http://localhost:5173`.

`FRONTEND_URL` aceita múltiplas origens separadas por vírgula:

```env
FRONTEND_URL="https://app.vercel.app,http://localhost:5173"
```

## Prisma e PostgreSQL

Local:

```bash
npm run prisma:migrate
```

Produção:

```bash
npm run prisma:migrate:deploy
```

Não use `prisma migrate dev` em produção.

### Como rodar migrations em produção

Opção recomendada para o primeiro deploy:

1. Crie o PostgreSQL no Render.
2. Copie a `DATABASE_URL` interna/externa fornecida pelo Render.
3. Configure `DATABASE_URL` no Web Service.
4. Após o primeiro build, abra o Shell do serviço no Render e rode:

```bash
npm run prisma:migrate:deploy
```

Alternativa: criar um job/manual command no Render apenas para migrations com:

```bash
npm install && npm run prisma:generate && npm run prisma:migrate:deploy
```

Os scripts usam `npx prisma ...` para chamar o Prisma CLI local do projeto de forma explícita. O pacote `prisma` está em `devDependencies`, então mantenha `NPM_CONFIG_PRODUCTION=false` no Render para que ele esteja disponível durante build e migrations.

Evite acoplar migrations automáticas ao start do servidor para não repetir migrations a cada boot.

## Playwright/Chromium

Render pode precisar instalar browsers e dependências do sistema:

```bash
npx playwright install --with-deps chromium
```

Esse comando está encapsulado em:

```bash
npm run playwright:install
```

Se o comando `--with-deps` falhar por limitação do ambiente, verifique logs do Render e considere uma das alternativas:

- usar ambiente Render que permita instalar dependências do sistema;
- usar Dockerfile customizado futuramente;
- remover `--with-deps` somente se as dependências do sistema já estiverem disponíveis.

## Frontend na Vercel

Ainda não existe frontend. Quando for criado:

- Conectar a Vercel à branch `main`.
- Não hardcodar localhost.
- Usar `VITE_API_URL` para Vite ou `NEXT_PUBLIC_API_URL` para Next.js.

Exemplo Vite:

```env
VITE_API_URL="https://sherlock-datalayer-api.onrender.com"
```

Exemplo Next.js:

```env
NEXT_PUBLIC_API_URL="https://sherlock-datalayer-api.onrender.com"
```

## Validação após deploy

Substitua `SUA_API_RENDER` pela URL real do Render:

```bash
curl https://SUA_API_RENDER.onrender.com/health
curl https://SUA_API_RENDER.onrender.com/audits
curl -X POST https://SUA_API_RENDER.onrender.com/audits \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.exemplo.com.br"}'
```

Resposta esperada do health check:

```json
{
  "status": "ok",
  "service": "sherlock-datalayer-api"
}
```

Verifique logs do Render para:

- conexão Prisma/PostgreSQL;
- instalação do Chromium;
- execução do NestJS em `process.env.PORT`;
- erros de CORS;
- timeouts ou bloqueios de Playwright.

## Passo a passo final Render + PostgreSQL

1. No Render, crie um PostgreSQL Database.
2. Guarde a `DATABASE_URL` do banco.
3. No Render, crie um Web Service conectado ao GitHub/repositório `Sherlock-DataLayer`.
4. Configure:
   - Runtime: Node.js
   - Branch: `main`
   - Root directory: raiz do repositório
   - Build command: `npm install && npm run render:build`
   - Start command: `npm run start:prod`
   - Health check path: `/health`
5. Configure variáveis:
   - `DATABASE_URL` com a URL do PostgreSQL de produção
   - `NODE_ENV=production`
   - `NPM_CONFIG_PRODUCTION=false`
   - `FRONTEND_URL=https://seu-frontend.vercel.app` ou origem futura
   - `PLAYWRIGHT_TIMEOUT_MS=15000`
6. Faça o primeiro deploy.
7. Rode migrations de produção no Shell/Job do Render:

```bash
npm run prisma:migrate:deploy
```

8. Valide:

```bash
curl https://SUA_API_RENDER.onrender.com/health
curl https://SUA_API_RENDER.onrender.com/audits
```

9. Teste uma auditoria real:

```bash
curl -X POST https://SUA_API_RENDER.onrender.com/audits \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.exemplo.com.br"}'
```

10. Verifique no Render se logs não mostram erro de Prisma, Playwright ou CORS.

## Fluxo de atualização em produção

```txt
Alterar código localmente
↓
Rodar testes/build
↓
Commit
↓
Push para GitHub
↓
Vercel atualiza frontend automaticamente, quando existir frontend
↓
Render atualiza backend automaticamente
↓
Rodar prisma migrate deploy se houver nova migration
↓
Validar endpoints em produção
```
