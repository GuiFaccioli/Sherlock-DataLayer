# Current Status

## Estado atual

- Projeto é backend isolado na raiz; não é monorepo.
- Não existe pasta `backend`.
- Não existe pasta `frontend`.
- Existe `package.json` na raiz.
- Existe NestJS em `src/`.
- Existe Prisma em `prisma/`.
- Não existe Vite, React ou Next.js atualmente.
- Backend preparado para deploy no Render com porta dinâmica via `PORT`.
- CORS configurado via `FRONTEND_URL`.
- Endpoint `GET /health` criado.
- Documentação de deploy e checklist de produção criada.
- `docs/DEPLOYMENT.md` revisado com passo a passo real para Render + PostgreSQL usando os scripts atuais.
- Scripts Prisma usam `npx prisma ...` para evitar falha `prisma: not found` no Render.
- Render deve configurar `NPM_CONFIG_PRODUCTION=false` para instalar dependências de build como `prisma`, `@nestjs/cli` e `typescript`.

## Scripts relevantes

- `npm run build`
- `npm run start:prod`
- `npm run lint`
- `npm run prisma:generate` (`npx prisma generate`)
- `npm run prisma:migrate:deploy` (`npx prisma migrate deploy`)
- `npm run playwright:install`
- `npm run render:build` (`prisma:generate` + `playwright:install` + `build`)

## Validações recentes

- `npm install`
- `npx prisma generate`
- `npm run lint`
- `npm run build`

## Limitação conhecida

Migração em banco local não foi validada neste ambiente por ausência de credenciais PostgreSQL locais válidas. Produção deve usar `DATABASE_URL` configurada no Render.
