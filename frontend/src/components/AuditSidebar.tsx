import type { AuditResponse } from "../types/audit";
import { modeLabel, qualityLabel, yesNo } from "../utils/labels";

interface AuditSidebarProps {
  audit: AuditResponse | null;
}

function shortUrl(url: string | undefined): string {
  if (!url) return "—";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export function AuditSidebar({ audit }: AuditSidebarProps) {
  const summary = audit?.summary;
  const interactionSummary = audit?.interactionSummary ?? summary?.interactionSummary;
  const trackingFound = Boolean(summary?.clientSideTrackingFound);

  return (
    <aside className="audit-sidebar" aria-label="Resumo e navegação da auditoria">
      <div className="sidebar-block">
        <p className="sidebar-kicker">Painel lateral</p>
        <h2>Auditoria atual</h2>
        <dl className="sidebar-dl">
          <div><dt>URL</dt><dd>{shortUrl(audit?.url)}</dd></div>
          <div><dt>Modo</dt><dd>{modeLabel(typeof summary?.mode === "string" ? summary.mode : undefined)}</dd></div>
          <div><dt>Status</dt><dd>{audit?.auditStatus ?? summary?.auditStatus ?? audit?.status ?? "—"}</dd></div>
          <div><dt>Qualidade</dt><dd>{qualityLabel(audit?.collectionQuality ?? summary?.collectionQuality)}</dd></div>
        </dl>
      </div>

      <div className="sidebar-block">
        <h2>Evidências</h2>
        <dl className="sidebar-dl compact">
          <div><dt>Ferramentas</dt><dd>{summary?.toolsDetected ?? audit?.tools.filter((tool) => tool.found).length ?? "—"}</dd></div>
          <div><dt>Eventos</dt><dd>{summary?.eventsDetected ?? audit?.events.length ?? "—"}</dd></div>
          <div><dt>Problemas</dt><dd>{summary?.issuesFound ?? audit?.issues.length ?? "—"}</dd></div>
          <div><dt>dataLayer</dt><dd>{audit ? yesNo(summary?.dataLayerFound) : "—"}</dd></div>
          <div><dt>Tracking</dt><dd>{audit ? yesNo(trackingFound) : "—"}</dd></div>
        </dl>
      </div>

      <div className="sidebar-block">
        <h2>Interações</h2>
        <dl className="sidebar-dl compact">
          <div><dt>Testadas</dt><dd>{interactionSummary?.totalElementsTested ?? "—"}</dd></div>
          <div><dt>Executadas</dt><dd>{interactionSummary?.executedClicks ?? "—"}</dd></div>
          <div><dt>Não validadas</dt><dd>{interactionSummary?.notExecutedWithoutValidation ?? "—"}</dd></div>
        </dl>
      </div>

      <nav className="sidebar-block sidebar-nav" aria-label="Navegação do resultado">
        <h2>Navegação</h2>
        <a href="#resumo-tecnico">Resumo técnico</a>
        <a href="#ferramentas">Ferramentas</a>
        <a href="#datalayer">dataLayer</a>
        <a href="#eventos">Eventos</a>
        <a href="#requests">Requests</a>
        <a href="#interacoes">Interações</a>
        <a href="#problemas">Problemas</a>
        <a href="#json-tecnico">JSON</a>
      </nav>
    </aside>
  );
}
