import { Injectable } from "@nestjs/common";
import { BrowserAuditEvidence } from "../browser/playwright.service";
import { haystack, ToolDetectionResult, ToolDetector } from "./detector.types";

@Injectable()
export class TiktokDetector implements ToolDetector {
  private readonly patterns = [/analytics\.tiktok\.com/i, /\bttq\b/i];

  detect(evidence: BrowserAuditEvidence): ToolDetectionResult {
    const text = haystack(evidence);
    const matchingRequests = evidence.requests.filter((request) =>
      this.patterns.some((pattern) => pattern.test(request.url)),
    );
    const matchingScripts = evidence.scripts.filter((script) =>
      this.patterns.some((pattern) => pattern.test(script)),
    );

    return {
      name: "TikTok Pixel",
      type: "advertising_pixel",
      identifier: null,
      found:
        matchingRequests.length > 0 ||
        matchingScripts.length > 0 ||
        /\bttq\b/i.test(text),
      evidence: {
        matchingRequests,
        matchingScripts,
        globalFunction: /\bttq\b/i.test(text),
      },
    };
  }
}
