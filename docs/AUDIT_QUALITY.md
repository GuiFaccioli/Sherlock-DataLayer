# Audit Quality

Sherlock DataLayer diferencia ausência real de sinais de tracking de auditorias inconclusivas.

## auditStatus

Indica o estado da auditoria:

- `completed`: a página carregou e a coleta conseguiu analisar requests, scripts e `dataLayer`.
- `partial`: a página carregou parcialmente ou não atingiu estado estável de rede; o resultado é útil, mas não definitivo.
- `blocked`: a página exibiu sinais de bloqueio, como Access Denied, Forbidden, Akamai, Cloudflare block, bot protection ou request blocked.
- `timeout`: o Playwright atingiu o tempo limite.
- `failed`: erro inesperado ou erro de navegação/SSL impediu a coleta.

## collectionQuality

Nível de confiança da coleta:

- `high`: auditoria completa com evidências suficientes.
- `medium`: evidências úteis, mas com alguma limitação.
- `low`: evidências fracas ou página bloqueada.
- `unknown`: falha/timeout sem coleta confiável.

## failureReason

Motivo principal quando a auditoria não é completa:

- `access_denied`
- `bot_protection`
- `timeout`
- `navigation_error`
- `ssl_error`
- `unknown_error`
- `null` quando não há falha.

## Site bloqueado não significa ausência de tracking

Quando o site bloqueia automação, a página analisada pode ser uma tela de bloqueio e não a experiência real de um usuário. Nesse caso, o Sherlock não deve concluir que GTM, GA4, Meta Pixel ou `dataLayer` estão ausentes. O resultado deve ser tratado como inconclusivo ou de baixa confiabilidade.

## Como interpretar

- Auditoria completa sem ferramentas: pode indicar ausência de tracking client-side principal ou coleta server-side não visível no navegador.
- Auditoria completa com GTM/GA4/pixels: há sinais client-side de coleta/destino.
- Auditoria parcial: use como indício; valide novamente ou revise manualmente.
- Auditoria bloqueada: não conclua ausência de tracking.
- Timeout: resultado inconclusivo; aumente timeout, tente novamente ou investigue manualmente.
