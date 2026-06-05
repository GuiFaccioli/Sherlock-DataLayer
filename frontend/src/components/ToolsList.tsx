import type { DetectedTool } from "../types/audit";

interface ToolsListProps {
  tools: DetectedTool[];
}

export function ToolsList({ tools }: ToolsListProps) {
  return (
    <section className="panel list-panel">
      <div className="section-title compact">
        <p className="eyebrow">2. Ferramentas detectadas</p>
        <h2>Coleta e destino</h2>
      </div>

      {tools.length === 0 ? (
        <p className="muted">Nenhuma ferramenta retornada pela auditoria.</p>
      ) : (
        <div className="events-table-wrap">
          <table className="events-table evidence-table">
            <thead>
              <tr>
                <th>Ferramenta</th>
                <th>Tipo</th>
                <th>Status</th>
                <th>ID encontrado</th>
                <th>Origem</th>
                <th>Padrão</th>
                <th>URL/request relacionado</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((tool) => (
                <tr key={tool.id ?? tool.name}>
                  <td>{tool.name}</td>
                  <td>{tool.type}</td>
                  <td>
                    <span className={tool.found ? "status-pill found" : "status-pill neutral"}>
                      {tool.found ? "Encontrado" : "Não encontrado"}
                    </span>
                  </td>
                  <td className="code-text">{tool.identifier ?? tool.evidence?.identifier ?? "—"}</td>
                  <td>{tool.evidence?.source ?? "—"}</td>
                  <td className="code-text">{tool.evidence?.matchedPattern ?? "—"}</td>
                  <td className="breakable code-text">{tool.evidence?.evidencePreview ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
