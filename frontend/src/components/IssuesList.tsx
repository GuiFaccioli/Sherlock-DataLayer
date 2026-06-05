import type { Issue } from "../types/audit";

interface IssuesListProps {
  issues: Issue[];
}

function categoryFor(issue: Issue): string {
  const text = `${issue.title} ${issue.description}`.toLowerCase();
  if (text.includes("clique") || text.includes("intera") || text.includes("overlay") || text.includes("timeout")) {
    return "interação";
  }
  if (text.includes("gtm") || text.includes("ga4") || text.includes("datalayer") || text.includes("tracking")) {
    return "tracking";
  }
  if (text.includes("bloque") || text.includes("navega") || text.includes("ssl")) {
    return "carregamento";
  }
  return "qualidade";
}

export function IssuesList({ issues }: IssuesListProps) {
  return (
    <section className="panel list-panel" id="issues">
      <div className="section-title compact">
        <p className="eyebrow">8. Problemas técnicos encontrados</p>
        <h2>Categoria, severidade e evidência</h2>
      </div>

      {issues.length === 0 ? (
        <p className="muted">Nenhuma issue encontrada nesta auditoria.</p>
      ) : (
        <div className="stack-list">
          {issues.map((issue) => (
            <article className="issue-card" key={issue.id ?? `${issue.severity}-${issue.title}`}>
              <dl className="mini-dl">
                <div><dt>Categoria</dt><dd>{categoryFor(issue)}</dd></div>
                <div><dt>Severidade</dt><dd><span className={`severity ${issue.severity.toLowerCase()}`}>{issue.severity}</span></dd></div>
                <div className="wide"><dt>Item</dt><dd>{issue.title}</dd></div>
                <div className="wide"><dt>Evidência</dt><dd>{issue.description}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
