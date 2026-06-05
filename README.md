# Sherlock DataLayer

Backend MVP em NestJS para auditar evidências client-side de analytics/tracking a partir de uma URL.

## Stack

- NestJS + TypeScript
- Playwright
- PostgreSQL + Prisma
- class-validator / class-transformer
- @nestjs/config

## Configuração

```bash
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```

## Endpoints

- `POST /audits` — cria e executa auditoria
- `GET /audits` — lista auditorias recentes
- `GET /audits/:id` — retorna auditoria com tools, events e issues

Exemplo:

```bash
curl -X POST http://localhost:3000/audits \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.exemplo.com.br"}'
```

A auditoria valida evidências client-side visíveis pela URL. Ela não confirma chegada real dos eventos dentro de GA4, Meta, Google Ads, CRM ou backend sem acesso interno.
