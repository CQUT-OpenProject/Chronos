import type { ChronosProfile } from '@chronos/core';
import { CHRONOS_PROFILES } from '$lib/profile-codegen/profile-definitions';

declare const __CHRONOS_PROFILE__: string;

/** Every profile known to the host (single runtime source of truth). */
export const registeredProfiles: readonly ChronosProfile[] = Object.values(CHRONOS_PROFILES);

export function resolveActiveProfile(): ChronosProfile {
	const profileId =
		typeof __CHRONOS_PROFILE__ !== 'undefined' ? __CHRONOS_PROFILE__ : 'chronos-cqut';
	return CHRONOS_PROFILES[profileId] ?? CHRONOS_PROFILES['chronos-default']!;
}
