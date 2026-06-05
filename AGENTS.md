# AGENTS.md

Orientações para agentes no projeto Sherlock DataLayer.

- Leia a documentação em `docs/` antes de alterar código.
- Não implemente frontend, dashboard ou componentes visuais sem solicitação explícita.
- Priorize backend NestJS, Playwright, Prisma e PostgreSQL.
- Nunca commite arquivos `.env` reais ou segredos.
- Use `npm run lint`, `npm run build` e `npx prisma generate` antes de finalizar alterações.
- Para deploy, produção usa `prisma migrate deploy`; local usa `prisma migrate dev`.
