import type { AuditResponse } from "../types/audit";

interface TrackingSignalsProps {
  audit: AuditResponse;
}

export function TrackingSignals({ audit }: TrackingSignalsProps) {
  const signals = audit.tools
    .filter((tool) => tool.found)
    .map((tool) => tool.evidence?.evidencePreview || tool.identifier || tool.name)
    .filter(Boolean);

  return (
    <section className="panel list-panel">
      <div className="section-title compact">
        <p className="eyebrow">Scripts e sinais de tracking</p>
        <h2>Evidências resumidas</h2>
      </div>
      {signals.length === 0 ? (
        <p className="muted">Nenhum sinal principal de tracking foi encontrado.</p>
      ) : (
        <ul className="signal-list">
          {signals.map((signal) => (
            <li key={signal}>{signal}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
