import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { AuditsService } from "./audits.service";
import { CreateAuditDto } from "./dto/create-audit.dto";

@Controller("audits")
export class AuditsController {
  constructor(private readonly auditsService: AuditsService) {}

  @Post()
  create(@Body() dto: CreateAuditDto) {
    return this.auditsService.createAndRun(dto);
  }

  @Get()
  findRecent() {
    return this.auditsService.findRecent();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.auditsService.findOne(id);
  }
}
