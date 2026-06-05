# Testing Guide

## Instalação

```bash
npm install
```

## Validações sem banco

```bash
npx prisma generate
npm run lint
npm run build
```

## Banco local

Configure `.env` com `DATABASE_URL` e rode:

```bash
npm run prisma:migrate
```

## Produção

Não use `migrate dev` em produção. Use:

```bash
npm run prisma:migrate:deploy
```

## Teste manual

Com a API rodando:

```bash
curl http://localhost:3001/health
curl http://localhost:3001/audits
curl -X POST http://localhost:3001/audits \
  -H "Content-Type: application/json" \
  -d '{"url":"https://www.exemplo.com.br"}'
```
