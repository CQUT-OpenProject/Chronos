import type { IAnalyticsService } from '@chronos/core';
import { capturePostHogEvent, type AnalyticsEvent } from '$lib/client/analytics';

/**
 * WebAnalyticsProvider implements the IAnalyticsService interface for Chronos Web host.
 * It bridges custom engine and plugin telemetry events to the PostHog analytics client.
 */
export class WebAnalyticsProvider implements IAnalyticsService {
	track(event: string, properties?: Record<string, unknown>): void {
		// Convert generic Record<string, unknown> to PostHog-compatible primitive records
		const cleanedProps: Record<string, string | number | boolean> = {};
		if (properties) {
			for (const [key, val] of Object.entries(properties)) {
				if (typeof val === 'string' || typeof val === 'number' || typeof val === 'boolean') {
					cleanedProps[key] = val;
				} else if (val !== undefined && val !== null) {
					cleanedProps[key] = JSON.stringify(val);
				}
			}
		}

		capturePostHogEvent(event as AnalyticsEvent, cleanedProps);
	}
}
