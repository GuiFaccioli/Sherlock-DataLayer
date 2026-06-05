import type { AuditResponse } from "../types/audit";
import { generateHumanSummary } from "../utils/humanSummary";

interface HumanSummaryProps {
  audit: AuditResponse;
}

export function HumanSummary({ audit }: HumanSummaryProps) {
  const paragraphs = generateHumanSummary(audit);

  return (
    <section className="panel human-summary-panel" id="human-summary">
      <div className="section-title compact">
        <p className="eyebrow">9. Resumo humano</p>
        <h2>Leitura simples do resultado</h2>
      </div>
      <div className="human-summary-content">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
