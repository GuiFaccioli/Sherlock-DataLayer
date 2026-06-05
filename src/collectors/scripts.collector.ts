import { Injectable } from "@nestjs/common";

@Injectable()
export class ScriptsCollector {
  findMatchingScripts(scripts: string[], patterns: RegExp[]): string[] {
    return scripts.filter((script) =>
      patterns.some((pattern) => pattern.test(script)),
    );
  }
}
