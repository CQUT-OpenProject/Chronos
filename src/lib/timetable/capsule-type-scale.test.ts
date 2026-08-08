import { describe, expect, it } from 'vite-plus/test';
import {
	resolveCapsuleTypeScale,
	resolveLocationBlockMetrics,
	shouldShowLocationCampus
} from './capsule-type-scale';

describe('resolveCapsuleTypeScale', () => {
	it('uses the wide-column tier at effective >= 110', () => {
		const scale = resolveCapsuleTypeScale(110);
		expect(scale.titlePx).toBe(17);
		expect(scale.detailPx).toBe(12);
		expect(scale.badgePx).toBe(12);
	});

	it('uses the narrow-column tier near 70px', () => {
		const scale = resolveCapsuleTypeScale(70);
		expect(scale.titlePx).toBe(14);
		expect(scale.detailPx).toBe(10);
		expect(scale.badgePx).toBe(9);
	});

	it('interpolates between anchors', () => {
		const scale = resolveCapsuleTypeScale(85);
		expect(scale.titlePx).toBe(15);
		expect(scale.detailPx).toBe(11);
		expect(scale.badgePx).toBe(10);
	});

	it('clamps below the lowest anchor', () => {
		const scale = resolveCapsuleTypeScale(40);
		expect(scale.titlePx).toBe(12);
		expect(scale.detailPx).toBe(8);
		expect(scale.badgePx).toBe(8);
		expect(scale.placeholderPx).toBe(11);
	});

	it('shrinks when overlap splits the column', () => {
		const single = resolveCapsuleTypeScale(140, 1);
		const overlapped = resolveCapsuleTypeScale(140, 2);
		expect(overlapped.titlePx).toBeLessThan(single.titlePx);
		expect(overlapped.detailPx).toBeLessThanOrEqual(single.detailPx);
	});

	it('wide 7-column layout outsizes a narrow 5-column layout', () => {
		// Desktop ~770px body / 7 cols ≈ 110px; phone ~320px / 5 ≈ 64px
		const wideSeven = resolveCapsuleTypeScale(770 / 7, 1);
		const narrowFive = resolveCapsuleTypeScale(320 / 5, 1);
		expect(wideSeven.titlePx).toBeGreaterThan(narrowFive.titlePx);
		expect(wideSeven.detailPx).toBeGreaterThan(narrowFive.detailPx);
	});

	it('hides campus below the 70px threshold', () => {
		expect(shouldShowLocationCampus(70, 1)).toBe(true);
		expect(shouldShowLocationCampus(69, 1)).toBe(false);
		// Overlap halves effective width: 120/2 = 60 → hide
		expect(shouldShowLocationCampus(120, 2)).toBe(false);
	});

	it('keeps a 3-line location slot and bumps font when campus is hidden', () => {
		const withCampus = resolveLocationBlockMetrics(10, true, 3);
		const withoutCampus = resolveLocationBlockMetrics(10, false, 2);
		expect(withoutCampus.heightPx).toBe(withCampus.heightPx);
		expect(withoutCampus.fontPx).toBeGreaterThan(withCampus.fontPx);
	});
});
