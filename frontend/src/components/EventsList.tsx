import type { DetectedEvent } from "../types/audit";

interface EventsListProps {
  events: DetectedEvent[];
}

export function EventsList({ events }: EventsListProps) {
  return (
    <section className="panel events-panel">
      <div className="section-title compact">
        <p className="eyebrow">Eventos encontrados</p>
        <h2>Sinais enviados no client-side</h2>
      </div>

      {events.length === 0 ? (
        <p className="muted">Nenhum evento detectado.</p>
      ) : (
        <div className="events-table-wrap">
          <table className="events-table">
            <thead>
              <tr>
                <th>Original</th>
                <th>Normalizado</th>
                <th>Source</th>
                <th>Destination</th>
                <th>Parameters</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id ?? `${event.source}-${event.originalName}-${event.destination}`}>
                  <td>{event.originalName}</td>
                  <td>{event.normalizedName}</td>
                  <td>{event.source}</td>
                  <td>{event.destination ?? "—"}</td>
                  <td>
                    {event.parameters ? (
                      <pre className="params-preview">{JSON.stringify(event.parameters, null, 2)}</pre>
                    ) : (
                      "—"
                    )}
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
