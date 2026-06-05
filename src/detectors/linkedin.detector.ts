import { Injectable } from "@nestjs/common";
import { BrowserAuditEvidence } from "../browser/playwright.service";
import {
  buildNormalizedEvidence,
  haystack,
  ToolDetectionResult,
  ToolDetector,
} from "./detector.types";

@Injectable()
export class LinkedinDetector implements ToolDetector {
  private readonly patterns = [
    /snap\.licdn\.com/i,
    /px\.ads\.linkedin\.com/i,
    /\blintrk\b/i,
  ];

  detect(evidence: BrowserAuditEvidence): ToolDetectionResult {
    const text = haystack(evidence);
    const normalizedEvidence = buildNormalizedEvidence(
      evidence,
      this.patterns,
      null,
    );

    return {
      name: "LinkedIn Insight",
      type: "advertising_pixel",
      identifier: null,
      found:
        /\blintrk\b/i.test(text) || Boolean(normalizedEvidence.matchedPattern),
      evidence: normalizedEvidence,
    };
  }
}
