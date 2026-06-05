import type { DetectedEvent } from "../types/audit";

interface DataLayerPanelProps {
  found: boolean;
  events: DetectedEvent[];
}

export function DataLayerPanel({ found, events }: DataLayerPanelProps) {
  const dataLayerEvents = events.filter((event) => event.source === "dataLayer");

  return (
    <section className="panel list-panel">
      <div className="section-title compact">
        <p className="eyebrow">dataLayer</p>
        <h2>Eventos de negócio</h2>
      </div>
      <dl className="mini-dl single">
        <div>
          <dt>Encontrado</dt>
          <dd>{found ? "Sim" : "Não"}</dd>
        </div>
      </dl>
      {dataLayerEvents.length === 0 ? (
        <p className="muted">Nenhum evento vindo de dataLayer foi detectado.</p>
      ) : (
        <ul className="signal-list">
          {dataLayerEvents.map((event) => (
            <li key={event.id ?? event.originalName}>{event.originalName}</li>
          ))}
        </ul>
      )}
    </section>
  );
}
