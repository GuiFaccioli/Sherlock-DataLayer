import type { DetectedEvent } from "../types/audit";
import { yesNo } from "../utils/labels";

interface DataLayerPanelProps {
  found: boolean;
  events: DetectedEvent[];
}

export function DataLayerPanel({ found, events }: DataLayerPanelProps) {
  const dataLayerEvents = events.filter((event) => event.source === "dataLayer");

  return (
    <section className="panel list-panel" id="datalayer">
      <div className="section-title compact">
        <p className="eyebrow">3. dataLayer</p>
        <h2>Dado e evento</h2>
      </div>
      <dl className="summary-list two-cols compact-list">
        <div>
          <dt>Encontrado</dt>
          <dd>{yesNo(found)}</dd>
        </div>
        <div>
          <dt>Quantidade de eventos</dt>
          <dd>{dataLayerEvents.length}</dd>
        </div>
      </dl>
      {dataLayerEvents.length === 0 ? (
        <p className="muted">Nenhum evento vindo de dataLayer foi detectado.</p>
      ) : (
        <ul className="signal-list">
          {dataLayerEvents.map((event) => (
            <li key={event.id ?? event.originalName}>
              <span className="code-text">{event.originalName}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
