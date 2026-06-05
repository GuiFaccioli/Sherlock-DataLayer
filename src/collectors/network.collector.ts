import { Injectable } from "@nestjs/common";
import { NetworkRequestEvidence } from "../browser/playwright.service";

export interface NetworkEventEvidence {
  originalName: string;
  normalizedName: string;
  source: "network";
  destination: string;
  parameters: Record<string, unknown>;
  rawPayload: Record<string, unknown>;
}

@Injectable()
export class NetworkCollector {
  collectAnalyticsEvents(
    requests: NetworkRequestEvidence[],
  ): NetworkEventEvidence[] {
    return requests.flatMap((request) => {
      const destination = this.destinationForUrl(request.url);
      if (!destination) return [];

      const parameters = this.parseRequestParameters(request);
      const name = this.eventNameForDestination(destination, parameters);

      return [
        {
          originalName: name,
          normalizedName: this.normalizeEventName(name),
          source: "network" as const,
          destination,
          parameters,
          rawPayload: { ...request, parameters },
        },
      ];
    });
  }

  private destinationForUrl(url: string): string | null {
    if (url.includes("google-analytics.com/g/collect")) return "GA4";
    if (url.includes("facebook.com/tr")) return "Meta";
    if (url.includes("analytics.tiktok.com")) return "TikTok";
    if (url.includes("px.ads.linkedin.com") || url.includes("snap.licdn.com"))
      return "LinkedIn";
    if (
      url.includes("googleadservices.com") ||
      url.includes("pagead/conversion")
    )
      return "Google Ads";
    return null;
  }

  private parseRequestParameters(
    request: NetworkRequestEvidence,
  ): Record<string, unknown> {
    const parameters: Record<string, unknown> = {};

    try {
      const parsed = new URL(request.url);
      parsed.searchParams.forEach((value, key) => {
        parameters[key] = value;
      });
    } catch {
      parameters.url = request.url;
    }

    if (request.postData) parameters.postData = request.postData;
    return parameters;
  }

  private eventNameForDestination(
    destination: string,
    parameters: Record<string, unknown>,
  ): string {
    if (destination === "GA4")
      return String(parameters.en || parameters._en || "page_view");
    if (destination === "Meta") return String(parameters.ev || "PageView");
    if (destination === "TikTok")
      return String(parameters.event || parameters.e || "pixel_event");
    if (destination === "LinkedIn")
      return String(parameters.conversionId ? "conversion" : "insight_event");
    if (destination === "Google Ads")
      return String(parameters.label ? "conversion" : "ads_hit");
    return "analytics_request";
  }

  private normalizeEventName(name: string): string {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  }
}
