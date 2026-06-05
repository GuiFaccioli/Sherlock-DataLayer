import type { AuditResponse, InteractionResult } from "../types/audit";
import { executionLabel, interactionStatusLabel, trackingLabel } from "../utils/labels";

interface InteractionsPanelProps {
  audit: AuditResponse;
}

function wasExecuted(interaction: InteractionResult): boolean {
  return interaction.executionStatus !== "not_executed" && interaction.executionStatus !== "skipped";
}

export function InteractionsPanel({ audit }: InteractionsPanelProps) {
  const summary = audit.interactionSummary ?? audit.summary?.interactionSummary;
  const interactions = audit.interactions ?? [];

  if (!summary?.enabled) return null;

  return (
    <>
      <section className="panel summary-panel" id="interacoes">
        <div className="section-title compact">
          <p className="eyebrow">6. Interações testadas</p>
          <h2>Execução, validação e tracking</h2>
        </div>
        <dl className="summary-list three-cols">
          <div><dt>Total encontradas</dt><dd>{summary.totalElementsFound}</dd></div>
          <div><dt>Total testadas</dt><dd>{summary.totalElementsTested}</dd></div>
          <div><dt>Cliques executados</dt><dd>{summary.executedClicks ?? 0}</dd></div>
          <div><dt>Não executados</dt><dd>{summary.notExecutedClicks ?? 0}</dd></div>
          <div><dt>Bloqueados por overlay</dt><dd>{summary.blockedByOverlay ?? 0}</dd></div>
          <div><dt>Timeouts</dt><dd>{summary.timeouts ?? 0}</dd></div>
          <div><dt>Mudanças de URL</dt><dd>{summary.navigationChanges ?? 0}</dd></div>
          <div><dt>Com tracking</dt><dd>{summary.interactionsWithTracking}</dd></div>
          <div><dt>Executados sem tracking</dt><dd>{summary.executedWithoutTracking ?? summary.interactionsWithoutTracking ?? 0}</dd></div>
          <div><dt>Não validados</dt><dd>{summary.notExecutedWithoutValidation ?? 0}</dd></div>
          <div><dt>Qualidade</dt><dd>{summary.quality}</dd></div>
          <div><dt>Eventos</dt><dd>{summary.eventsDetected.join(", ") || "—"}</dd></div>
        </dl>
      </section>

      <section className="panel events-panel">
        <div className="section-title compact">
          <p className="eyebrow">7. Detalhe das interações</p>
          <h2>Elemento, execução e sinais após clique</h2>
        </div>
        {interactions.length === 0 ? (
          <p className="muted">Nenhuma interação segura foi testada.</p>
        ) : (
          <div className="stack-list">
            {interactions.map((interaction, index) => {
              const executed = wasExecuted(interaction);
              return (
                <article className="tool-card" key={`${interaction.elementText}-${index}`}>
                  <div className="row-between">
                    <div>
                      <h3>{interaction.elementText}</h3>
                      <p>Tipo: {interaction.elementTag}</p>
                    </div>
                    <span className={interaction.trackingDetected ? "status-pill found" : "status-pill neutral"}>
                      Tracking: {trackingLabel(executed, interaction.trackingDetected)}
                    </span>
                  </div>
                  <dl className="mini-dl">
                    <div><dt>Execução</dt><dd>{executionLabel(interaction.executionStatus)}</dd></div>
                    <div><dt>Status</dt><dd>{interactionStatusLabel(interaction.interactionStatus)}</dd></div>
                    <div><dt>Qualidade</dt><dd>{interaction.quality}</dd></div>
                    <div><dt>URL mudou</dt><dd>{interaction.urlBefore === interaction.urlAfter ? "não" : "sim"}</dd></div>
                    <div><dt>Novos eventos dataLayer</dt><dd>{interaction.newDataLayerEvents.join(", ") || "—"}</dd></div>
                    <div><dt>Requests após clique</dt><dd>{executed ? interaction.trackingRequestsAfterClick.length : "—"}</dd></div>
                  </dl>
                  {interaction.urlBefore !== interaction.urlAfter ? (
                    <dl className="mini-dl single">
                      <div><dt>URL antes/depois</dt><dd className="breakable code-text">{interaction.urlBefore} → {interaction.urlAfter}</dd></div>
                    </dl>
                  ) : null}
                  {interaction.trackingRequestsAfterClick.length > 0 ? (
                    <ul className="signal-list">
                      {interaction.trackingRequestsAfterClick.map((request) => (
                        <li className="code-text" key={request}>{request}</li>
                      ))}
                    </ul>
                  ) : null}
                  {interaction.issues.length > 0 ? (
                    <ul className="signal-list warning-list">
                      {interaction.issues.map((issue) => <li key={issue}>{issue}</li>)}
                    </ul>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
