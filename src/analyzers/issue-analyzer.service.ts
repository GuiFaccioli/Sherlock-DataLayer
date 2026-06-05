import { Injectable } from "@nestjs/common";
import { AuditQualityClassification } from "../audits/audit-quality";
import { InteractionSummaryEvidence } from "../browser/playwright.service";
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
    quality: AuditQualityClassification,
    interactionSummary?: InteractionSummaryEvidence | null,
  ): IssueEvidence[] {
    const issues: IssueEvidence[] = [];
    const toolFound = (name: string) =>
      tools.some((tool) => tool.name === name && tool.found);
    const dataLayerEvents = events.filter(
      (event) => event.source === "dataLayer",
    );
    const canEvaluateAbsence =
      quality.auditStatus === "completed" || quality.auditStatus === "partial";

    issues.push(...this.qualityIssues(quality));
    issues.push(...this.interactionIssues(interactionSummary));

    if (canEvaluateAbsence) {
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

  private qualityIssues(quality: AuditQualityClassification): IssueEvidence[] {
    if (quality.auditStatus === "blocked") {
      return [
        {
          severity: "high",
          title: "Site bloqueou a auditoria automatizada",
          description:
            "A página retornou sinais de bloqueio, como Access Denied, Forbidden, proteção anti-bot ou request blocked.",
          evidence: { failureReason: quality.failureReason },
          businessImpact:
            "Não dá para afirmar que o site não possui tracking. A auditoria não conseguiu validar a página com segurança.",
        },
        {
          severity: "high",
          title:
            "Auditoria incompleta: não foi possível validar tracking com segurança",
          description:
            "O conteúdo analisado pode ser uma página de bloqueio, e não a experiência real de um usuário.",
          evidence: { auditStatus: quality.auditStatus },
          businessImpact:
            "Decisões sobre ausência de analytics não devem ser tomadas com base em uma auditoria bloqueada.",
        },
      ];
    }

    if (quality.auditStatus === "timeout") {
      return [
        {
          severity: "high",
          title: "Timeout ao carregar a página",
          description:
            "A auditoria atingiu o tempo limite antes de concluir a coleta.",
          evidence: { failureReason: quality.failureReason },
          businessImpact:
            "O resultado é inconclusivo e deve ser tratado como baixa confiabilidade.",
        },
      ];
    }

    if (quality.auditStatus === "failed") {
      return [
        {
          severity: "high",
          title: "Erro de navegação",
          description:
            "A auditoria falhou antes de coletar evidências suficientes.",
          evidence: { failureReason: quality.failureReason },
          businessImpact:
            "Não dá para afirmar se o site possui ou não tracking client-side sem uma nova tentativa ou investigação manual.",
        },
      ];
    }

    if (quality.auditStatus === "partial") {
      return [
        {
          severity: "medium",
          title:
            "Auditoria incompleta: não foi possível validar tracking com segurança",
          description:
            "A página carregou parcialmente ou não atingiu estado estável de rede durante a coleta.",
          evidence: { auditStatus: quality.auditStatus },
          businessImpact:
            "Use o resultado como indício, não como conclusão definitiva sobre a qualidade do tracking.",
        },
      ];
    }

    return [];
  }

  private interactionIssues(
    interactionSummary?: InteractionSummaryEvidence | null,
  ): IssueEvidence[] {
    if (!interactionSummary?.enabled) return [];

    if (interactionSummary.totalElementsTested === 0) {
      return [
        {
          severity: "low",
          title: "Nenhum elemento interativo relevante testado",
          description:
            "A auditoria de interação não encontrou botões ou links seguros/relevantes para clicar.",
          evidence: { interactionSummary },
          businessImpact:
            "A ausência de teste de interação limita a validação de eventos de clique e CTAs.",
        },
      ];
    }

    if (interactionSummary.interactionsWithoutTracking > 0) {
      return [
        {
          severity:
            interactionSummary.interactionsWithTracking > 0 ? "medium" : "high",
          title: "Cliques importantes sem sinal visível de tracking",
          description:
            "Uma ou mais interações testadas não geraram dataLayer event nem request de tracking visível no navegador.",
          evidence: { interactionSummary },
          businessImpact:
            "CTAs sem eventos visíveis podem reduzir a confiabilidade de métricas de conversão, funil e performance de campanhas.",
        },
      ];
    }

    return [];
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
