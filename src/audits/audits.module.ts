import { Module } from "@nestjs/common";
import { AnalyzersModule } from "../analyzers/analyzers.module";
import { BrowserModule } from "../browser/browser.module";
import { CollectorsModule } from "../collectors/collectors.module";
import { DetectorsModule } from "../detectors/detectors.module";
import { AuditsController } from "./audits.controller";
import { AuditsService } from "./audits.service";

@Module({
  imports: [BrowserModule, CollectorsModule, DetectorsModule, AnalyzersModule],
  controllers: [AuditsController],
  providers: [AuditsService],
})
export class AuditsModule {}
