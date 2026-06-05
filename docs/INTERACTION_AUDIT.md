# Interaction Audit

Sherlock DataLayer possui dois modos de auditoria.

## Auditoria de carregamento (`page_load`)

Modo padrão. Abre a URL, espera o carregamento inicial e coleta:

- requests de rede;
- scripts;
- `window.dataLayer`;
- ferramentas detectadas;
- eventos e issues.

## Auditoria de interação (`interaction`)

Além do carregamento inicial, testa até 5 interações básicas e seguras para verificar se cliques importantes geram sinais visíveis de tracking.

O request usa:

```json
{
  "url": "https://www.site.com",
  "mode": "interaction"
}
```

## O que o Sherlock tenta clicar

Elementos visíveis e seguros como:

- `button`;
- `a`;
- `input[type="submit"]`;
- `[role="button"]`.

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

## dataLayer após clique

Antes de cada clique, o Sherlock registra eventos existentes no `window.dataLayer`. Depois do clique, compara o tamanho/lista de eventos e extrai novos objetos com campo `event`.

## Requests após clique

Durante a interação, o Sherlock escuta requests e marca sinais de tracking quando URLs combinam com domínios como:

- `googletagmanager.com`;
- `google-analytics.com`;
- `analytics.google.com`;
- `googleadservices.com`;
- `doubleclick.net`;
- `facebook.com/tr`;
- `connect.facebook.net`;
- `analytics.tiktok.com`;
- `snap.licdn.com`;
- `clarity.ms`;
- `hotjar.com`;
- `segment.io`;
- `amplitude.com`;
- `mixpanel.com`.

## Resultado

O backend retorna:

- `interactionSummary`: totais e qualidade geral das interações;
- `interactions`: detalhes por clique, incluindo eventos novos, requests de tracking, qualidade e issues.

## Limitações

- Não confirma tracking server-side.
- Não garante jornada completa.
- Não executa compras ou ações destrutivas.
- Não envia formulários reais.
- Sites com bloqueio anti-bot continuam classificados como `blocked` ou inconclusivos.
