import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { IssueAnalyzerService } from "../analyzers/issue-analyzer.service";
import {
  AuditQualityClassification,
  buildInterpretation,
  classifyAuditError,
  classifySuccessfulAudit,
} from "./audit-quality";
import { PlaywrightService } from "../browser/playwright.service";
import { DataLayerCollector } from "../collectors/datalayer.collector";
import { NetworkCollector } from "../collectors/network.collector";
import { TrackingDetectorService } from "../detectors/tracking-detector.service";
import { PrismaService } from "../prisma/prisma.service";
import { CreateAuditDto } from "./dto/create-audit.dto";

@Injectable()
export class AuditsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly playwright: PlaywrightService,
    private readonly dataLayerCollector: DataLayerCollector,
    private readonly networkCollector: NetworkCollector,
    private readonly trackingDetector: TrackingDetectorService,
    private readonly issueAnalyzer: IssueAnalyzerService,
  ) {}

  async createAndRun(dto: CreateAuditDto) {
    const audit = await this.prisma.audit.create({
      data: { url: dto.url, status: "running", startedAt: new Date() },
    });

    try {
      const mode = dto.mode ?? "page_load";
      const browserEvidence = await this.playwright.inspectUrl(dto.url, mode);
      const quality = classifySuccessfulAudit(browserEvidence);
      const tools = this.trackingDetector.detectTools(browserEvidence);
      const dataLayerEvents = this.dataLayerCollector.collectEvents(
        browserEvidence.dataLayer,
      );
      const networkEvents = this.networkCollector.collectAnalyticsEvents(
        browserEvidence.requests,
      );
      const events = [...dataLayerEvents, ...networkEvents];
      const issues = this.issueAnalyzer.analyze(
        tools,
        events,
        browserEvidence.dataLayer,
        quality,
        browserEvidence.interactionSummary,
      );
      const summary = this.buildSummary(
        tools,
        events,
        issues,
        browserEvidence.dataLayer,
        quality,
        mode,
        browserEvidence.interactionSummary,
      );

      const transaction: Prisma.PrismaPromise<unknown>[] = [
        this.prisma.detectedTool.createMany({
          data: tools.map((tool) => ({
            auditId: audit.id,
            name: tool.name,
            type: tool.type,
            identifier: tool.identifier,
            found: tool.found,
            evidence: tool.evidence as unknown as Prisma.InputJsonValue,
          })),
        }),
      ];

      if (events.length > 0) {
        transaction.push(
          this.prisma.detectedEvent.createMany({
            data: events.map((event) => ({
              auditId: audit.id,
              originalName: event.originalName,
              normalizedName: event.normalizedName,
              source: event.source,
              destination: event.destination,
              parameters: event.parameters as Prisma.InputJsonValue,
              rawPayload: event.rawPayload as Prisma.InputJsonValue,
              detectedAt: new Date(),
            })),
          }),
        );
      }

      if (issues.length > 0) {
        transaction.push(
          this.prisma.issue.createMany({
            data: issues.map((issue) => ({
              auditId: audit.id,
              severity: issue.severity,
              title: issue.title,
              description: issue.description,
              eventName: issue.eventName,
              evidence: (issue.evidence ?? {}) as Prisma.InputJsonValue,
              businessImpact: issue.businessImpact,
            })),
          }),
        );
      }

      transaction.push(
        this.prisma.audit.update({
          where: { id: audit.id },
          data: {
            status: quality.auditStatus,
            auditStatus: quality.auditStatus,
            collectionQuality: quality.collectionQuality,
            failureReason: quality.failureReason,
            finishedAt: new Date(),
            rawData: browserEvidence as unknown as Prisma.InputJsonValue,
            summary: summary as Prisma.InputJsonValue,
            interactions:
              browserEvidence.interactions as unknown as Prisma.InputJsonValue,
            interactionSummary:
              browserEvidence.interactionSummary as unknown as Prisma.InputJsonValue,
          },
        }),
      );

      await this.prisma.$transaction(transaction);

      return this.findOne(audit.id);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown audit error";
      const quality = classifyAuditError(error);
      const failureIssue = this.failureIssueFor(quality, errorMessage);
      const summary = {
        clientSideTrackingFound: false,
        dataLayerFound: false,
        toolsDetected: 0,
        eventsDetected: 0,
        issuesFound: 1,
        confidence: "unknown",
        auditStatus: quality.auditStatus,
        collectionQuality: quality.collectionQuality,
        failureReason: quality.failureReason,
        mode: dto.mode ?? "page_load",
        interactionSummary: null,
        interpretation: buildInterpretation(quality, [], null),
        note: "A auditoria valida evidências client-side. Não confirma chegada real nas plataformas sem acesso interno.",
        error: errorMessage,
      };

      await this.prisma.issue.create({
        data: {
          auditId: audit.id,
          severity: failureIssue.severity,
          title: failureIssue.title,
          description: failureIssue.description,
          evidence: failureIssue.evidence as Prisma.InputJsonValue,
          businessImpact: failureIssue.businessImpact,
        },
      });

      await this.prisma.audit.update({
        where: { id: audit.id },
        data: {
          status: quality.auditStatus,
          auditStatus: quality.auditStatus,
          collectionQuality: quality.collectionQuality,
          failureReason: quality.failureReason,
          finishedAt: new Date(),
          rawData: { error: errorMessage },
          summary,
        },
      });

      return this.findOne(audit.id);
    }
  }

  async findRecent() {
    return this.prisma.audit.findMany({
      orderBy: { startedAt: "desc" },
      take: 20,
      select: {
        id: true,
        url: true,
        status: true,
        auditStatus: true,
        collectionQuality: true,
        failureReason: true,
        startedAt: true,
        finishedAt: true,
        summary: true,
      },
    });
  }

  async findOne(id: string) {
    const audit = await this.prisma.audit.findUnique({
      where: { id },
      include: { tools: true, events: true, issues: true },
    });
    if (!audit) throw new NotFoundException(`Audit ${id} not found`);

    const rawData = audit.rawData as {
      finalUrl?: string;
      pageTitle?: string;
    } | null;
    return {
      auditId: audit.id,
      url: audit.url,
      finalUrl: rawData?.finalUrl ?? audit.url,
      status: audit.status,
      auditStatus: audit.auditStatus ?? audit.status,
      collectionQuality: audit.collectionQuality ?? null,
      failureReason: audit.failureReason ?? null,
      pageTitle: rawData?.pageTitle ?? null,
      summary: audit.summary,
      interactions: audit.interactions ?? [],
      interactionSummary: audit.interactionSummary ?? null,
      tools: audit.tools,
      events: audit.events,
      issues: audit.issues,
    };
  }

  private buildSummary(
    tools: { name: string; found: boolean }[],
    events: unknown[],
    issues: unknown[],
    dataLayer: unknown[] | null,
    quality: AuditQualityClassification,
    mode: string,
    interactionSummary: unknown,
  ): Record<string, unknown> {
    const toolsDetected = tools.filter((tool) => tool.found).length;
    const issuesFound = issues.length;
    return {
      clientSideTrackingFound: toolsDetected > 0,
      dataLayerFound: Array.isArray(dataLayer),
      toolsDetected,
      eventsDetected: events.length,
      issuesFound,
      confidence: this.confidenceFor(
        toolsDetected,
        events.length,
        issuesFound,
        quality,
      ),
      auditStatus: quality.auditStatus,
      collectionQuality: quality.collectionQuality,
      failureReason: quality.failureReason,
      mode,
      interactionSummary,
      interpretation: buildInterpretation(quality, tools, interactionSummary),
      note: "A auditoria valida evidências client-side. Não confirma chegada real nas plataformas sem acesso interno.",
    };
  }

  private confidenceFor(
    toolsDetected: number,
    eventsDetected: number,
    issuesFound: number,
    quality: AuditQualityClassification,
  ): "low" | "medium" | "high" | "unknown" {
    if (["blocked", "failed", "timeout"].includes(quality.auditStatus)) {
      return quality.auditStatus === "blocked" ? "low" : "unknown";
    }
    if (quality.auditStatus === "partial") return "medium";
    if (toolsDetected >= 2 && eventsDetected > 0 && issuesFound <= 1)
      return "high";
    if (toolsDetected > 0 || eventsDetected > 0) return "medium";
    return "low";
  }

  private failureIssueFor(
    quality: AuditQualityClassification,
    errorMessage: string,
  ): {
    severity: "high";
    title: string;
    description: string;
    evidence: Record<string, unknown>;
    businessImpact: string;
  } {
    if (quality.auditStatus === "timeout") {
      return {
        severity: "high",
        title: "Timeout ao carregar a página",
        description:
          "A auditoria atingiu o tempo limite antes de concluir a coleta.",
        evidence: { error: errorMessage, failureReason: quality.failureReason },
        businessImpact:
          "O resultado é inconclusivo e deve ser tratado como baixa confiabilidade.",
      };
    }

    return {
      severity: "high",
      title: "Erro de navegação",
      description:
        "O Playwright não conseguiu concluir a navegação e coleta de evidências client-side.",
      evidence: { error: errorMessage, failureReason: quality.failureReason },
      businessImpact:
        "Sites fora do ar, lentos, com erro de SSL ou que bloqueiam automação impedem a validação client-side e exigem uma nova tentativa ou investigação manual.",
    };
  }
}
