import { Injectable } from "@nestjs/common";
import { DataLayerEventEvidence } from "../collectors/datalayer.collector";
import { NetworkEventEvidence } from "../collectors/network.collector";
import { ToolDetectionResult } from "../detectors/detector.types";

export type AuditEventEvidence = DataLayerEventEvidence | NetworkEventEvidence;

export interface IssueEvidence {
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
  eventName?: string | null;
  evidence?: Record<string, unknown>;
  businessImpact: string;
}

@Injectable()
export class IssueAnalyzerService {
  analyze(
    tools: ToolDetectionResult[],
    events: AuditEventEvidence[],
    dataLayer: unknown[] | null,
  ): IssueEvidence[] {
    const issues: IssueEvidence[] = [];
    const toolFound = (name: string) =>
      tools.some((tool) => tool.name === name && tool.found);
    const dataLayerEvents = events.filter(
      (event) => event.source === "dataLayer",
    );

    if (!toolFound("Google Tag Manager")) {
      issues.push({
        severity: "medium",
        title: "GTM não detectado",
        description:
          "Nenhuma evidência client-side de Google Tag Manager foi encontrada nos scripts ou requests.",
        businessImpact:
          "Sem GTM detectado, mudanças de tags e pixels podem depender de deploys e ficar menos governáveis para marketing e analytics.",
      });
    }

    if (!toolFound("Google Analytics 4")) {
      issues.push({
        severity: "high",
        title: "GA4 não detectado",
        description:
          "Nenhuma evidência client-side de GA4 foi encontrada em requests g/collect, scripts gtag ou IDs G-.",
        businessImpact:
          "Sem GA4 detectado, o site pode não estar coletando visualizações e eventos no Google Analytics 4. Isso reduz a capacidade de analisar origem de tráfego, comportamento e conversões.",
      });
    }

    if (!Array.isArray(dataLayer)) {
      issues.push({
        severity: "medium",
        title: "dataLayer não detectado",
        description:
          "window.dataLayer não existe ou não é um array acessível no client-side.",
        businessImpact:
          "Sem dataLayer, eventos de negócio podem não estar padronizados para GTM, GA4 e pixels, reduzindo rastreabilidade e consistência entre ferramentas.",
      });
    } else if (dataLayerEvents.length === 0) {
      issues.push({
        severity: "medium",
        title: "dataLayer encontrado, mas sem eventos de negócio",
        description:
          "window.dataLayer existe, porém não foram encontrados objetos com a propriedade event.",
        businessImpact:
          "Um dataLayer sem eventos de negócio limita a capacidade de medir conversões, jornadas e métricas acionáveis além de pageviews.",
      });
    }

    for (const event of events) {
      const parameters = event.parameters ?? {};
      if (
        this.hasKey(parameters, "value") &&
        !this.hasKey(parameters, "currency")
      ) {
        issues.push({
          severity: "high",
          title: "Evento com value sem currency",
          description: `O evento ${event.originalName} envia valor monetário, mas não informa currency.`,
          eventName: event.originalName,
          evidence: { event },
          businessImpact:
            "Valores sem moeda podem quebrar relatórios de receita, ROAS e conversões, principalmente em ambientes com múltiplas moedas ou integrações de mídia.",
        });
      }

      if (
        this.isEcommerceEvent(event.originalName) &&
        !this.hasKey(parameters, "currency")
      ) {
        issues.push({
          severity: "high",
          title: "Evento de e-commerce sem currency",
          description: `O evento de e-commerce ${event.originalName} não possui currency nos parâmetros capturados.`,
          eventName: event.originalName,
          evidence: { event },
          businessImpact:
            "Eventos de e-commerce sem currency podem gerar receita inconsistente nas plataformas de analytics e mídia, afetando decisões de campanha e produto.",
        });
      }
    }

    const duplicateNames = this.findDuplicateDataLayerEvents(dataLayerEvents);
    for (const eventName of duplicateNames) {
      issues.push({
        severity: "low",
        title: "Evento duplicado aparente no dataLayer",
        description: `O evento ${eventName} apareceu mais de uma vez no dataLayer durante a auditoria.`,
        eventName,
        evidence: {
          occurrences: dataLayerEvents.filter(
            (event) => event.originalName === eventName,
          ).length,
        },
        businessImpact:
          "Eventos duplicados podem inflar conversões, funis e métricas de engajamento, levando a diagnósticos e decisões incorretas.",
      });
    }

    return issues;
  }

  private hasKey(parameters: Record<string, unknown>, key: string): boolean {
    return (
      Object.prototype.hasOwnProperty.call(parameters, key) &&
      parameters[key] !== null &&
      parameters[key] !== ""
    );
  }

  private isEcommerceEvent(name: string): boolean {
    return /purchase|add_to_cart|begin_checkout|checkout|refund|view_item/i.test(
      name,
    );
  }

  private findDuplicateDataLayerEvents(events: AuditEventEvidence[]): string[] {
    const counts = new Map<string, number>();
    for (const event of events)
      counts.set(event.originalName, (counts.get(event.originalName) ?? 0) + 1);
    return [...counts.entries()]
      .filter(([, count]) => count > 1)
      .map(([name]) => name);
  }
}
