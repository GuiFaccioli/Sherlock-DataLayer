export type AuditStatus = "completed" | "partial" | "blocked" | "timeout" | "failed" | string;
export type CollectionQuality = "high" | "medium" | "low" | "unknown" | string;
export type FailureReason =
  | null
  | "access_denied"
  | "bot_protection"
  | "timeout"
  | "navigation_error"
  | "ssl_error"
  | "unknown_error"
  | string;

export type AuditMode = "page_load" | "interaction";

export type InteractionExecutionStatus = "executed" | "not_executed" | "skipped" | string;
export type InteractionStatus =
  | "clicked"
  | "blocked_by_overlay"
  | "timeout"
  | "navigation_changed"
  | "tracking_detected"
  | "no_tracking_detected"
  | "skipped"
  | "failed"
  | string;

export interface InteractionResult {
  action: "click";
  selector?: string;
  elementText: string;
  elementTag: string;
  elementRole: string | null;
  executionStatus?: InteractionExecutionStatus;
  interactionStatus?: InteractionStatus;
  urlBefore: string;
  urlAfter: string;
  dataLayerEventsBefore?: number;
  dataLayerEventsAfter?: number;
  newDataLayerEvents: string[];
  trackingRequestsAfterClick: string[];
  trackingDetected: boolean;
  quality: "high" | "medium" | "low" | "unknown" | string;
  issues: string[];
}

export interface InteractionSummary {
  enabled: boolean;
  totalElementsFound: number;
  totalElementsTested: number;
  executedClicks?: number;
  notExecutedClicks?: number;
  blockedByOverlay?: number;
  timeouts?: number;
  navigationChanges?: number;
  interactionsWithTracking: number;
  executedWithoutTracking?: number;
  notExecutedWithoutValidation?: number;
  interactionsWithoutTracking?: number;
  eventsDetected: string[];
  quality: "high" | "medium" | "low" | "unknown" | string;
}

export interface AuditSummary {
  clientSideTrackingFound: boolean;
  dataLayerFound: boolean;
  toolsDetected: number;
  eventsDetected: number;
  issuesFound: number;
  confidence: "low" | "medium" | "high" | "unknown" | string;
  auditStatus?: AuditStatus;
  collectionQuality?: CollectionQuality;
  failureReason?: FailureReason;
  interpretation?: string;
  mode?: AuditMode | string;
  interactionSummary?: InteractionSummary | null;
  note: string;
  [key: string]: unknown;
}

export interface DetectorEvidence {
  identifier: string | null;
  matchedPattern: string | null;
  source: "script" | "request" | "html_content" | string | null;
  evidencePreview: string | null;
}

export interface DetectedTool {
  id?: string;
  auditId?: string;
  name: string;
  type: string;
  identifier: string | null;
  found: boolean;
  evidence?: DetectorEvidence | null;
}

export interface DetectedEvent {
  id?: string;
  auditId?: string;
  originalName: string;
  normalizedName: string;
  source: string;
  destination: string | null;
  parameters?: Record<string, unknown> | null;
  rawPayload?: Record<string, unknown> | null;
  detectedAt?: string;
}

export interface Issue {
  id?: string;
  auditId?: string;
  severity: "low" | "medium" | "high" | string;
  title: string;
  description: string;
  eventName?: string | null;
  evidence?: Record<string, unknown> | null;
  businessImpact: string;
}

export interface AuditResponse {
  auditId: string;
  url: string;
  finalUrl: string;
  status: string;
  auditStatus?: AuditStatus;
  collectionQuality?: CollectionQuality | null;
  failureReason?: FailureReason;
  pageTitle: string | null;
  summary: AuditSummary | null;
  interactions?: InteractionResult[];
  interactionSummary?: InteractionSummary | null;
  tools: DetectedTool[];
  events: DetectedEvent[];
  issues: Issue[];
}
