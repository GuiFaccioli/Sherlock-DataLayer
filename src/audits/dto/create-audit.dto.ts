import { IsUrl } from "class-validator";

export class CreateAuditDto {
  @IsUrl({ require_protocol: true, protocols: ["http", "https"] })
  url!: string;
}
