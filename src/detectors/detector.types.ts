import { BrowserAuditEvidence } from "../browser/playwright.service";

export interface ToolDetectionResult {
  name: string;
  type: string;
  identifier: string | null;
  found: boolean;
  evidence: Record<string, unknown>;
}

export interface ToolDetector {
  detect(evidence: BrowserAuditEvidence): ToolDetectionResult;
}

export function haystack(evidence: BrowserAuditEvidence): string {
  return [
    ...evidence.requests.map((request) => request.url),
    ...evidence.scripts,
    JSON.stringify(evidence.dataLayer ?? []),
  ].join("\n");
}

export function firstMatch(text: string, pattern: RegExp): string | null {
  const match = text.match(pattern);
  return match?.[0] ?? null;
}
