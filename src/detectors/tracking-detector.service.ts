import { Injectable } from "@nestjs/common";
import { BrowserAuditEvidence } from "../browser/playwright.service";
import { Ga4Detector } from "./ga4.detector";
import { GoogleAdsDetector } from "./google-ads.detector";
import { GtmDetector } from "./gtm.detector";
import { LinkedinDetector } from "./linkedin.detector";
import { MetaDetector } from "./meta.detector";
import { TiktokDetector } from "./tiktok.detector";
import { ToolDetectionResult, ToolDetector } from "./detector.types";

@Injectable()
export class TrackingDetectorService {
  private readonly detectors: ToolDetector[];

  constructor(
    gtm: GtmDetector,
    ga4: Ga4Detector,
    meta: MetaDetector,
    tiktok: TiktokDetector,
    linkedin: LinkedinDetector,
    googleAds: GoogleAdsDetector,
  ) {
    this.detectors = [gtm, ga4, meta, tiktok, linkedin, googleAds];
  }

  detectTools(evidence: BrowserAuditEvidence): ToolDetectionResult[] {
    return this.detectors.map((detector) => detector.detect(evidence));
  }
}
