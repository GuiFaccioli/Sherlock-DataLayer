import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Browser, chromium, Page, Request } from "playwright";

export type AuditMode = "page_load" | "interaction";

export interface NetworkRequestEvidence {
  url: string;
  method: string;
  resourceType: string;
  postData?: string | null;
  timestamp: string;
}

export interface InteractionEvidence {
  action: "click";
  selector: string;
  elementText: string;
  elementTag: string;
  elementRole: string | null;
  urlBefore: string;
  urlAfter: string;
  dataLayerEventsBefore: number;
  dataLayerEventsAfter: number;
  newDataLayerEvents: string[];
  trackingRequestsAfterClick: string[];
  trackingDetected: boolean;
  quality: "high" | "medium" | "low";
  issues: string[];
}

export interface InteractionSummaryEvidence {
  enabled: boolean;
  totalElementsFound: number;
  totalElementsTested: number;
  interactionsWithTracking: number;
  interactionsWithoutTracking: number;
  eventsDetected: string[];
  quality: "high" | "medium" | "low" | "unknown";
}

export interface BrowserAuditEvidence {
  pageTitle: string;
  finalUrl: string;
  httpStatus: number | null;
  networkIdleReached: boolean;
  bodyTextPreview: string;
  requests: NetworkRequestEvidence[];
  pageLoadTrackingRequests: string[];
  interactionTrackingRequests: string[];
  scripts: string[];
  dataLayer: unknown[] | null;
  interactions: InteractionEvidence[];
  interactionSummary: InteractionSummaryEvidence;
}

interface CandidateElement {
  selector: string;
  text: string;
  tag: string;
  role: string | null;
  href: string | null;
  score: number;
}

const TRACKING_REQUEST_PATTERNS = [
  /googletagmanager\.com/i,
  /google-analytics\.com/i,
  /analytics\.google\.com/i,
  /googleadservices\.com/i,
  /doubleclick\.net/i,
  /facebook\.com\/tr/i,
  /connect\.facebook\.net/i,
  /tiktok\.com/i,
  /analytics\.tiktok\.com/i,
  /linkedin\.com/i,
  /snap\.licdn\.com/i,
  /clarity\.ms/i,
  /hotjar\.com/i,
  /segment\.io/i,
  /amplitude\.com/i,
  /mixpanel\.com/i,
];

const BUSINESS_TERMS = [
  "comprar",
  "adicionar ao carrinho",
  "add to cart",
  "fale conosco",
  "contato",
  "enviar",
  "simular",
  "cadastrar",
  "entrar",
  "login",
  "criar conta",
  "assinar",
  "contratar",
  "orçamento",
  "solicitar",
  "começar",
  "teste grátis",
  "quero saber mais",
  "ver planos",
];

const DANGEROUS_TERMS = [
  "excluir",
  "deletar",
  "remover",
  "cancelar assinatura",
  "confirmar compra",
  "finalizar compra",
  "pagar",
  "payment",
  "checkout final",
  "logout",
  "sair",
  "delete",
  "remove",
  "unsubscribe",
];

@Injectable()
export class PlaywrightService {
  constructor(private readonly config: ConfigService) {}

  async inspectUrl(
    url: string,
    mode: AuditMode = "page_load",
  ): Promise<BrowserAuditEvidence> {
    const timeout = this.config.get<number>("PLAYWRIGHT_TIMEOUT_MS") ?? 15000;
    let browser: Browser | undefined;

    try {
      browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const context = await browser.newContext({
        userAgent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 SherlockDataLayer/0.1",
      });
      const page = await context.newPage();
      page.setDefaultTimeout(timeout);
      page.setDefaultNavigationTimeout(timeout);

      const requests: NetworkRequestEvidence[] = [];
      page.on("request", (request: Request) => {
        requests.push({
          url: request.url(),
          method: request.method(),
          resourceType: request.resourceType(),
          postData: request.postData(),
          timestamp: new Date().toISOString(),
        });
      });

      const response = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout,
      });
      const networkIdleReached = await page
        .waitForLoadState("networkidle", { timeout: Math.min(timeout, 8000) })
        .then(() => true)
        .catch(() => false);

      const pageLoadRequestCount = requests.length;
      const initialDataLayer = await this.readDataLayer(page);
      const scripts = await this.readScripts(page);
      const pageTitle = await page.title().catch(() => "");
      const finalUrl = page.url();
      const httpStatus = response?.status() ?? null;
      const bodyTextPreview = await this.readBodyTextPreview(page);

