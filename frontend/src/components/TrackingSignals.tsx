import type { AuditResponse } from "../types/audit";

interface TrackingSignalsProps {
  audit: AuditResponse;
}

export function TrackingSignals({ audit }: TrackingSignalsProps) {
  const toolEvidence = audit.tools
    .filter((tool) => tool.found && tool.evidence?.evidencePreview)
    .map((tool) => tool.evidence?.evidencePreview as string);
  const interactionRequests = (audit.interactions ?? []).flatMap(
    (interaction) => interaction.trackingRequestsAfterClick,
  );
  const signals = [...new Set([...toolEvidence, ...interactionRequests])];

  return (
    <section className="panel list-panel" id="requests">
      <div className="section-title compact">
        <p className="eyebrow">5. Requests e evidências</p>
        <h2>Dado bruto capturado</h2>
      </div>
      {signals.length === 0 ? (
        <p className="muted">Nenhuma URL/request de tracking foi listada na resposta.</p>
      ) : (
        <ul className="signal-list">
          {signals.map((signal) => (
            <li className="code-text" key={signal}>{signal}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
