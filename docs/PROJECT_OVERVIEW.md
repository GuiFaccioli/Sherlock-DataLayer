# Project Overview

Sherlock DataLayer é uma API para auditar evidências client-side de analytics/tracking a partir de uma URL.

Fluxo do produto:

URL → Playwright abre o site → coleta scripts, requests e `window.dataLayer` → detecta ferramentas → identifica eventos → gera issues → salva no PostgreSQL → retorna JSON explicativo.

Mentalidade do produto:

DADO → EVENTO → COLETA → DESTINO → MÉTRICA → CONFIABILIDADE → DECISÃO

## Stack atual

- Backend isolado na raiz do repositório
- NestJS + TypeScript
- Playwright
- Prisma + PostgreSQL
- class-validator / class-transformer
- @nestjs/config

## Frontend

Ainda não existe frontend no projeto. Deploy futuro previsto na Vercel.
