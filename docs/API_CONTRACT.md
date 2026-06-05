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

Exemplo resumido de `tools`:

```json
[
  {
    "name": "Google Tag Manager",
    "type": "tag_manager",
    "identifier": "GTM-KTRN5D7",
    "found": true,
    "evidence": {
      "identifier": "GTM-KTRN5D7",
      "matchedPattern": "GTM-[A-Z0-9_-]+",
      "source": "html_content",
      "evidencePreview": "...GTM-KTRN5D7..."
    }
  }
]
```

`tools[].evidence.evidencePreview` é limitado a 300 caracteres. Blocos completos de script/HTML não devem aparecer em `tools[].evidence`; quando necessário, ficam em `Audit.rawData`.

## GET /audits

Lista auditorias recentes com resumo.

## GET /audits/:id

Retorna auditoria específica com ferramentas, eventos e issues.

## Nota de confiabilidade

O `summary.note` deve deixar claro que a auditoria valida evidências client-side e não confirma chegada real dos eventos nas plataformas sem acesso interno.
