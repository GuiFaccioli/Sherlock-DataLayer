import type { AuditResponse, DetectedEvent } from "../types/audit";
import { modeLabel, qualityLabel } from "./labels";

function listItems(items: string[], limit = 5): string {
  const unique = [...new Set(items.filter(Boolean))];
  if (unique.length === 0) return "";
  const visible = unique.slice(0, limit);
  const suffix = unique.length > limit ? ` e mais ${unique.length - limit}` : "";
  return `${visible.join(", ")}${suffix}`;
}

function statusParagraph(audit: AuditResponse): string {
  const status = audit.auditStatus ?? audit.summary?.auditStatus ?? audit.status;
  const quality = qualityLabel(audit.collectionQuality ?? audit.summary?.collectionQuality);
  const reason = audit.failureReason ?? audit.summary?.failureReason;

  if (status === "blocked") {
    return `A auditoria foi bloqueada pelo site${reason ? ` (${reason})` : ""}. O resultado mostra apenas o que foi possível capturar antes ou durante o bloqueio.`;
  }

  if (status === "timeout") {
    return `A auditoria atingiu o tempo limite. A qualidade da coleta ficou como ${quality}.`;
  }

  if (status === "failed") {
    return `A auditoria falhou antes de concluir a coleta${reason ? ` (${reason})` : ""}.`;
  }

  if (status === "partial") {
    return `A auditoria foi concluída parcialmente. A qualidade da coleta ficou como ${quality}.`;
  }

  return `A auditoria foi concluída. A qualidade da coleta ficou como ${quality}.`;
}

function modeParagraph(audit: AuditResponse): string {
  const mode = typeof audit.summary?.mode === "string" ? audit.summary.mode : "page_load";

  if (mode === "interaction") {
    return "Esta auditoria foi feita no modo Interações básicas. Nesse modo, o Sherlock tenta executar cliques seguros e observa se surgem novos eventos no dataLayer ou requests de tracking.";
  }

  return "Esta auditoria foi feita no modo Carregamento da página. Nesse modo, o Sherlock analisa o que aparece ao abrir a URL, sem testar cliques em botões ou formulários.";
}

function toolsParagraphs(audit: AuditResponse): string[] {
  const status = audit.auditStatus ?? audit.summary?.auditStatus ?? audit.status;
  const foundTools = audit.tools.filter((tool) => tool.found);
  const ids = foundTools
    .map((tool) => tool.identifier ?? tool.evidence?.identifier)
    .filter((id): id is string => Boolean(id));

  if (foundTools.length > 0) {
    const paragraphs = [
      `A auditoria encontrou sinais de tracking client-side. As ferramentas detectadas foram: ${listItems(foundTools.map((tool) => tool.name), 8)}.`,
    ];
    if (ids.length > 0) {
      paragraphs.push(`Também foram identificados IDs como ${listItems(ids, 6)}.`);
    }
    return paragraphs;
  }

  if (["blocked", "timeout", "failed"].includes(status)) {
    return ["Nenhuma ferramenta principal de tracking client-side foi capturada no trecho validado desta auditoria."];
  }

  return ["Nenhuma ferramenta principal de tracking client-side foi detectada nesta auditoria."];
}

function dataLayerParagraphs(audit: AuditResponse): string[] {
  const found = Boolean(audit.summary?.dataLayerFound);
  const dataLayerEvents = audit.events.filter((event) => event.source === "dataLayer");

  if (!found) return ["Nenhuma evidência de dataLayer foi encontrada."];

  if (dataLayerEvents.length > 0) {
    return [
      "O dataLayer foi encontrado na página.",
      `Foram encontrados eventos no dataLayer, como ${listItems(dataLayerEvents.map((event) => event.originalName), 6)}.`,
    ];
  }

  return [
    "O dataLayer foi encontrado na página.",
    "O dataLayer existe, mas a auditoria não encontrou eventos de negócio nele.",
  ];
}

function destinationFor(event: DetectedEvent): string {
  if (event.destination) return event.destination;
  if (event.source === "dataLayer") return "dataLayer";
  if (event.source === "network") return "network";
  return "unknown";
}

function eventsParagraphs(audit: AuditResponse): string[] {
  if (audit.events.length === 0) return ["Nenhum evento client-side foi detectado nesta auditoria."];

  const eventNames = audit.events.map((event) => event.originalName);
  const destinations = audit.events.map(destinationFor);
  const networkDestinations = audit.events
    .filter((event) => event.source === "network")
    .map(destinationFor);
  const paragraphs = [
    `Foram detectados eventos client-side como ${listItems(eventNames, 6)}.`,
    `Os destinos/fonte observados foram: ${listItems(destinations, 6)}.`,
  ];

  if (networkDestinations.length > 0) {
    paragraphs.push(
      `Parte dos eventos apareceu via network, com destino para ${listItems(networkDestinations, 6)}.`,
    );
  }

  return paragraphs;
}

function interactionParagraphs(audit: AuditResponse): string[] {
  const summary = audit.interactionSummary ?? audit.summary?.interactionSummary;
  const mode = typeof audit.summary?.mode === "string" ? audit.summary.mode : "page_load";

  if (!summary?.enabled || mode === "page_load") {
    return ["As interações não foram testadas neste modo de auditoria."];
  }

  const paragraphs = [
    `A auditoria encontrou ${summary.totalElementsFound} elementos interativos e testou ${summary.totalElementsTested} deles.`,
    `Dos cliques testados, ${summary.executedClicks ?? 0} foram executados e ${summary.notExecutedClicks ?? 0} não puderam ser validados.`,
  ];

  if ((summary.interactionsWithTracking ?? 0) > 0) {
    paragraphs.push(`${summary.interactionsWithTracking} clique(s) executado(s) geraram sinal de tracking visível.`);
  }

  if ((summary.executedWithoutTracking ?? 0) > 0) {
    paragraphs.push(`${summary.executedWithoutTracking} clique(s) executado(s) não geraram dataLayer event nem request de tracking visível.`);
  }

  const overlayOrTimeout = (summary.blockedByOverlay ?? 0) + (summary.timeouts ?? 0);
  if ((summary.notExecutedWithoutValidation ?? 0) > 0) {
    paragraphs.push(
      `${summary.notExecutedWithoutValidation} interação(ões) não foram validadas${overlayOrTimeout > 0 ? " por bloqueio de overlay ou timeout" : ""}.`,
    );
  }

  return paragraphs;
}

export function generateHumanSummary(audit: AuditResponse): string[] {
  return [
    statusParagraph(audit),
    modeParagraph(audit),
    ...toolsParagraphs(audit),
    ...dataLayerParagraphs(audit),
    ...eventsParagraphs(audit),
    ...interactionParagraphs(audit),
  ];
}
