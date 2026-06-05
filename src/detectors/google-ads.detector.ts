import { Injectable } from "@nestjs/common";
import { BrowserAuditEvidence } from "../browser/playwright.service";
import {
  firstMatch,
  haystack,
  ToolDetectionResult,
  ToolDetector,
} from "./detector.types";

@Injectable()
export class GoogleAdsDetector implements ToolDetector {
  private readonly patterns = [
    /googleadservices\.com/i,
    /pagead\/conversion/i,
    /\bAW-[A-Z0-9]+\b/i,
  ];

  detect(evidence: BrowserAuditEvidence): ToolDetectionResult {
    const text = haystack(evidence);
    const matchingRequests = evidence.requests.filter((request) =>
      this.patterns.some((pattern) => pattern.test(request.url)),
    );
    const matchingScripts = evidence.scripts.filter((script) =>
      this.patterns.some((pattern) => pattern.test(script)),
    );
    const identifier = firstMatch(text, /\bAW-[A-Z0-9]+\b/i);

    return {
      name: "Google Ads",
      type: "ads",
      identifier,
      found:
        matchingRequests.length > 0 ||
        matchingScripts.length > 0 ||
        Boolean(identifier),
      evidence: { matchingRequests, matchingScripts, identifier },
    };
  }
}
