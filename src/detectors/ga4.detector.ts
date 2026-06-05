import { Injectable } from "@nestjs/common";
import { BrowserAuditEvidence } from "../browser/playwright.service";
import {
  firstMatch,
  haystack,
  ToolDetectionResult,
  ToolDetector,
} from "./detector.types";

@Injectable()
export class Ga4Detector implements ToolDetector {
  private readonly patterns = [
    /google-analytics\.com\/g\/collect/i,
    /gtag\/js\?id=G-/i,
    /\bG-[A-Z0-9]+\b/i,
  ];

  detect(evidence: BrowserAuditEvidence): ToolDetectionResult {
    const text = haystack(evidence);
    const matchingRequests = evidence.requests.filter((request) =>
      this.patterns.some((pattern) => pattern.test(request.url)),
    );
    const matchingScripts = evidence.scripts.filter((script) =>
      this.patterns.some((pattern) => pattern.test(script)),
    );
    const identifier = firstMatch(text, /\bG-[A-Z0-9]+\b/i);

    return {
      name: "Google Analytics 4",
      type: "analytics",
      identifier,
      found:
        matchingRequests.length > 0 ||
        matchingScripts.length > 0 ||
        Boolean(identifier),
      evidence: { matchingRequests, matchingScripts, identifier },
    };
  }
}
