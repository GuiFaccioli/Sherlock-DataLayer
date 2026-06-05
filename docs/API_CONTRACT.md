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

`mode` é opcional e preserva compatibilidade. Valores:

- `page_load` — padrão, audita o carregamento inicial.
- `interaction` — audita carregamento inicial e até 5 interações básicas seguras.

Exemplo com interação:

```json
{
  "url": "https://www.exemplo.com.br",
  "mode": "interaction"
}
```

Resposta: auditoria com `auditId`, `url`, `finalUrl`, `status`, `auditStatus`, `collectionQuality`, `failureReason`, `pageTitle`, `summary`, `tools`, `events` e `issues`.

Campos de qualidade:

```json
{
  "auditStatus": "completed",
  "collectionQuality": "high",
  "failureReason": null,
  "summary": {
    "confidence": "high",
    "auditStatus": "completed",
    "collectionQuality": "high",
    "failureReason": null,
    "interpretation": "Auditoria concluída. O site possui sinais de tracking client-side..."
  }
}
```

Se `auditStatus` for `blocked`, `timeout` ou `failed`, não é seguro concluir ausência de tracking.

Quando `mode=interaction`, a resposta também pode trazer:

```json
{
  "interactionSummary": {
    "enabled": true,
    "totalElementsFound": 12,
    "totalElementsTested": 5,
    "interactionsWithTracking": 2,
    "interactionsWithoutTracking": 3,
    "eventsDetected": ["generate_lead", "click_cta"],
    "quality": "medium"
  },
  "interactions": [
    {
      "action": "click",
      "elementText": "Fale com vendas",
      "elementTag": "button",
      "elementRole": null,
      "urlBefore": "https://site.com",
      "urlAfter": "https://site.com",
      "newDataLayerEvents": ["generate_lead"],
      "trackingRequestsAfterClick": ["https://www.google-analytics.com/g/collect?..."],
      "trackingDetected": true,
      "quality": "high",
      "issues": []
    }
  ]
}
```

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
