# Architecture

## Estrutura

Backend isolado na raiz do repositório.

```txt
src/
├── analyzers/     # geração de issues de qualidade
├── audits/        # endpoints e orquestração da auditoria
├── browser/       # Playwright
├── collectors/    # dataLayer, network e scripts
├── detectors/     # detectores de GTM, GA4, Meta, TikTok, LinkedIn, Google Ads
├── prisma/        # PrismaService
├── app.module.ts
├── health.controller.ts
└── main.ts
```

## Fluxo de auditoria

1. `POST /audits` recebe URL válida.
2. Uma auditoria é criada com status `running`.
3. Playwright abre a URL e coleta evidências client-side.
4. Collectors extraem eventos de `dataLayer` e requests de rede.
5. Detectors identificam ferramentas de tracking.
6. Analyzer gera issues básicas.
7. Prisma salva auditoria, ferramentas, eventos e issues.
8. API retorna JSON com resumo e evidências.

## Banco

PostgreSQL via Prisma. A produção deve configurar `DATABASE_URL`.
