import type { AuditResponse } from "../types/audit";
import { qualityLabel } from "../utils/labels";

interface AuditStatusPanelProps {
  audit: AuditResponse;
}

function evidenceSummary(audit: AuditResponse): string {
  const status = audit.auditStatus ?? audit.summary?.auditStatus ?? audit.status;
  const toolsDetected = audit.summary?.toolsDetected ?? audit.tools.filter((tool) => tool.found).length;
  const interactionSummary = audit.interactionSummary ?? audit.summary?.interactionSummary;

  if (status === "blocked") return "A auditoria foi bloqueada pelo site. Resultado de tracking não validado.";
  if (status === "timeout") return "A auditoria atingiu timeout. Resultado de tracking não validado.";
  if (status === "failed") return "A auditoria falhou durante carregamento ou coleta. Resultado de tracking não validado.";
  if (interactionSummary?.enabled && (interactionSummary.notExecutedWithoutValidation ?? 0) > 0) {
    return "Algumas interações não foram validadas porque os cliques não foram executados.";
  }
  if (status === "completed" && toolsDetected > 0) {
    return "Auditoria concluída. Foram encontradas evidências client-side de tracking no carregamento da página.";
  }
  if (status === "completed") return "Auditoria concluída. Nenhuma evidência client-side principal foi detectada.";
  return "Auditoria com coleta parcial. Evidências listadas abaixo.";
}

export function AuditStatusPanel({ audit }: AuditStatusPanelProps) {
  const status = audit.auditStatus ?? audit.summary?.auditStatus ?? audit.status;
  const quality = audit.collectionQuality ?? audit.summary?.collectionQuality ?? "—";
  const reason = audit.failureReason ?? audit.summary?.failureReason ?? null;

  return (
    <section className={`panel status-panel status-${status}`}>
      <div className="section-title compact">
        <p className="eyebrow">Resumo das evidências</p>
        <h2>{status}</h2>
      </div>
      <dl className="summary-list three-cols">
        <div><dt>Qualidade da coleta</dt><dd>{qualityLabel(quality)}</dd></div>
        <div><dt>Motivo de falha</dt><dd>{reason ?? "—"}</dd></div>
        <div><dt>Confiança</dt><dd>{qualityLabel(audit.summary?.confidence)}</dd></div>
      </dl>
      <div className="interpretation-box">
        <strong>Leitura técnica</strong>
        <p>{evidenceSummary(audit)}</p>
      </div>
    </section>
  );
}
