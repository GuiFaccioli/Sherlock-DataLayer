import type { AuditResponse } from "../types/audit";

interface AuditStatusPanelProps {
  audit: AuditResponse;
}

function statusMessage(audit: AuditResponse): string {
  const status = audit.auditStatus ?? audit.summary?.auditStatus ?? audit.status;
  const toolsDetected = audit.summary?.toolsDetected ?? audit.tools.filter((tool) => tool.found).length;

  if (["blocked", "timeout", "failed"].includes(status)) {
    return "Não dá para afirmar que o site não possui tracking. A auditoria não conseguiu validar a página com segurança.";
  }

  if (status === "completed" && toolsDetected === 0 && !audit.summary?.dataLayerFound) {
    return "A auditoria foi concluída e nenhum sinal principal de tracking foi encontrado.";
  }

  return audit.summary?.interpretation ?? "Revise a qualidade da coleta antes de tomar decisões sobre tracking.";
}

export function AuditStatusPanel({ audit }: AuditStatusPanelProps) {
  const status = audit.auditStatus ?? audit.summary?.auditStatus ?? audit.status;
  const quality = audit.collectionQuality ?? audit.summary?.collectionQuality ?? "—";
  const reason = audit.failureReason ?? audit.summary?.failureReason ?? null;

  return (
    <section className={`panel status-panel status-${status}`}>
      <div className="section-title compact">
        <p className="eyebrow">Status da auditoria</p>
        <h2>{status}</h2>
      </div>
      <dl className="summary-list three-cols">
        <div>
          <dt>Qualidade da coleta</dt>
          <dd>{quality}</dd>
        </div>
        <div>
          <dt>Motivo de falha</dt>
          <dd>{reason ?? "—"}</dd>
        </div>
        <div>
          <dt>Confiança</dt>
          <dd>{audit.summary?.confidence ?? "—"}</dd>
        </div>
      </dl>
      <div className="interpretation-box">
        <strong>Interpretação</strong>
        <p>{statusMessage(audit)}</p>
      </div>
    </section>
  );
}
