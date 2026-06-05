# Decisions

## Backend isolado

O projeto permanece como backend isolado na raiz enquanto não houver frontend.

## Render para API

Render será usado para o backend NestJS porque suporta serviços Node.js com variável dinâmica `PORT`.

## Vercel para frontend futuro

Frontend ainda não existe. Quando criado, deve usar variável pública de API (`VITE_API_URL` ou `NEXT_PUBLIC_API_URL`) e deploy na Vercel.

## Prisma em produção

Produção usa `prisma migrate deploy`. `prisma migrate dev` fica restrito ao ambiente local.

## CORS por variável

CORS usa `FRONTEND_URL`. Múltiplas origens podem ser informadas separadas por vírgula.
