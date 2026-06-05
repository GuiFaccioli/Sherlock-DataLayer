# API Contract

Base URL local: `http://localhost:3001`

## GET /health

Resposta:

```json
{
  "status": "ok",
  "service": "sherlock-datalayer-api"
}
```

## POST /audits

Body:

```json
{
  "url": "https://www.exemplo.com.br"
}
```

Resposta: auditoria com `auditId`, `url`, `finalUrl`, `status`, `pageTitle`, `summary`, `tools`, `events` e `issues`.

## GET /audits

Lista auditorias recentes com resumo.

## GET /audits/:id

Retorna auditoria específica com ferramentas, eventos e issues.

## Nota de confiabilidade

O `summary.note` deve deixar claro que a auditoria valida evidências client-side e não confirma chegada real dos eventos nas plataformas sem acesso interno.
