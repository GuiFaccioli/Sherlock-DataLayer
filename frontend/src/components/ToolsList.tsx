import type { DetectedTool } from "../types/audit";

interface ToolsListProps {
  tools: DetectedTool[];
}

export function ToolsList({ tools }: ToolsListProps) {
  return (
    <section className="panel list-panel">
      <div className="section-title compact">
        <p className="eyebrow">Ferramentas detectadas</p>
        <h2>Destino e coleta</h2>
      </div>

      {tools.length === 0 ? (
        <p className="muted">Nenhuma ferramenta retornada pela auditoria.</p>
      ) : (
        <div className="stack-list">
          {tools.map((tool) => (
            <article className="tool-card" key={tool.id ?? tool.name}>
              <div className="row-between">
                <div>
                  <h3>{tool.name}</h3>
                  <p>{tool.type}</p>
                </div>
                <span className={tool.found ? "status-pill found" : "status-pill neutral"}>
                  {tool.found ? "Encontrado" : "Não encontrado"}
                </span>
              </div>

              <dl className="mini-dl">
                <div>
                  <dt>Identifier</dt>
                  <dd>{tool.identifier ?? "—"}</dd>
                </div>
                <div>
                  <dt>Evidence ID</dt>
                  <dd>{tool.evidence?.identifier ?? "—"}</dd>
                </div>
                <div>
                  <dt>Source</dt>
                  <dd>{tool.evidence?.source ?? "—"}</dd>
                </div>
                <div>
                  <dt>Matched pattern</dt>
                  <dd className="code-text">{tool.evidence?.matchedPattern ?? "—"}</dd>
                </div>
              </dl>

              {tool.evidence?.evidencePreview ? (
                <pre className="evidence-preview">{tool.evidence.evidencePreview}</pre>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
