import { IsIn, IsOptional, IsUrl } from "class-validator";
import { AuditMode } from "../../browser/playwright.service";

export class CreateAuditDto {
  @IsUrl({ require_protocol: true, protocols: ["http", "https"] })
  url!: string;

  @IsOptional()
  @IsIn(["page_load", "interaction"])
  mode?: AuditMode;
}
