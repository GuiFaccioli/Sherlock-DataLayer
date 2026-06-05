import type { DetectedEvent } from "../types/audit";
import { yesNo } from "../utils/labels";

interface EventsListProps {
  events: DetectedEvent[];
}

function sourceRequest(event: DetectedEvent): string {
  const rawUrl = event.rawPayload?.url;
  if (typeof rawUrl === "string") return rawUrl;
  const paramsUrl = event.parameters?.url;
  return typeof paramsUrl === "string" ? paramsUrl : "—";
}

export function EventsList({ events }: EventsListProps) {
  return (
    <section className="panel events-panel">
      <div className="section-title compact">
        <p className="eyebrow">4. Eventos detectados</p>
        <h2>Evento, coleta e destino</h2>
      </div>

      {events.length === 0 ? (
        <p className="muted">Nenhum evento detectado.</p>
      ) : (
        <div className="events-table-wrap">
          <table className="events-table">
            <thead>
              <tr>
                <th>Evento original</th>
                <th>Evento normalizado</th>
                <th>Fonte</th>
                <th>Destino</th>
                <th>Possui parâmetros?</th>
                <th>Detalhe</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id ?? `${event.source}-${event.originalName}-${event.destination}`}>
                  <td>{event.originalName}</td>
                  <td>{event.normalizedName}</td>
                  <td>{event.source}</td>
                  <td>{event.destination ?? "—"}</td>
                  <td>{yesNo(Boolean(event.parameters && Object.keys(event.parameters).length > 0))}</td>
                  <td>
                    <details>
                      <summary>Ver</summary>
                      <dl className="detail-dl">
                        <div>
                          <dt>Request/URL de origem</dt>
                          <dd className="breakable code-text">{sourceRequest(event)}</dd>
                        </div>
                        <div>
                          <dt>Destination</dt>
                          <dd>{event.destination ?? "—"}</dd>
                        </div>
                        <div>
                          <dt>Source</dt>
                          <dd>{event.source}</dd>
                        </div>
                        <div>
                          <dt>Evento original</dt>
                          <dd>{event.originalName}</dd>
                        </div>
                        <div>
                          <dt>Evento normalizado</dt>
                          <dd>{event.normalizedName}</dd>
                        </div>
                      </dl>
                      <pre className="params-preview full-width">
                        {JSON.stringify(event.parameters ?? {}, null, 2)}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
