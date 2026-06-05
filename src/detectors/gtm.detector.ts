import { Injectable } from "@nestjs/common";
import { BrowserAuditEvidence } from "../browser/playwright.service";
import {
  buildNormalizedEvidence,
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
    const identifier = firstMatch(text, /GTM-[A-Z0-9_-]+/i);
    const normalizedEvidence = buildNormalizedEvidence(
      evidence,
      this.patterns,
      identifier,
    );

    return {
      name: "Google Tag Manager",
      type: "tag_manager",
      identifier,
      found: Boolean(identifier) || Boolean(normalizedEvidence.matchedPattern),
      evidence: normalizedEvidence,
    };
  }
}
