import { resolveActiveProfile } from '$lib/boot/profile-registry';

/** Default import.source.tab slot for the active build profile. */
export function getDefaultImportSlot(): string {
	return resolveActiveProfile().defaultImportSlot ?? 'share-link';
}
