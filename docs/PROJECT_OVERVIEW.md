# Project Overview

Sherlock DataLayer é uma API para auditar evidências client-side de analytics/tracking a partir de uma URL.

Fluxo do produto:

URL → Playwright abre o site → coleta scripts, requests e `window.dataLayer` → detecta ferramentas → identifica eventos → gera issues → salva no PostgreSQL → retorna JSON explicativo.

Mentalidade do produto:

DADO → EVENTO → COLETA → DESTINO → MÉTRICA → CONFIABILIDADE → DECISÃO

## Stack atual

- Backend NestJS na raiz do repositório
- Frontend Vite + React em `frontend/`
- TypeScript
- Playwright
- Prisma + PostgreSQL
- class-validator / class-transformer
- @nestjs/config

## Frontend

Existe um frontend MVP em `frontend/` para auditar uma URL contra o backend em produção e exibir summary, ferramentas, issues e eventos. Deploy previsto na Vercel.
