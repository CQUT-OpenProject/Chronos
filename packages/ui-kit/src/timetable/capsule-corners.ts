import type { CapsuleCorners } from '@chronos/core';

/** Compensated radius aligned with Tailwind `rounded-xl` + squircle compensation. */
export const CAPSULE_CORNER_RADIUS = 'calc(var(--radius-xl) * var(--squircle-compensation))';

export function capsuleCornerAttrs(corners: CapsuleCorners): { style: string } {
	const r = CAPSULE_CORNER_RADIUS;
	const shape = (on: boolean) => (on ? 'squircle' : 'square');
	const topLeft = corners.topLeft ? r : '0';
	const topRight = corners.topRight ? r : '0';
	const bottomRight = corners.bottomRight ? r : '0';
	const bottomLeft = corners.bottomLeft ? r : '0';
	const shapes = [
		shape(corners.topLeft),
		shape(corners.topRight),
		shape(corners.bottomRight),
		shape(corners.bottomLeft)
	].join(' ');

	return {
		style: [
			`border-radius:${topLeft} ${topRight} ${bottomRight} ${bottomLeft}`,
			`--corner-shape:${shapes}`,
			`corner-shape:${shapes}`
		].join(';')
	};
}
