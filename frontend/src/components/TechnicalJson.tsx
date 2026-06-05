import type { AuditResponse } from "../types/audit";

interface TechnicalJsonProps {
  audit: AuditResponse;
}

export function TechnicalJson({ audit }: TechnicalJsonProps) {
  return (
    <section className="panel technical-json-panel">
      <div className="section-title compact">
        <p className="eyebrow">9. JSON técnico</p>
        <h2>Retorno bruto da API</h2>
      </div>
      <details>
        <summary>Ver JSON completo</summary>
        <pre className="technical-json">{JSON.stringify(audit, null, 2)}</pre>
      </details>
    </section>
  );
}
