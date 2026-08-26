import type { ImportTabSlotContribution } from '@chronos/core';

export interface DeepLinkImport {
	tab: ImportTabSlotContribution;
	inputs: Record<string, unknown>;
}

/**
 * Generic deep-link handshake: finds the first import tab whose contribution
 * claims the given location via its `deepLink` metadata. The host never needs
 * to know any concrete slot id or input shape.
 */
export function resolveDeepLinkImport(
	tabs: readonly ImportTabSlotContribution[],
	location: Pick<Location, 'hash' | 'search'>
): DeepLinkImport | null {
	for (const tab of tabs) {
		const inputs = tab.deepLink?.fromLocation(location) ?? null;
		if (inputs) return { tab, inputs };
	}
	return null;
}
