# Changelog

## 2026-06-05

- Preparado backend para deploy em produção.
- Adicionado `GET /health`.
- Configurado CORS por `FRONTEND_URL`.
- Atualizados scripts de produção, Prisma e Playwright.
- Criados `docs/DEPLOYMENT.md` e `docs/PRODUCTION_CHECKLIST.md`.
- Revisado `docs/DEPLOYMENT.md` com passo a passo específico para Render + PostgreSQL, health check, migrations e scripts reais do projeto.
- Corrigidos scripts Prisma para usar `npx prisma ...` e documentada a configuração `NPM_CONFIG_PRODUCTION=false` no Render para evitar `prisma: not found`.
