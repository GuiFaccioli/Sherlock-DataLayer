# Known Issues

## Playwright no Render

Playwright em produção pode exigir ajuste fino no Render. O build deve instalar Chromium com:

```bash
npx playwright install --with-deps chromium
```

Se o serviço falhar ao abrir páginas, verifique logs do Render, dependências do sistema, timeout e bloqueios anti-bot do site auditado.

## PostgreSQL local neste ambiente

A migration local não foi validada no ambiente do agente porque o PostgreSQL local recusou autenticação com as credenciais padrão. Configure `DATABASE_URL` válida antes de rodar `prisma migrate dev`.
