import type { Issue } from "../types/audit";

interface IssuesListProps {
  issues: Issue[];
}

export function IssuesList({ issues }: IssuesListProps) {
  return (
    <section className="panel list-panel">
      <div className="section-title compact">
        <p className="eyebrow">Problemas encontrados</p>
        <h2>Confiabilidade</h2>
      </div>

      {issues.length === 0 ? (
        <p className="muted">Nenhuma issue encontrada nesta auditoria.</p>
      ) : (
        <div className="stack-list">
          {issues.map((issue) => (
            <article className="issue-card" key={issue.id ?? `${issue.severity}-${issue.title}`}>
              <span className={`severity ${issue.severity.toLowerCase()}`}>{issue.severity}</span>
              <h3>{issue.title}</h3>
              <p>{issue.description}</p>
              <div className="impact-box">
                <strong>Impacto</strong>
                <span>{issue.businessImpact}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
