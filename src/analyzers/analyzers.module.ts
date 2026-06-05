import { Module } from "@nestjs/common";
import { IssueAnalyzerService } from "./issue-analyzer.service";

@Module({ providers: [IssueAnalyzerService], exports: [IssueAnalyzerService] })
export class AnalyzersModule {}
