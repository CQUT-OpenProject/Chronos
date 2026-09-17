import { CHRONOS_PROFILES } from '$lib/profile-codegen/profile-definitions';

declare const __CHRONOS_PROFILE__: string;

export function resolveActiveProfile() {
	const profileId =
		typeof __CHRONOS_PROFILE__ !== 'undefined' ? __CHRONOS_PROFILE__ : 'chronos-cqut';
	return CHRONOS_PROFILES[profileId] ?? CHRONOS_PROFILES['chronos-default']!;
}
