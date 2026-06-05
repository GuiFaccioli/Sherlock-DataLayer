import { BrowserAuditEvidence } from "../browser/playwright.service";

export type DetectorEvidenceSource = "script" | "request" | "html_content";

export interface NormalizedDetectorEvidence {
  identifier: string | null;
  matchedPattern: string | null;
  source: DetectorEvidenceSource | null;
  evidencePreview: string | null;
}

export interface ToolDetectionResult {
  name: string;
  type: string;
  identifier: string | null;
  found: boolean;
  evidence: NormalizedDetectorEvidence;
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

export function buildNormalizedEvidence(
  evidence: BrowserAuditEvidence,
  patterns: RegExp[],
  identifier: string | null,
): NormalizedDetectorEvidence {
  const match = findEvidenceMatch(evidence, patterns);

  return {
    identifier,
    matchedPattern: match?.matchedPattern ?? null,
    source: match?.source ?? null,
    evidencePreview: match?.evidencePreview ?? null,
  };
}

function findEvidenceMatch(
  evidence: BrowserAuditEvidence,
  patterns: RegExp[],
): Omit<NormalizedDetectorEvidence, "identifier"> | null {
  for (const request of evidence.requests) {
    const pattern = findPattern(request.url, patterns);
    if (pattern) {
      return {
        matchedPattern: pattern.source,
        source: "request",
        evidencePreview: preview(request.url),
      };
    }
  }

  for (const script of evidence.scripts) {
    const pattern = findPattern(script, patterns);
    if (pattern) {
      return {
        matchedPattern: pattern.source,
        source: isScriptUrl(script) ? "script" : "html_content",
        evidencePreview: preview(script),
      };
    }
  }

  const dataLayerText = JSON.stringify(evidence.dataLayer ?? []);
  const pattern = findPattern(dataLayerText, patterns);
  if (pattern) {
    return {
      matchedPattern: pattern.source,
      source: "html_content",
      evidencePreview: preview(dataLayerText),
    };
  }

  return null;
}

function findPattern(text: string, patterns: RegExp[]): RegExp | null {
  return patterns.find((pattern) => pattern.test(text)) ?? null;
}

function isScriptUrl(script: string): boolean {
  return /^https?:\/\//i.test(script) || script.startsWith("//");
}

function preview(value: string, maxLength = 300): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > maxLength
    ? `${normalized.slice(0, maxLength)}…`
    : normalized;
}
