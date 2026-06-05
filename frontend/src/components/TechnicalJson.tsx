import { useMemo, useState } from "react";
import type { AuditResponse } from "../types/audit";

interface TechnicalJsonProps {
  audit: AuditResponse;
}

type CopyStatus = "idle" | "copied" | "error";

const buttonText: Record<CopyStatus, string> = {
  idle: "Copiar JSON",
  copied: "Copiado!",
  error: "Erro ao copiar",
};

export function TechnicalJson({ audit }: TechnicalJsonProps) {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const formattedJson = useMemo(() => JSON.stringify(audit, null, 2), [audit]);

  async function handleCopyJson() {
    try {
      await navigator.clipboard.writeText(formattedJson);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("error");
    } finally {
      window.setTimeout(() => setCopyStatus("idle"), 2000);
    }
  }

  return (
    <section className="panel technical-json-panel" id="technical-json">
      <div className="section-title compact section-title-with-action">
        <div>
          <p className="eyebrow">9. JSON técnico</p>
          <h2>Retorno bruto da API</h2>
        </div>
        <button className="copy-json-button" type="button" onClick={handleCopyJson}>
          {buttonText[copyStatus]}
        </button>
      </div>
      <details>
        <summary>Ver JSON completo</summary>
        <pre className="technical-json">{formattedJson}</pre>
      </details>
    </section>
  );
}
