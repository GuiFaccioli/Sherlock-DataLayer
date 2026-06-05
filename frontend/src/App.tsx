import { useState } from "react";
import { createAudit } from "./api/auditsApi";
import { AuditForm } from "./components/AuditForm";
import { AuditStatusPanel } from "./components/AuditStatusPanel";
import { DataLayerPanel } from "./components/DataLayerPanel";
import { EventsList } from "./components/EventsList";
import { InteractionsPanel } from "./components/InteractionsPanel";
import { IssuesList } from "./components/IssuesList";
import { SummaryCards } from "./components/SummaryCards";
import { ToolsList } from "./components/ToolsList";
import { TrackingSignals } from "./components/TrackingSignals";
import type { AuditMode, AuditResponse } from "./types/audit";

function App() {
  const [audit, setAudit] = useState<AuditResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAudit(url: string, mode: AuditMode) {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createAudit(url, mode);
      setAudit(result);
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "Erro inesperado ao auditar URL.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Client-side analytics audit</p>
          <h1>Sherlock <span>DataLayer</span></h1>
          <p className="hero-subtitle">Debugger de tracking e analytics para sites</p>
        </div>
        <div className="terminal-card" aria-hidden="true">
          <span>investigate(url)</span>
          <strong>data → evento → coleta → destino</strong>
        </div>
      </section>

      <AuditForm onSubmit={handleAudit} isLoading={isLoading} />

      {error ? <div className="error-banner">{error}</div> : null}

      {!audit ? (
        <section className="empty-state">
          <h2>Cole uma URL para investigar quais sinais de analytics o site envia no client-side.</h2>
          <p>
            A auditoria abre o site em um navegador real, coleta requests, scripts e dataLayer, e resume ferramentas,
            eventos e problemas encontrados.
          </p>
        </section>
      ) : (
        <div className="results-grid">
          <SummaryCards audit={audit} />
          <AuditStatusPanel audit={audit} />
          <div className="two-column-grid">
            <ToolsList tools={audit.tools} />
            <IssuesList issues={audit.issues} />
          </div>
          <div className="two-column-grid">
            <DataLayerPanel
              found={Boolean(audit.summary?.dataLayerFound)}
              events={audit.events}
            />
            <TrackingSignals audit={audit} />
          </div>
          <InteractionsPanel audit={audit} />
          <EventsList events={audit.events} />
        </div>
      )}
    </main>
  );
}

export default App;
