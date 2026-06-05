import type { AuditResponse } from "../types/audit";

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
  // Vite replaces env at build time; keep a clear runtime hint for local setups.
  console.warn("VITE_API_URL is not configured. Create frontend/.env from .env.example.");
}

export async function createAudit(url: string): Promise<AuditResponse> {
  const response = await fetch(`${API_URL}/audits`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message = payload?.message
      ? Array.isArray(payload.message)
        ? payload.message.join(", ")
        : payload.message
      : "Falha ao criar auditoria.";
    throw new Error(message);
  }

  return payload as AuditResponse;
}
