import { describe, expect, it } from 'vite-plus/test';
import { resolveDefaultLaunchTab, type BottomTabSlotContribution } from '../src/types/slots';

function tab(
	overrides: Partial<BottomTabSlotContribution> & Pick<BottomTabSlotContribution, 'id' | 'href'>
): BottomTabSlotContribution {
	return {
		label: overrides.id,
		...overrides
	};
}

describe('resolveDefaultLaunchTab', () => {
	it('returns undefined when no tab declares defaultLaunch', () => {
		expect(
			resolveDefaultLaunchTab([
				tab({ id: 'timetable', href: '/', order: 10 }),
				tab({ id: 'mine', href: '/mine', order: 20 })
			])
		).toBeUndefined();
	});

	it('returns the tab with defaultLaunch', () => {
		const today = tab({ id: 'today', href: '/today', order: 15, defaultLaunch: true });
		expect(
			resolveDefaultLaunchTab([
				tab({ id: 'timetable', href: '/', order: 10 }),
				today,
				tab({ id: 'mine', href: '/mine', order: 20 })
			])
		).toBe(today);
	});

	it('picks the lowest order when multiple tabs declare defaultLaunch', () => {
		const earlier = tab({ id: 'today', href: '/today', order: 15, defaultLaunch: true });
		const later = tab({ id: 'other', href: '/other', order: 25, defaultLaunch: true });
		expect(resolveDefaultLaunchTab([later, earlier])).toBe(earlier);
	});
});
