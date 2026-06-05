# Interaction Audit

Sherlock DataLayer possui dois modos de auditoria.

## Auditoria de carregamento (`page_load`)

Modo padrão. Abre a URL, espera o carregamento inicial e coleta requests, scripts, `window.dataLayer`, ferramentas detectadas, eventos e issues.

## Auditoria de interação (`interaction`)

Além do carregamento inicial, testa até 5 interações básicas e seguras para verificar se cliques importantes geram sinais visíveis de tracking.

```json
{
  "url": "https://www.site.com",
  "mode": "interaction"
}
```

## O que o Sherlock tenta clicar

Elementos visíveis e seguros como `button`, `a`, `input[type="submit"]` e `[role="button"]`.

Prioriza textos de negócio, como comprar, adicionar ao carrinho, fale conosco, contato, enviar, simular, cadastrar, entrar, login, criar conta, assinar, contratar, orçamento, solicitar, começar, teste grátis, quero saber mais e ver planos.

## O que o Sherlock evita clicar

Para evitar automação agressiva, ele não clica em elementos com sinais de risco:

- excluir, deletar, remover;
- cancelar assinatura;
- confirmar compra, finalizar compra, pagar, payment, checkout final;
- logout, sair;
- unsubscribe;
- links `mailto:`;
- links `tel:`;
- downloads/PDF;
- links externos em nova aba quando isso complica a auditoria.

A auditoria não faz compra, não envia formulário real e não preenche dados pessoais reais.

## Status por interação

Cada interação possui dois campos separados:

- `executionStatus`: se o clique foi executado (`executed`), não executado (`not_executed`) ou ignorado (`skipped`).
- `interactionStatus`: resultado específico da interação.

Valores de `interactionStatus`:

- `tracking_detected`: clique executado e gerou dataLayer event ou request de tracking.
- `no_tracking_detected`: clique executado, mas sem sinal visível de tracking.
- `navigation_changed`: clique executado e mudou a URL.
- `blocked_by_overlay`: clique não executado porque modal/overlay/outro elemento interceptou pointer events.
- `timeout`: clique não executado por timeout.
- `failed`: clique não executado por erro não classificado.
- `skipped`: interação ignorada.

## Clique executado sem tracking vs clique não executado

Falha de auditoria não deve virar falha de tracking.

- `executionStatus=executed` + `trackingDetected=false` pode indicar CTA sem tracking visível.
- `executionStatus=not_executed` significa que o Sherlock não validou aquele clique. Não é correto concluir ausência de tracking.

## blocked_by_overlay

Usado quando o Playwright retorna sinais como:

- `intercepts pointer events`;
- `subtree intercepts pointer events`;
- `element is not receiving pointer events`;
- `another element`;
- `covered by`;
- `overlay`, `modal`, `dialog`.

Esses casos entram em `notExecutedWithoutValidation`, não em `executedWithoutTracking`.

## timeout

Usado quando o clique não ocorre dentro do limite, por exemplo `Timeout 3000ms exceeded` ou `waiting for locator`. Timeout também é falha de validação, não prova de ausência de tracking.

## navigation_changed

Usado quando `urlBefore` e `urlAfter` são diferentes após um clique executado. Se também houve dataLayer event ou request de tracking, `trackingDetected=true`; se não houve, o Sherlock gera issue específica de URL alterada sem sinal visível.

## dataLayer após clique

Antes de cada clique, o Sherlock registra eventos existentes no `window.dataLayer`. Depois do clique, compara o tamanho/lista de eventos e extrai novos objetos com campo `event`.

## Requests após clique

Durante a interação, o Sherlock escuta requests e marca sinais de tracking quando URLs combinam com domínios como `googletagmanager.com`, `google-analytics.com`, `analytics.google.com`, `googleadservices.com`, `doubleclick.net`, `facebook.com/tr`, `connect.facebook.net`, `analytics.tiktok.com`, `snap.licdn.com`, `clarity.ms`, `hotjar.com`, `segment.io`, `amplitude.com` e `mixpanel.com`.

## Como interactionSummary é calculado

- `totalElementsFound`: candidatos seguros/relevantes encontrados.
- `totalElementsTested`: candidatos efetivamente tentados, limitado a 5.
- `executedClicks`: cliques executados.
- `notExecutedClicks`: cliques não executados.
- `blockedByOverlay`: não executados por modal/overlay/interceptação.
- `timeouts`: não executados por timeout.
- `navigationChanges`: cliques executados que mudaram a URL.
- `interactionsWithTracking`: somente cliques executados com tracking.
- `executedWithoutTracking`: somente cliques executados sem tracking.
- `notExecutedWithoutValidation`: cliques não executados, que não validam presença/ausência de tracking.

## Limitações

- Não confirma tracking server-side.
- Não garante jornada completa.
- Não executa compras ou ações destrutivas.
- Não envia formulários reais.
- Sites com bloqueio anti-bot continuam classificados como `blocked` ou inconclusivos.
