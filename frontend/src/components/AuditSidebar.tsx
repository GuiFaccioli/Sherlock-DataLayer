import type { AuditResponse } from "../types/audit";
import { modeLabel, qualityLabel, yesNo } from "../utils/labels";

interface AuditSidebarProps {
  audit: AuditResponse | null;
  isLoading?: boolean;
}

function getHostname(url?: string): string {
  try {
    return url ? new URL(url).hostname : "—";
  } catch {
    return url || "—";
  }
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function AuditSidebar({ audit, isLoading = false }: AuditSidebarProps) {
  const summary = audit?.summary;
  const interactionSummary = audit?.interactionSummary ?? summary?.interactionSummary;
  const foundTools = audit?.tools.filter((tool) => tool.found) ?? [];
  const mode = typeof summary?.mode === "string" ? summary.mode : undefined;
  const interactionEnabled = interactionSummary?.enabled === true || mode === "interaction";

  if (!audit) {
    return (
      <aside className="audit-sidebar" aria-label="Resumo e navegação da auditoria">
        <div className="sidebar-block">
          <p className="sidebar-kicker">Sherlock DataLayer</p>
          <h2>{isLoading ? "Auditando..." : "Nenhuma auditoria carregada."}</h2>
          <p className="sidebar-muted">
            Após auditar uma URL, este painel mostra status, evidências, ferramentas,
            interações e navegação rápida.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="audit-sidebar" aria-label="Resumo e navegação da auditoria">
      {isLoading ? <div className="sidebar-loading">Auditando...</div> : null}

      <div className="sidebar-block">
        <p className="sidebar-kicker">Sherlock DataLayer</p>
        <h2>Auditoria atual</h2>
        <dl className="sidebar-dl">
          <div><dt>Domínio</dt><dd>{getHostname(audit.url)}</dd></div>
          <div><dt>Modo</dt><dd>{modeLabel(mode)}</dd></div>
          <div><dt>Status</dt><dd>{audit.auditStatus ?? summary?.auditStatus ?? audit.status}</dd></div>
          <div><dt>Qualidade</dt><dd>{qualityLabel(audit.collectionQuality ?? summary?.collectionQuality)}</dd></div>
          <div><dt>Falha</dt><dd>{audit.failureReason ?? summary?.failureReason ?? "—"}</dd></div>
        </dl>
      </div>

      <div className="sidebar-block">
        <h2>Evidências</h2>
        <dl className="sidebar-dl compact">
          <div><dt>Ferramentas</dt><dd>{summary?.toolsDetected ?? foundTools.length}</dd></div>
          <div><dt>Eventos</dt><dd>{summary?.eventsDetected ?? audit.events.length}</dd></div>
          <div><dt>Problemas técnicos</dt><dd>{summary?.issuesFound ?? audit.issues.length}</dd></div>
          <div><dt>dataLayer</dt><dd>{yesNo(summary?.dataLayerFound)}</dd></div>
          <div><dt>Tracking client-side</dt><dd>{yesNo(summary?.clientSideTrackingFound)}</dd></div>
        </dl>
      </div>

      <div className="sidebar-block">
        <h2>Ferramentas encontradas</h2>
        {foundTools.length === 0 ? (
          <p className="sidebar-muted">Nenhuma ferramenta encontrada.</p>
        ) : (
          <ul className="sidebar-tool-list">
            {foundTools.map((tool) => (
              <li key={tool.id ?? tool.name}>
                <strong>{tool.name}</strong>
                <span>{tool.identifier ?? tool.evidence?.identifier ?? "—"}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="sidebar-block">
        <h2>Interações</h2>
        {!interactionEnabled ? (
          <p className="sidebar-muted">Não executado neste modo</p>
        ) : (
          <dl className="sidebar-dl compact">
            <div><dt>Encontradas</dt><dd>{interactionSummary?.totalElementsFound ?? 0}</dd></div>
            <div><dt>Testadas</dt><dd>{interactionSummary?.totalElementsTested ?? 0}</dd></div>
            <div><dt>Executadas</dt><dd>{interactionSummary?.executedClicks ?? 0}</dd></div>
            <div><dt>Não executadas</dt><dd>{interactionSummary?.notExecutedClicks ?? 0}</dd></div>
            <div><dt>Bloqueadas por overlay</dt><dd>{interactionSummary?.blockedByOverlay ?? 0}</dd></div>
            <div><dt>Timeouts</dt><dd>{interactionSummary?.timeouts ?? 0}</dd></div>
            <div><dt>Mudanças de URL</dt><dd>{interactionSummary?.navigationChanges ?? 0}</dd></div>
            <div><dt>Com tracking</dt><dd>{interactionSummary?.interactionsWithTracking ?? 0}</dd></div>
            <div><dt>Executadas sem tracking</dt><dd>{interactionSummary?.executedWithoutTracking ?? 0}</dd></div>
            <div><dt>Não validadas</dt><dd>{interactionSummary?.notExecutedWithoutValidation ?? 0}</dd></div>
          </dl>
        )}
      </div>

      <nav className="sidebar-block sidebar-nav" aria-label="Navegação do resultado">
        <h2>Navegação</h2>
        <button type="button" onClick={() => scrollToSection("summary")}>Resumo técnico</button>
        <button type="button" onClick={() => scrollToSection("tools")}>Ferramentas</button>
        <button type="button" onClick={() => scrollToSection("datalayer")}>dataLayer</button>
        <button type="button" onClick={() => scrollToSection("events")}>Eventos</button>
        <button type="button" onClick={() => scrollToSection("requests")}>Requests</button>
        <button type="button" onClick={() => scrollToSection("interactions")}>Interações</button>
        <button type="button" onClick={() => scrollToSection("issues")}>Problemas</button>
        <button type="button" onClick={() => scrollToSection("technical-json")}>JSON técnico</button>
      </nav>
    </aside>
  );
}
