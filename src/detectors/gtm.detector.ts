import { Injectable } from "@nestjs/common";
import { BrowserAuditEvidence } from "../browser/playwright.service";
import {
  firstMatch,
  haystack,
  ToolDetectionResult,
  ToolDetector,
} from "./detector.types";

@Injectable()
export class GtmDetector implements ToolDetector {
  private readonly patterns = [
    /googletagmanager\.com\/gtm\.js/i,
    /GTM-[A-Z0-9_-]+/i,
  ];

  detect(evidence: BrowserAuditEvidence): ToolDetectionResult {
    const text = haystack(evidence);
    const matchingRequests = evidence.requests.filter((request) =>
      this.patterns.some((pattern) => pattern.test(request.url)),
    );
    const matchingScripts = evidence.scripts.filter((script) =>
      this.patterns.some((pattern) => pattern.test(script)),
    );
    const identifier = firstMatch(text, /GTM-[A-Z0-9_-]+/i);

    return {
      name: "Google Tag Manager",
      type: "tag_manager",
      identifier,
      found:
        matchingRequests.length > 0 ||
        matchingScripts.length > 0 ||
        Boolean(identifier),
      evidence: { matchingRequests, matchingScripts, identifier },
    };
  }
}