      const interactionAudit =
        mode === "interaction"
          ? await this.runInteractionAudit(page, requests)
          : {
              totalElementsFound: 0,
              interactions: [] as InteractionEvidence[],
            };
      const interactions = interactionAudit.interactions;
      const interactionTrackingRequests = this.trackingRequestUrls(
        requests.slice(pageLoadRequestCount),
      );
      const finalDataLayer = await this.readDataLayer(page);

      return {
        pageTitle,
        finalUrl,
        httpStatus,
        networkIdleReached,
        bodyTextPreview,
        requests,
        pageLoadTrackingRequests: this.trackingRequestUrls(
          requests.slice(0, pageLoadRequestCount),
        ),
        interactionTrackingRequests,
        scripts,
        dataLayer: finalDataLayer ?? initialDataLayer,
        interactions,
        interactionSummary: this.buildInteractionSummary(
          mode,
          interactions,
          interactionAudit.totalElementsFound,
        ),
      };
    } finally {
      await browser?.close().catch(() => undefined);
    }
  }

  private async runInteractionAudit(
    page: Page,
    requests: NetworkRequestEvidence[],
  ): Promise<{
    totalElementsFound: number;
    interactions: InteractionEvidence[];
  }> {
    const candidates = await this.findInteractionCandidates(page);
    const interactions: InteractionEvidence[] = [];

    for (const candidate of candidates.slice(0, 5)) {
      const beforeDataLayer = await this.readDataLayer(page);
      const beforeEvents = this.dataLayerEventNames(beforeDataLayer);
      const beforeRequestCount = requests.length;
      const urlBefore = page.url();
      const issues: string[] = [];

      try {
        await page.locator(candidate.selector).first().click({ timeout: 3000 });
        await page.waitForTimeout(1000);
      } catch (error) {
        issues.push(
          `Clique não executado: ${error instanceof Error ? error.message : "erro desconhecido"}`,
        );
      }

      const afterDataLayer = await this.readDataLayer(page);
      const afterEvents = this.dataLayerEventNames(afterDataLayer);
      const newDataLayerEvents = afterEvents.slice(beforeEvents.length);
      const trackingRequestsAfterClick = this.trackingRequestUrls(
        requests.slice(beforeRequestCount),
      );
      const trackingDetected =
        newDataLayerEvents.length > 0 || trackingRequestsAfterClick.length > 0;

      if (!trackingDetected && issues.length === 0) {
        issues.push("Clique importante não gerou sinal visível de tracking");
      }

      interactions.push({
        action: "click",
        selector: candidate.selector,
        elementText: candidate.text,
        elementTag: candidate.tag,
        elementRole: candidate.role,
        urlBefore,
        urlAfter: page.url(),
        dataLayerEventsBefore: beforeEvents.length,
        dataLayerEventsAfter: afterEvents.length,
        newDataLayerEvents,
        trackingRequestsAfterClick,
        trackingDetected,
        quality:
          newDataLayerEvents.length > 0 && trackingRequestsAfterClick.length > 0
            ? "high"
            : trackingDetected
              ? "medium"
              : "low",
        issues,
      });

      if (page.url() !== urlBefore) {
        await page
          .goBack({ waitUntil: "domcontentloaded", timeout: 3000 })
          .catch(() => undefined);
        await page.waitForTimeout(500).catch(() => undefined);
      }
    }

    return { totalElementsFound: candidates.length, interactions };
  }

  private async findInteractionCandidates(
    page: Page,
  ): Promise<CandidateElement[]> {
    return page
      .evaluate(
        ({ businessTerms, dangerousTerms }) => {
          const isVisible = (element: Element) => {
            const rect = element.getBoundingClientRect();
            const style = window.getComputedStyle(element);
            return (
              rect.width > 0 &&
              rect.height > 0 &&
              style.visibility !== "hidden" &&
              style.display !== "none"
            );
          };

          const selectorFor = (element: Element) => {
            const tag = element.tagName.toLowerCase();
            const id = element.getAttribute("id");
            if (id && !/\s/.test(id)) return `#${CSS.escape(id)}`;
            const parent = element.parentElement;
            if (!parent) return tag;
            const sameTag = Array.from(parent.children).filter(
              (child) => child.tagName.toLowerCase() === tag,
            );
            return `${tag}:nth-of-type(${sameTag.indexOf(element) + 1})`;
          };

          const nodes = Array.from(
            document.querySelectorAll(
              'button,a,input[type="submit"],[role="button"]',
            ),
          );

          return nodes
            .map((element) => {
              const text = (
                element.textContent ||
                element.getAttribute("aria-label") ||
                element.getAttribute("value") ||
                ""
              )
                .replace(/\s+/g, " ")
                .trim();
              const normalized = text.toLowerCase();
              const href = element.getAttribute("href");
              const download = element.hasAttribute("download");
              const dangerous = dangerousTerms.some((term: string) =>
                normalized.includes(term),
              );
              const businessScore = businessTerms.reduce(
                (score: number, term: string) =>
                  normalized.includes(term) ? score + 10 : score,
                0,
              );
              const riskyHref =
                href?.startsWith("mailto:") ||
                href?.startsWith("tel:") ||
                href?.toLowerCase().includes(".pdf") ||
                download;
              const externalTarget =
                element.getAttribute("target") === "_blank" &&
                href &&
                !href.startsWith(window.location.origin) &&
                !href.startsWith("/");

              return {
                selector: selectorFor(element),
                text: text.slice(0, 120),
                tag: element.tagName.toLowerCase(),
                role: element.getAttribute("role"),
                href,
                score: businessScore + (text ? 1 : 0),
                visible: isVisible(element),
                unsafe: dangerous || riskyHref || externalTarget,
              };
            })
            .filter((item) => item.visible && !item.unsafe && item.text)
            .sort((a, b) => b.score - a.score)
            .slice(0, 12)
            .map(({ visible, unsafe, ...item }) => item);
        },
        { businessTerms: BUSINESS_TERMS, dangerousTerms: DANGEROUS_TERMS },
      )
      .catch(() => []);
  }

  private buildInteractionSummary(
    mode: AuditMode,
    interactions: InteractionEvidence[],
    totalElementsFound: number,
  ): InteractionSummaryEvidence {
    if (mode !== "interaction") {
      return {
        enabled: false,
        totalElementsFound: 0,
        totalElementsTested: 0,
        interactionsWithTracking: 0,
        interactionsWithoutTracking: 0,
        eventsDetected: [],
        quality: "unknown",
      };
    }

    const interactionsWithTracking = interactions.filter(
      (interaction) => interaction.trackingDetected,
    ).length;
    const eventsDetected = [
      ...new Set(interactions.flatMap((item) => item.newDataLayerEvents)),
    ];

    return {
      enabled: true,
      totalElementsFound,
      totalElementsTested: interactions.length,
      interactionsWithTracking,
      interactionsWithoutTracking:
        interactions.length - interactionsWithTracking,
      eventsDetected,
      quality:
        interactions.length === 0
          ? "unknown"
          : interactionsWithTracking === interactions.length
            ? "high"
            : interactionsWithTracking > 0
              ? "medium"
              : "low",
    };
  }

  private trackingRequestUrls(requests: NetworkRequestEvidence[]): string[] {
    return [
      ...new Set(
        requests
          .map((request) => request.url)
          .filter((url) =>
            TRACKING_REQUEST_PATTERNS.some((pattern) => pattern.test(url)),
          ),
      ),
    ];
  }

  private dataLayerEventNames(dataLayer: unknown[] | null): string[] {
    if (!Array.isArray(dataLayer)) return [];
    return dataLayer
      .filter(
        (item): item is Record<string, unknown> =>
          Boolean(item) && typeof item === "object" && !Array.isArray(item),
      )
      .map((item) => item.event)
      .filter((event): event is string => typeof event === "string");
  }

  private async readBodyTextPreview(page: Page): Promise<string> {
    return page
      .evaluate(() => document.body?.innerText?.slice(0, 2000) ?? "")
      .catch(() => "");
  }

  private async readScripts(page: Page): Promise<string[]> {
    return page
      .evaluate(() =>
        Array.from(document.scripts)
          .map((script) => script.src || script.textContent || "")
          .filter(Boolean),
      )
      .catch(() => []);
  }

  private async readDataLayer(page: Page): Promise<unknown[] | null> {
    return page
      .evaluate(() => {
        const value = (window as unknown as { dataLayer?: unknown }).dataLayer;
        return Array.isArray(value) ? JSON.parse(JSON.stringify(value)) : null;
      })
      .catch(() => null);
  }
}
