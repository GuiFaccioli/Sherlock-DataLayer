import type { AuditResponse } from "../types/audit";

interface InteractionsPanelProps {
  audit: AuditResponse;
}

export function InteractionsPanel({ audit }: InteractionsPanelProps) {
  const summary = audit.interactionSummary ?? audit.summary?.interactionSummary;
  const interactions = audit.interactions ?? [];

  if (!summary?.enabled) return null;

  return (
    <>
      <section className="panel summary-panel">
        <div className="section-title compact">
          <p className="eyebrow">Interações testadas</p>
          <h2>Cliques seguros e sinais visíveis</h2>
        </div>
        <dl className="summary-list three-cols">
          <div>
            <dt>Total encontradas</dt>
            <dd>{summary.totalElementsFound}</dd>
          </div>
          <div>
            <dt>Total testadas</dt>
            <dd>{summary.totalElementsTested}</dd>
          </div>
          <div>
            <dt>Com tracking</dt>
            <dd>{summary.interactionsWithTracking}</dd>
          </div>
          <div>
            <dt>Sem tracking</dt>
            <dd>{summary.interactionsWithoutTracking}</dd>
          </div>
          <div>
            <dt>Qualidade</dt>
            <dd>{summary.quality}</dd>
          </div>
          <div>
            <dt>Eventos</dt>
            <dd>{summary.eventsDetected.join(", ") || "—"}</dd>
          </div>
        </dl>
      </section>

      <section className="panel events-panel">
        <div className="section-title compact">
          <p className="eyebrow">Detalhe das interações</p>
          <h2>O que aconteceu após cada clique</h2>
        </div>
        {interactions.length === 0 ? (
          <p className="muted">Nenhuma interação segura foi testada.</p>
        ) : (
          <div className="stack-list">
            {interactions.map((interaction, index) => (
              <article className="tool-card" key={`${interaction.elementText}-${index}`}>
                <div className="row-between">
                  <div>
                    <h3>{interaction.elementText}</h3>
                    <p>
                      {interaction.elementTag}
                      {interaction.elementRole ? ` · role=${interaction.elementRole}` : ""}
                    </p>
                  </div>
                  <span
                    className={
                      interaction.trackingDetected
                        ? "status-pill found"
                        : "status-pill neutral"
                    }
                  >
                    Tracking: {interaction.trackingDetected ? "sim" : "não"}
                  </span>
                </div>
                <dl className="mini-dl">
                  <div>
                    <dt>Qualidade</dt>
                    <dd>{interaction.quality}</dd>
                  </div>
                  <div>
                    <dt>Eventos</dt>
                    <dd>{interaction.newDataLayerEvents.join(", ") || "—"}</dd>
                  </div>
                  <div>
                    <dt>Requests tracking</dt>
                    <dd>{interaction.trackingRequestsAfterClick.length}</dd>
                  </div>
                  <div>
                    <dt>URL mudou</dt>
                    <dd>{interaction.urlBefore === interaction.urlAfter ? "Não" : "Sim"}</dd>
                  </div>
                </dl>
                {interaction.issues.length > 0 ? (
                  <ul className="signal-list warning-list">
                    {interaction.issues.map((issue) => (
                      <li key={issue}>{issue}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
