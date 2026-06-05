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
export class GoogleAdsDetector implements ToolDetector {
  private readonly patterns = [
    /googleadservices\.com/i,
    /pagead\/conversion/i,
    /\bAW-[A-Z0-9]+\b/i,
  ];

  detect(evidence: BrowserAuditEvidence): ToolDetectionResult {
    const text = haystack(evidence);
    const identifier = firstMatch(text, /\bAW-[A-Z0-9]+\b/i);
    const normalizedEvidence = buildNormalizedEvidence(
      evidence,
      this.patterns,
      identifier,
    );

    return {
      name: "Google Ads",
      type: "ads",
      identifier,
      found: Boolean(identifier) || Boolean(normalizedEvidence.matchedPattern),
      evidence: normalizedEvidence,
    };
  }
}
