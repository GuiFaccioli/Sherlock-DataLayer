import type { AuditResponse } from "../types/audit";
import { modeLabel, qualityLabel, yesNo } from "../utils/labels";

interface SummaryCardsProps {
  audit: AuditResponse;
}

export function SummaryCards({ audit }: SummaryCardsProps) {
  const summary = audit.summary;
  const auditStatus = audit.auditStatus ?? summary?.auditStatus ?? audit.status;
  const mode = summary?.mode;

  return (
    <>
      <header className="results-header">
        <span>Resultado da auditoria</span>
      </header>

      <section className="panel summary-panel" id="summary">
        <div className="section-title compact">
          <p className="eyebrow">1. Resumo técnico</p>
          <h2>{audit.url}</h2>
        </div>
        <dl className="summary-list technical-summary">
          <div>
            <dt>URL auditada</dt>
            <dd className="breakable">{audit.url}</dd>
          </div>
          <div>
            <dt>URL final</dt>
            <dd className="breakable">{audit.finalUrl}</dd>
          </div>
          <div>
            <dt>Título da página</dt>
            <dd>{audit.pageTitle || "—"}</dd>
          </div>
          <div>
            <dt>Modo da auditoria</dt>
            <dd>{modeLabel(typeof mode === "string" ? mode : undefined)}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{auditStatus}</dd>
          </div>
          <div>
            <dt>Qualidade da coleta</dt>
            <dd>{qualityLabel(audit.collectionQuality ?? summary?.collectionQuality)}</dd>
          </div>
          <div>
            <dt>Motivo de falha</dt>
            <dd>{audit.failureReason ?? summary?.failureReason ?? "—"}</dd>
          </div>
          <div>
            <dt>Tracking client-side encontrado</dt>
            <dd>{yesNo(summary?.clientSideTrackingFound)}</dd>
          </div>
          <div>
            <dt>dataLayer encontrado</dt>
            <dd>{yesNo(summary?.dataLayerFound)}</dd>
          </div>
          <div>
            <dt>Ferramentas detectadas</dt>
            <dd>{summary?.toolsDetected ?? audit.tools.filter((tool) => tool.found).length}</dd>
          </div>
          <div>
            <dt>Eventos detectados</dt>
            <dd>{summary?.eventsDetected ?? audit.events.length}</dd>
          </div>
          <div>
            <dt>Issues</dt>
            <dd>{summary?.issuesFound ?? audit.issues.length}</dd>
          </div>
        </dl>
      </section>
    </>
  );
}
