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
  "prisma:generate": "npx --no-install prisma generate",
  "prisma:migrate:deploy": "npx --no-install prisma migrate deploy",
  "playwright:install": "playwright install chromium",
  "render:build": "npm run prisma:generate && npm run playwright:install && npm run build"
}
```

## Backend no Render

Configuração recomendada do Web Service:

- Runtime: Node.js
- Node version: LTS 22 (`.nvmrc` contém `22` e `package.json` define `engines.node` como `>=22 <23`)
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

O projeto trava Node em LTS 22 para reduzir risco de incompatibilidade entre NestJS, Prisma 6 e Playwright. Se o Render tentar usar Node 24 por padrão, confirme que ele está lendo `.nvmrc` ou configure a versão de Node para 22 nas opções do serviço.

`NPM_CONFIG_PRODUCTION=false` garante que dependências de desenvolvimento usadas durante o build, como `@nestjs/cli` e `typescript`, sejam instaladas no Render. O Prisma CLI também foi colocado em `dependencies` para ficar disponível mesmo quando o ambiente omitir devDependencies.

Enquanto não houver frontend, `FRONTEND_URL` pode ficar como uma URL placeholder ou a origem que será usada futuramente. Para desenvolvimento local, use `http://localhost:5173`.

`FRONTEND_URL` aceita múltiplas origens separadas por vírgula:

```env
FRONTEND_URL="https://app.vercel.app,http://localhost:5173"
```

## Prisma e PostgreSQL

Este MVP usa Prisma 6 (`prisma@6.19.3` e `@prisma/client@6.19.3`). As duas dependências devem permanecer na mesma major version e estão em `dependencies`, não apenas em `devDependencies`, para garantir disponibilidade durante o build do Render.

Motivo: o schema atual usa o formato clássico com `url = env("DATABASE_URL")` dentro de `datasource db`. O Prisma 7 mudou essa configuração e falha com `P1012` / `The datasource property url is no longer supported in schema files`. Para este MVP, não migramos para a configuração nova do Prisma 7.

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

Os scripts usam `npx --no-install prisma ...` para chamar somente o Prisma CLI local do projeto. Isso impede que o `npx` baixe automaticamente Prisma 7 durante o build.

Se o Render mostrar `Prisma CLI Version: 7.x` durante generate ou migrate, isso indica que o CLI local não foi instalado/selecionado corretamente. Verifique se `prisma@6.19.3` está em `dependencies`, se o `package-lock.json` foi atualizado, se o deploy está usando o commit mais recente e se o build command começa com `npm install`.

Evite acoplar migrations automáticas ao start do servidor para não repetir migrations a cada boot.

## Playwright/Chromium

No Render, não use `playwright install --with-deps chromium` no build padrão. O `--with-deps` tenta instalar dependências do sistema com elevação de permissão/root (`su`) e pode falhar em ambientes sem permissão administrativa.

O projeto usa:

```bash
playwright install chromium
```

Esse comando está encapsulado em:

```bash
npm run playwright:install
```

Se o Chromium ainda falhar em runtime, verifique logs do Render e considere uma das alternativas:

- usar Dockerfile customizado futuramente com dependências do sistema instaladas na imagem;
- usar plano/ambiente Render com dependências compatíveis;
- avaliar outro ambiente de deploy com suporte explícito a browsers headless;
- ajustar Playwright/timeouts se a falha for de navegação ou bloqueio anti-bot, e não de instalação.

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
   - Node version: 22 LTS
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
