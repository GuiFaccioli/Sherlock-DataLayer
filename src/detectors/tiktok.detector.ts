import { Injectable } from "@nestjs/common";
import { BrowserAuditEvidence } from "../browser/playwright.service";
import {
  buildNormalizedEvidence,
  haystack,
  ToolDetectionResult,
  ToolDetector,
} from "./detector.types";

@Injectable()
export class TiktokDetector implements ToolDetector {
  private readonly patterns = [/analytics\.tiktok\.com/i, /\bttq\b/i];

  detect(evidence: BrowserAuditEvidence): ToolDetectionResult {
    const text = haystack(evidence);
    const normalizedEvidence = buildNormalizedEvidence(
      evidence,
      this.patterns,
      null,
    );

    return {
      name: "TikTok Pixel",
      type: "advertising_pixel",
      identifier: null,
      found:
        /\bttq\b/i.test(text) || Boolean(normalizedEvidence.matchedPattern),
      evidence: normalizedEvidence,
    };
  }
}
