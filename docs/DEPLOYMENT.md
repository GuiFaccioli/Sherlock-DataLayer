# Deployment

## Visão geral

- Backend: Render, rodando NestJS.
- Banco: PostgreSQL em produção via `DATABASE_URL`.
- Frontend: Vercel no futuro. Atualmente não existe frontend no repositório.

## Backend no Render

Configuração recomendada:

- Runtime: Node.js
- Branch: `main`
- Build command:

```bash
npm install && npm run render:build
```

- Start command:

```bash
npm run start:prod
```

O script `render:build` executa:

```bash
npm run prisma:generate && npm run playwright:install && npm run build
```

## Variáveis de ambiente do backend

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
PORT=3001
NODE_ENV=production
FRONTEND_URL="https://seu-frontend.vercel.app"
PLAYWRIGHT_TIMEOUT_MS=15000
```

`PORT` é fornecida dinamicamente pelo Render. O código também usa fallback local para `3001`.

`FRONTEND_URL` pode receber múltiplas origens separadas por vírgula no futuro, por exemplo:

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

Em produção, rode migrations antes ou durante o deploy usando `npm run prisma:migrate:deploy`, conforme estratégia do Render. Se preferir evitar migrations automáticas em todo deploy, execute manualmente no shell/job do Render.

## Playwright/Chromium

Render pode precisar instalar browse
