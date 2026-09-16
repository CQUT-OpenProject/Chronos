import { DEFAULT_MINE_SECTION_ID } from '@chronos/core';

/** Host-owned bucket for `mine.item` whose `sectionId` has no `mine.section`. */
export const MINE_FALLBACK_SECTION_ID = 'extensions';

export function resolveMineSectionId(
	sectionId: string | undefined,
	registeredSectionIds: ReadonlySet<string>
): string {
	const target = sectionId ?? DEFAULT_MINE_SECTION_ID;
	return registeredSectionIds.has(target) ? target : MINE_FALLBACK_SECTION_ID;
}
