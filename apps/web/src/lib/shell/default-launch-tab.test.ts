import { describe, expect, it, vi, beforeEach } from 'vite-plus/test';
import type { BottomTabSlotContribution } from '@chronos/core';
import type { ReactiveChronosController } from '@chronos/ui-kit';
import {
	resetDefaultLaunchTabSessionForTests,
	tryDefaultLaunchRedirect
} from './default-launch-tab';

const { gotoMock } = vi.hoisted(() => ({
	gotoMock: vi.fn(async () => {})
}));

vi.mock('$app/navigation', () => ({
	goto: gotoMock
}));

vi.mock('$app/paths', () => ({
	resolve: (path: string) => path,
	base: ''
}));

function createController(tabs: BottomTabSlotContribution[]): ReactiveChronosController {
	return {
		getSlots: vi.fn(() => tabs)
	} as unknown as ReactiveChronosController;
}

describe('tryDefaultLaunchRedirect', () => {
	beforeEach(() => {
		gotoMock.mockClear();
		resetDefaultLaunchTabSessionForTests();
	});

	it('redirects from / to the default launch tab once', async () => {
		const controller = createController([
			{ id: 'today', label: 'Today', href: '/today', order: 15, defaultLaunch: true }
		]);

		const redirected = await tryDefaultLaunchRedirect('/', controller);
		expect(redirected).toBe(true);
		expect(gotoMock).toHaveBeenCalledWith('/today', { replaceState: true });

		const again = await tryDefaultLaunchRedirect('/', controller);
		expect(again).toBe(false);
		expect(gotoMock).toHaveBeenCalledTimes(1);
	});

	it('does not redirect when pathname is not /', async () => {
		const controller = createController([
			{ id: 'today', label: 'Today', href: '/today', defaultLaunch: true }
		]);

		expect(await tryDefaultLaunchRedirect('/mine', controller)).toBe(false);
		expect(gotoMock).not.toHaveBeenCalled();
	});

	it('does not redirect when no tab declares defaultLaunch', async () => {
		const controller = createController([
			{ id: 'timetable', label: 'Timetable', href: '/', order: 10 }
		]);

		expect(await tryDefaultLaunchRedirect('/', controller)).toBe(false);
		expect(gotoMock).not.toHaveBeenCalled();
	});

	it('does not redirect to href outside tabRoutes', async () => {
		const controller = createController([
			{ id: 'custom', label: 'Custom', href: '/custom', defaultLaunch: true }
		]);

		expect(await tryDefaultLaunchRedirect('/', controller)).toBe(false);
		expect(gotoMock).not.toHaveBeenCalled();
	});
});
