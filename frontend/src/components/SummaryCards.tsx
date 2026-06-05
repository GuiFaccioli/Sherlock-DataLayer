import type { AuditResponse } from "../types/audit";

interface SummaryCardsProps {
  audit: AuditResponse;
}

function booleanLabel(value: boolean | undefined) {
  return value ? "Sim" : "Não";
}

export function SummaryCards({ audit }: SummaryCardsProps) {
  const summary = audit.summary;

  return (
    <>
      <section className="metrics-grid" aria-label="Métricas da auditoria">
        <article className="metric-card">
          <span>Ferramentas</span>
          <strong>{summary?.toolsDetected ?? audit.tools.length}</strong>
          <small>detectadas</small>
        </article>
        <article className="metric-card">
          <span>Eventos</span>
          <strong>{summary?.eventsDetected ?? audit.events.length}</strong>
          <small>detectados</small>
        </article>
        <article className="metric-card issue-metric">
          <span>Issues</span>
          <strong>{summary?.issuesFound ?? audit.issues.length}</strong>
          <small>encontradas</small>
        </article>
      </section>

      <section className="panel summary-panel">
        <div className="section-title">
          <p className="eyebrow">Resumo da auditoria</p>
          <h2>{audit.pageTitle || "Página auditada"}</h2>
        </div>
        <dl className="summary-list">
          <div>
            <dt>Status</dt>
            <dd>{audit.status}</dd>
          </div>
          <div>
            <dt>URL final</dt>
            <dd className="breakable">{audit.finalUrl}</dd>
          </div>
          <div>
            <dt>Confiança</dt>
            <dd>{summary?.confidence ?? "n/a"}</dd>
          </div>
          <div>
            <dt>Tracking client-side</dt>
            <dd>{booleanLabel(summary?.clientSideTrackingFound)}</dd>
          </div>
          <div>
            <dt>dataLayer</dt>
            <dd>{booleanLabel(summary?.dataLayerFound)}</dd>
          </div>
          <div className="wide">
            <dt>Nota</dt>
            <dd>{summary?.note ?? "Sem nota de confiabilidade."}</dd>
          </div>
        </dl>
      </section>
    </>
  );
}
