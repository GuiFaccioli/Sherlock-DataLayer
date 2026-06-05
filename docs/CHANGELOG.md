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
