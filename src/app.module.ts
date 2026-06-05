import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AnalyzersModule } from "./analyzers/analyzers.module";
import { AuditsModule } from "./audits/audits.module";
import { BrowserModule } from "./browser/browser.module";
import { CollectorsModule } from "./collectors/collectors.module";
import { DetectorsModule } from "./detectors/detectors.module";
import { PrismaModule } from "./prisma/prisma.module";
import { HealthController } from "./health.controller";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    BrowserModule,
    CollectorsModule,
    DetectorsModule,
    AnalyzersModule,
    AuditsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
