import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { IssueAnalyzerService } from "../analyzers/issue-analyzer.service";
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
      const browserEvidence = await this.playwright.inspectUrl(dto.url);
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
      );
      const summary = this.buildSummary(
        tools,
        events,
        issues,
        browserEvidence.dataLayer,
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
            status: "completed",
            finishedAt: new Date(),
            rawData: browserEvidence as unknown as Prisma.InputJsonValue,
            summary: summary as Prisma.InputJsonValue,
          },
        }),
      );

      await this.prisma.$transaction(transaction);

      return this.findOne(audit.id);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown audit error";
      const summary = {
        clientSideTrackingFound: false,
        dataLayerFound: false,
        toolsDetected: 0,
        eventsDetected: 0,
        issuesFound: 1,
        confidence: "low",
        note: "A auditoria valida evidências client-side. Não confirma chegada real nas plataformas sem acesso interno.",
        error: errorMessage,
      };

      await this.prisma.issue.create({
        data: {
          auditId: audit.id,
          severity: "high",
          title: "Falha ao abrir ou auditar URL",
          description:
            "O Playwright não conseguiu concluir a navegação e coleta de evidências client-side.",
          evidence: { error: errorMessage },
          businessImpact:
            "Sites fora do ar, lentos ou que bloqueiam automação impedem a validação client-side e exigem uma nova tentativa ou investigação manual.",
        },
      });

      await this.prisma.audit.update({
        where: { id: audit.id },
        data: {
          status: "failed",
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
      pageTitle: rawData?.pageTitle ?? null,
      summary: audit.summary,
      tools: audit.tools,
      events: audit.events,
      issues: audit.issues,
    };
  }

  private buildSummary(
    tools: { found: boolean }[],
    events: unknown[],
    issues: unknown[],
    dataLayer: unknown[] | null,
  ): Record<string, unknown> {
    const toolsDetected = tools.filter((tool) => tool.found).length;
    const issuesFound = issues.length;
    return {
      clientSideTrackingFound: toolsDetected > 0,
      dataLayerFound: Array.isArray(dataLayer),
      toolsDetected,
      eventsDetected: events.length,
      issuesFound,
      confidence: this.confidenceFor(toolsDetected, events.length, issuesFound),
      note: "A auditoria valida evidências client-side. Não confirma chegada real nas plataformas sem acesso interno.",
    };
  }

  private confidenceFor(
    toolsDetected: number,
    eventsDetected: number,
    issuesFound: number,
  ): "low" | "medium" | "high" {
    if (toolsDetected >= 2 && eventsDetected > 0 && issuesFound <= 1)
      return "high";
    if (toolsDetected > 0 || eventsDetected > 0) return "medium";
    return "low";
  }
}
