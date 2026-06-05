import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Browser, chromium, Page, Request } from "playwright";

export interface NetworkRequestEvidence {
  url: string;
  method: string;
  resourceType: string;
  postData?: string | null;
  timestamp: string;
}

export interface BrowserAuditEvidence {
  pageTitle: string;
  finalUrl: string;
  httpStatus: number | null;
  networkIdleReached: boolean;
  bodyTextPreview: string;
  requests: NetworkRequestEvidence[];
  scripts: string[];
  dataLayer: unknown[] | null;
}

@Injectable()
export class PlaywrightService {
  constructor(private readonly config: ConfigService) {}

  async inspectUrl(url: string): Promise<BrowserAuditEvidence> {
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

      return {
        pageTitle: await page.title().catch(() => ""),
        finalUrl: page.url(),
        httpStatus: response?.status() ?? null,
        networkIdleReached,
        bodyTextPreview: await this.readBodyTextPreview(page),
        requests,
        scripts: await this.readScripts(page),
        dataLayer: await this.readDataLayer(page),
      };
    } finally {
      await browser?.close().catch(() => undefined);
    }
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
