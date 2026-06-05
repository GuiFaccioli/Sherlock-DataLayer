# Current Status

## Estado atual

- Projeto é backend isolado na raiz; não é monorepo.
- Não existe pasta `backend`.
- Existe frontend MVP em `frontend/` com Vite + React + TypeScript.
- Existe `package.json` na raiz.
- Existe NestJS em `src/`.
- Existe Prisma em `prisma/`.
- Frontend usa Vite + React, sem biblioteca pesada de UI.
- Backend preparado para deploy no Render com porta dinâmica via `PORT`.
- CORS configurado via `FRONTEND_URL`.
- Endpoint `GET /health` criado.
- Documentação de deploy e checklist de produção criada.
- `docs/DEPLOYMENT.md` revisado com passo a passo real para Render + PostgreSQL usando os scripts atuais.
- Scripts Prisma usam `npx --no-install prisma ...` para forçar o CLI local e impedir download automático do Prisma 7 pelo `npx` no Render.
- Render deve configurar `NPM_CONFIG_PRODUCTION=false` para instalar dependências de build como `@nestjs/cli` e `typescript`.
- Prisma fixado em major 6 (`prisma@6.19.3` e `@prisma/client@6.19.3`) em `dependencies` porque o schema atual usa `datasource db` com `url = env("DATABASE_URL")`, formato clássico incompatível com Prisma 7.
- Node travado em LTS 22 via `.nvmrc` e `package.json#engines` (`>=22 <23`) para reduzir risco no Render.
- Script `playwright:install` ajustado para `playwright install chromium`; no Render não usamos `--with-deps` porque ele tenta instalar dependências do sistema com root/su e pode falhar.
- Backend já subiu em produção no Render.
- Banco PostgreSQL de produção conectado.
- Migrations de produção aplicadas.
- `POST /audits` cria auditoria e salva issue no banco, mas Playwright precisou de ajuste de runtime porque o Chromium instalado no cache `/opt/render/.cache/ms-playwright` não estava disponível ao executar a auditoria.
- Runtime do Playwright ajustado com `PLAYWRIGHT_BROWSERS_PATH=0` e Chromium launch args `--no-sandbox` / `--disable-setuid-sandbox`.
- Detectores agora salvam evidências normalizadas/resumidas em `tools[].evidence` (`identifier`, `matchedPattern`, `source`, `evidencePreview` até 300 caracteres), evitando blocos grandes de HTML/script na resposta da API.
- Frontend MVP consome `https://sherlock-datalayer.onrender.com` via `VITE_API_URL` e exibe formulário de auditoria, summary, tools, issues e events.
- Build do backend exclui `frontend/` no `tsconfig.json`; Render compila apenas backend e Vercel compila apenas frontend.
- Render deve usar Build Filters / Ignore Paths para `frontend/**` e `docs/**`.

## Scripts relevantes

- `npm run build`
- `npm run start:prod`
- `npm run lint`
- `npm run prisma:generate` (`npx --no-install prisma generate`)
- `npm run prisma:migrate:deploy` (`npx --no-install prisma migrate deploy`)
- `npm run playwright:install` (`playwright install chromium`)
- `npm run render:build` (`prisma:generate` + `playwright:install` + `build`)
- `cd frontend && npm run build`

## Validações recentes

- `npm install`
- `npm run prisma:generate`
- `npm run lint`
- `npm run build`
- `cd frontend && npm install`
- `cd frontend && npm run build`

## Limitação conhecida

Migração em banco local não foi validada neste ambiente por ausência de credenciais PostgreSQL locais válidas. Produção deve usar `DATABASE_URL` configurada no Render.
