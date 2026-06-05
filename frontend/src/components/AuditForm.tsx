import { FormEvent, useState } from "react";

interface AuditFormProps {
  onSubmit: (url: string) => Promise<void>;
  isLoading: boolean;
}

export function AuditForm({ onSubmit, isLoading }: AuditFormProps) {
  const [url, setUrl] = useState("https://www.rdstation.com/");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSubmit(url.trim());
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
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Auditando..." : "Auditar"}
      </button>
    </form>
  );
}
