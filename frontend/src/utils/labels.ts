export function yesNo(value: boolean | null | undefined): string {
  return value ? "sim" : "não";
}

export function qualityLabel(value: string | null | undefined): string {
  const labels: Record<string, string> = {
    high: "Alta",
    medium: "Média",
    low: "Baixa",
    unknown: "Não validada",
  };
  return value ? labels[value] ?? value : "—";
}

export function modeLabel(value: string | null | undefined): string {
  const labels: Record<string, string> = {
    page_load: "Carregamento da página",
    interaction: "Interações básicas",
  };
  return value ? labels[value] ?? value : "—";
}

export function executionLabel(value: string | null | undefined): string {
  const labels: Record<string, string> = {
    executed: "Executado",
    not_executed: "Não executado",
    skipped: "Ignorado",
  };
  return value ? labels[value] ?? value : "—";
}

export function interactionStatusLabel(value: string | null | undefined): string {
  const labels: Record<string, string> = {
    tracking_detected: "Tracking detectado",
    no_tracking_detected: "Sem tracking detectado",
    blocked_by_overlay: "Bloqueado por overlay",
    timeout: "Timeout",
    navigation_changed: "URL mudou",
    failed: "Falhou",
    clicked: "Clique executado",
    skipped: "Ignorado",
  };
  return value ? labels[value] ?? value : "—";
}

export function trackingLabel(executed: boolean, detected: boolean): string {
  if (!executed) return "não validado";
  return detected ? "detectado" : "não detectado";
}
