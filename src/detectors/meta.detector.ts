import { Injectable } from "@nestjs/common";
import { BrowserAuditEvidence } from "../browser/playwright.service";
import {
  buildNormalizedEvidence,
  haystack,
  ToolDetectionResult,
  ToolDetector,
} from "./detector.types";

@Injectable()
export class MetaDetector implements ToolDetector {
  private readonly patterns = [
    /connect\.facebook\.net/i,
    /facebook\.com\/tr/i,
    /\bfbq\b/i,
  ];

  detect(evidence: BrowserAuditEvidence): ToolDetectionResult {
    const text = haystack(evidence);
    const normalizedEvidence = buildNormalizedEvidence(
      evidence,
      this.patterns,
      null,
    );

    return {
      name: "Meta Pixel",
      type: "advertising_pixel",
      identifier: null,
      found:
        /\bfbq\b/i.test(text) || Boolean(normalizedEvidence.matchedPattern),
      evidence: normalizedEvidence,
    };
  }
}
