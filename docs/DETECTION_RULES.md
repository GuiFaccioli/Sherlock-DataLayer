# Detection Rules

Sherlock DataLayer detecta ferramentas de tracking a partir de evidências client-side coletadas pelo Playwright:

- requests de rede;
- scripts carregados ou inline;
- conteúdo serializado do `window.dataLayer`.

## Ferramentas cobertas no MVP

- Google Tag Manager: `googletagmanager.com/gtm.js`, padrão `GTM-`.
- Google Analytics 4: `google-analytics.com/g/collect`, `gtag/js?id=G-`, padrão `G-`.
- Meta Pixel: `connect.facebook.net`, `facebook.com/tr`, `fbq`.
- TikTok Pixel: `analytics.tiktok.com`, `ttq`.
- LinkedIn Insight: `snap.licdn.com`, `px.ads.linkedin.com`, `lintrk`.
- Google Ads: `googleadservices.com`, `pagead/conversion`, padrão `AW-`.

## Formato normalizado de evidência

As evidências salvas em `tools[].evidence` são intencionalmente resumidas para manter a API e o futuro dashboard legíveis.

Formato:

```json
{
  "identifier": "GTM-KTRN5D7",
  "matchedPattern": "GTM-[A-Z0-9_-]+",
  "source": "html_content",
  "evidencePreview": "...GTM-KTRN5D7..."
}
```

Campos:

- `identifier`: ID principal quando identificado, como `GTM-...`, `G-...` ou `AW-...`.
- `matchedPattern`: regex/padrão que causou a detecção.
- `source`: origem da evidência. Valores possíveis:
  - `request`: URL de request de rede;
  - `script`: URL de script carregado;
  - `html_content`: script inline ou conteúdo serializado detectado no DOM/dataLayer.
- `evidencePreview`: trecho resumido com no máximo 300 caracteres.

## Raw data

Blocos completos de script, HTML, requests e `dataLayer` devem permanecer em `Audit.rawData` quando necessário. Detectors não devem salvar blocos grandes em `tools[].evidence`, para evitar payloads poluídos e difíceis de renderizar.
