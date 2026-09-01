import { describe, expect, it } from 'vite-plus/test';
import {
	resolveDefaultLaunchTab,
	resolveHostPanelTab,
	type BottomTabSlotContribution
} from '../src/types/slots';

function tab(
	overrides: Partial<BottomTabSlotContribution> & Pick<BottomTabSlotContribution, 'id'>
): BottomTabSlotContribution {
	return {
		label: overrides.id,
		...overrides
	};
}

describe('resolveHostPanelTab', () => {
	it('returns the tab that declares the requested host panel', () => {
		const timetable = tab({ id: 'timetable', order: 10, hostPanel: 'timetable' });
		const mine = tab({ id: 'mine', order: 20, hostPanel: 'mine' });
		expect(resolveHostPanelTab([timetable, mine], 'timetable')).toBe(timetable);
		expect(resolveHostPanelTab([timetable, mine], 'mine')).toBe(mine);
	});

	it('returns undefined when no tab declares the panel', () => {
		expect(resolveHostPanelTab([tab({ id: 'today', order: 15 })], 'timetable')).toBeUndefined();
	});
});

describe('resolveDefaultLaunchTab', () => {
	it('returns undefined when no tab declares defaultLaunch', () => {
		expect(
			resolveDefaultLaunchTab([tab({ id: 'timetable', order: 10 }), tab({ id: 'mine', order: 20 })])
		).toBeUndefined();
	});

	it('returns the first tab with defaultLaunch in registry order', () => {
		const today = tab({ id: 'today', order: 15, defaultLaunch: true });
		expect(
			resolveDefaultLaunchTab([
				tab({ id: 'timetable', order: 10 }),
				today,
				tab({ id: 'mine', order: 20 })
			])
		).toBe(today);
	});

	it('returns the first defaultLaunch tab when multiple declare it', () => {
		const earlier = tab({ id: 'today', order: 15, defaultLaunch: true });
		const later = tab({ id: 'other', order: 25, defaultLaunch: true });
		expect(resolveDefaultLaunchTab([earlier, later])).toBe(earlier);
		expect(resolveDefaultLaunchTab([later, earlier])).toBe(later);
	});
});
