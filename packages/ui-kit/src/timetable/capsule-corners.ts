import type { CapsuleCorners } from '@chronos/core';

/** Native radius token for timetable course capsules. */
export const CAPSULE_CORNER_RADIUS = 'var(--radius-capsule)';

export function capsuleCornerAttrs(corners: CapsuleCorners): { style: string } {
	const r = CAPSULE_CORNER_RADIUS;
	const topLeft = corners.topLeft ? r : '0';
	const topRight = corners.topRight ? r : '0';
	const bottomRight = corners.bottomRight ? r : '0';
	const bottomLeft = corners.bottomLeft ? r : '0';

	return {
		style: `border-radius:${topLeft} ${topRight} ${bottomRight} ${bottomLeft}`
	};
}
