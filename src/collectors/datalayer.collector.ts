import { Injectable } from "@nestjs/common";

export interface DataLayerEventEvidence {
  originalName: string;
  normalizedName: string;
  source: "dataLayer";
  destination: null;
  parameters: Record<string, unknown>;
  rawPayload: Record<string, unknown>;
}

@Injectable()
export class DataLayerCollector {
  collectEvents(dataLayer: unknown[] | null): DataLayerEventEvidence[] {
    if (!Array.isArray(dataLayer)) return [];

    return dataLayer
      .filter(
        (item): item is Record<string, unknown> =>
          Boolean(item) && typeof item === "object" && !Array.isArray(item),
      )
      .filter((item) => typeof item.event === "string" && item.event.length > 0)
      .map((item) => ({
        originalName: item.event as string,
        normalizedName: this.normalizeEventName(item.event as string),
        source: "dataLayer" as const,
        destination: null,
        parameters: this.extractParameters(item),
        rawPayload: item,
      }));
  }

  private extractParameters(
    item: Record<string, unknown>,
  ): Record<string, unknown> {
    const { event: _event, ...parameters } = item;
    return parameters;
  }

  private normalizeEventName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  }
}
