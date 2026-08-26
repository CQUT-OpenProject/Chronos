import { resolveActiveProfile } from '$lib/boot/profile-registry';

/** Default import.source.tab slot for the active build profile (undefined → UI falls back to first slot). */
export function getDefaultImportSlot(): string | undefined {
	return resolveActiveProfile().defaultImportSlot;
}
