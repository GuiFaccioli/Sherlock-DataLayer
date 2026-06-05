import { BrowserAuditEvidence } from "../browser/playwright.service";

export type AuditStatus =
  | "completed"
  | "partial"
  | "blocked"
  | "timeout"
  | "failed";
export type CollectionQuality = "high" | "medium" | "low" | "unknown";
export type FailureReason =
  | null
  | "access_denied"
  | "bot_protection"
  | "timeout"
  | "navigation_error"
  | "ssl_error"
  | "unknown_error";

export interface AuditQualityClassification {
  auditStatus: AuditStatus;
  collectionQuality: CollectionQuality;
  failureReason: FailureReason;
}

export function classifySuccessfulAudit(
  evidence: BrowserAuditEvidence,
): AuditQualityClassification {
  const blockedReason = detectBlockedReason(evidence);
  if (blockedReason) {
    return {
      auditStatus: "blocked",
      collectionQuality: "low",
      failureReason: blockedReason,
    };
  }

  const hasBasicPageEvidence = Boolean(evidence.finalUrl || evidence.pageTitle);
  const hasCollectionEvidence =
    evidence.requests.length > 0 || evidence.scripts.length > 0;
  const dataLayerReadable = evidence.dataLayer !== null;

  if (
    !evidence.networkIdleReached ||
    !hasBasicPageEvidence ||
    !hasCollectionEvidence
  ) {
    return {
      auditStatus: "partial",
      collectionQuality: hasCollectionEvidence ? "medium" : "low",
      failureReason: null,
    };
  }

  return {
    auditStatus: "completed",
    collectionQuality:
      dataLayerReadable || evidence.scripts.length > 0 ? "high" : "medium",
    failureReason: null,
  };
}

export function classifyAuditError(error: unknown): AuditQualityClassification {
  const message = error instanceof Error ? error.message : String(error);
  const normalized = message.toLowerCase();

  if (normalized.includes("timeout")) {
    return {
      auditStatus: "timeout",
      collectionQuality: "unknown",
      failureReason: "timeout",
    };
  }

  if (
    normalized.includes("ssl") ||
    normalized.includes("certificate") ||
    normalized.includes("net::err_cert")
  ) {
    return {
      auditStatus: "failed",
      collectionQuality: "unknown",
      failureReason: "ssl_error",
    };
  }

  if (normalized.includes("net::") || normalized.includes("navigation")) {
    return {
      auditStatus: "failed",
      collectionQuality: "unknown",
      failureReason: "navigation_error",
    };
  }

  return {
    auditStatus: "failed",
    collectionQuality: "unknown",
    failureReason: "unknown_error",
  };
}

export function buildInterpretation(
  quality: AuditQualityClassification,
  tools: { name: string; found: boolean }[],
  interactionSummary?: unknown,
): string {
  const hasTools = tools.some((tool) => tool.found);
  const hasGtm = tools.some(
    (tool) => tool.name === "Google Tag Manager" && tool.found,
  );
  const interaction = interactionSummary as
    | {
        enabled?: boolean;
        interactionsWithTracking?: number;
        interactionsWithoutTracking?: number;
        totalElementsTested?: number;
      }
    | null
    | undefined;

  if (quality.auditStatus === "blocked") {
    return "O site bloqueou a auditoria automatizada. Não é seguro concluir que não existe tracking, porque a página analisada pode não ser a mesma que um usuário real vê.";
  }

  if (quality.auditStatus === "timeout") {
    return "A auditoria atingiu o tempo limite. O resultado é inconclusivo e deve ser tratado como baixa confiabilidade.";
  }

  if (quality.auditStatus === "failed") {
    return "A auditoria falhou antes de coletar evidências suficientes. Não dá para afirmar se o site possui ou não tracking client-side.";
  }

  if (quality.auditStatus === "partial") {
    return "A auditoria coletou alguns sinais, mas a página não foi validada com segurança total. Use o resultado como indício, não como conclusão definitiva.";
  }

  if (interaction?.enabled && (interaction.totalElementsTested ?? 0) > 0) {
    if ((interaction.interactionsWithTracking ?? 0) > 0) {
      if (hasTools && (interaction.interactionsWithoutTracking ?? 0) > 0) {
        return "O site possui tracking no carregamento da página, mas alguns cliques importantes não geraram sinais visíveis. Isso pode indicar tracking incompleto de eventos.";
      }
      return "A auditoria testou interações básicas e encontrou sinais de tracking em alguns cliques. Isso indica que parte das ações do usuário está sendo coletada.";
    }

    return "A auditoria testou interações importantes, mas não encontrou eventos ou requests de tracking após os cliques. Isso pode indicar ausência de tracking em CTAs importantes ou que a coleta ocorre de forma server-side/não visível no navegador.";
  }

  if (!hasTools) {
    return "Auditoria concluída. Nenhum sinal principal de analytics foi encontrado nesta página. Isso pode indicar ausência de tracking client-side ou uso de coleta server-side não visível pelo navegador.";
  }

  if (hasGtm) {
    return "Auditoria concluída. O site possui sinais de tracking client-side, incluindo Google Tag Manager. Isso indica que eventos e tags podem estar sendo enviados por scripts no navegador.";
  }

  return "Auditoria concluída. O site possui sinais de tracking client-side. Revise ferramentas, eventos e issues para avaliar a confiabilidade da coleta.";
}

function detectBlockedReason(
  evidence: BrowserAuditEvidence,
): Exclude<FailureReason, null> | null {
  const text = [evidence.pageTitle, evidence.finalUrl, evidence.bodyTextPreview]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();

  if (!text) return null;

  if (
    text.includes("bot protection") ||
    text.includes("cloudflare block") ||
    text.includes("akamai") ||
    text.includes("are you a human") ||
    text.includes("verify you are human")
  ) {
    return "bot_protection";
  }

  if (
    text.includes("access denied") ||
    text.includes("forbidden") ||
    text.includes("permission denied") ||
    text.includes("request blocked") ||
    /\bdenied\b/i.test(text)
  ) {
    return "access_denied";
  }

  return null;
}
