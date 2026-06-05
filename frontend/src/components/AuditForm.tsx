import { FormEvent, useState } from "react";
import type { AuditMode } from "../types/audit";

interface AuditFormProps {
  onSubmit: (url: string, mode: AuditMode) => Promise<void>;
  isLoading: boolean;
}

export function AuditForm({ onSubmit, isLoading }: AuditFormProps) {
  const [url, setUrl] = useState("https://www.rdstation.com/");
  const [mode, setMode] = useState<AuditMode>("page_load");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(url.trim(), mode);
  }

  return (
    <form className="audit-form" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="audit-url">
        URL para auditar
      </label>
      <input
        id="audit-url"
        type="url"
        placeholder="https://www.exemplo.com.br"
        value={url}
        onChange={(event) => setUrl(event.target.value)}
        required
      />

      <fieldset className="mode-selector">
        <legend>Tipo de auditoria</legend>
        <label>
          <input
            type="radio"
            name="audit-mode"
            value="page_load"
            checked={mode === "page_load"}
            onChange={() => setMode("page_load")}
          />
          Carregamento da página
        </label>
        <label>
          <input
            type="radio"
            name="audit-mode"
            value="interaction"
            checked={mode === "interaction"}
            onChange={() => setMode("interaction")}
          />
          Interações básicas
        </label>
      </fieldset>

      <button type="submit" disabled={isLoading}>
        {isLoading ? "Auditando..." : "Auditar"}
      </button>
    </form>
  );
}
