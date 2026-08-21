import { resolveActiveProfile } from '$lib/boot/profile-registry';

/** Default import.source.tab slot for the active build profile. */
export function getDefaultImportSlot(): string {
	return resolveActiveProfile().defaultImportSlot ?? 'share-link';
}

/** Whether the active profile enables the cqut-online import slot. */
export function profileIncludesOnlineImport(): boolean {
	const profile = resolveActiveProfile();
	const cqutPlugin = profile.plugins.find(
		(entry) => entry.id === 'source-cqut' && entry.enabled !== false
	);
	if (!cqutPlugin) return false;
	return !cqutPlugin.disabledSlots?.includes('cqut-online');
}
