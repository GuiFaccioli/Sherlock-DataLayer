import { Module } from "@nestjs/common";
import { Ga4Detector } from "./ga4.detector";
import { GoogleAdsDetector } from "./google-ads.detector";
import { GtmDetector } from "./gtm.detector";
import { LinkedinDetector } from "./linkedin.detector";
import { MetaDetector } from "./meta.detector";
import { TiktokDetector } from "./tiktok.detector";
import { TrackingDetectorService } from "./tracking-detector.service";

@Module({
  providers: [
    TrackingDetectorService,
    GtmDetector,
    Ga4Detector,
    MetaDetector,
    TiktokDetector,
    LinkedinDetector,
    GoogleAdsDetector,
  ],
  exports: [TrackingDetectorService],
})
export class DetectorsModule {}
