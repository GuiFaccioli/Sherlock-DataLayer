# Changelog

## 2026-06-05

- Preparado backend para deploy em produção.
- Adicionado `GET /health`.
- Configurado CORS por `FRONTEND_URL`.
- Atualizados scripts de produção, Prisma e Playwright.
- Criados `docs/DEPLOYMENT.md` e `docs/PRODUCTION_CHECKLIST.md`.
- Revisado `docs/DEPLOYMENT.md` com passo a passo específico para Render + PostgreSQL, health check, migrations e scripts reais do projeto.
- Corrigidos scripts Prisma para usar `npx prisma ...` e documentada a configuração `NPM_CONFIG_PRODUCTION=false` no Render para evitar `prisma: not found`.
- Fixado Prisma na major 6 (`prisma@6.19.3` e `@prisma/client@6.19.3`) para manter compatibilidade com o schema atual que usa `url = env("DATABASE_URL")` no datasource.
- Node travado em LTS 22 com `.nvmrc` e `package.json#engines` para reduzir risco de incompatibilidade no Render.
- Movido `prisma@6.19.3` para `dependencies` e alterados scripts para `npx --no-install prisma ...`, impedindo que o Render baixe/use Prisma 7 durante o build.
- Ajustado `playwright:install` para `playwright install chromium` no Render, evitando `--with-deps` porque ele tenta usar root/su para instalar dependências do sistema.
- Configurado runtime do Playwright para Render com `PLAYWRIGHT_BROWSERS_PATH=0` e launch args `--no-sandbox` / `--disable-setuid-sandbox`, após produção criar auditorias mas falhar ao localizar Chromium no cache `/opt/render/.cache/ms-playwright`.
- Normalizada a saída de evidências dos detectors para evitar `matchingScripts` com blocos grandes de HTML/script; criado `docs/DETECTION_RULES.md` e atualizado contrato da API.
- Criado frontend MVP em `frontend/` com Vite, React e TypeScript para consumir o backend em produção e visualizar summary, tools, issues e events.
- Criado `docs/FRONTEND.md` e atualizadas instruções de deploy do frontend na Vercel.
- Corrigido build do backend para excluir `frontend/`, separando compilação NestJS no Render da compilação Vite/React na Vercel.
- Adicionada classificação de qualidade da auditoria (`auditStatus`, `collectionQuality`, `failureReason`) para diferenciar auditoria completa, parcial, bloqueio, timeout e falha.
- Frontend atualizado para exibir status da auditoria, dataLayer, sinais de tracking, issues e interpretação do resultado.
- Criado `docs/AUDIT_QUALITY.md`.
- Adicionado modo `interaction` em `POST /audits`, com cliques seguros limitados, captura de novos eventos no dataLayer e requests de tracking após interação.
- Persistidos `interactions` e `interactionSummary` no Prisma.
- Frontend atualizado com seletor de modo de auditoria e painel de interações testadas.
- Criado `docs/INTERACTION_AUDIT.md`.
- Melhorada a classificação de interações para separar cliques executados, cliques bloqueados por overlay/modal, timeouts, navegação e cliques executados sem tracking.
- Atualizado `interactionSummary` para separar `executedWithoutTracking` de `notExecutedWithoutValidation`.
