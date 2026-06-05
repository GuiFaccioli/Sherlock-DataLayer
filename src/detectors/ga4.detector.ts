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
export class Ga4Detector implements ToolDetector {
  private readonly patterns = [
    /google-analytics\.com\/g\/collect/i,
    /gtag\/js\?id=G-/i,
    /\bG-[A-Z0-9]+\b/i,
  ];

  detect(evidence: BrowserAuditEvidence): ToolDetectionResult {
    const text = haystack(evidence);
    const identifier = firstMatch(text, /\bG-[A-Z0-9]+\b/i);
    const normalizedEvidence = buildNormalizedEvidence(
      evidence,
      this.patterns,
      identifier,
    );

    return {
      name: "Google Analytics 4",
      type: "analytics",
      identifier,
      found: Boolean(identifier) || Boolean(normalizedEvidence.matchedPattern),
      evidence: normalizedEvidence,
    };
  }
}
