import { beforeEach, describe, expect, it } from 'vite-plus/test';
import { resolveBack, resolvePopstateBack } from './back-resolver';
import {
	initNavStack,
	markDeepLinkEntry,
	popOverlay,
	pushOverlay,
	recordNavigation
} from './nav-stack';

describe('back-resolver', () => {
	beforeEach(() => {
		initNavStack('/');
	});

	it('closes the top overlay before leaving the route', () => {
		recordNavigation('/', '/about', 'link');
		pushOverlay('bottom-sheet');

		expect(resolveBack({ kind: 'shell' })).toEqual({
			type: 'close-overlay',
			overlayId: 'bottom-sheet'
		});
	});

	it('returns goto-route for a normal secondary stack', () => {
		recordNavigation('/', '/about', 'link');

		expect(resolveBack({ kind: 'shell' })).toEqual({
			type: 'goto-route',
			pathname: '/',
			shellTab: undefined
		});
	});

	it('uses fallback for deep-link entries', () => {
		initNavStack('/about');
		markDeepLinkEntry();

		expect(resolveBack({ kind: 'route', href: '/transfer/import' })).toEqual({
			type: 'fallback',
			fallback: { kind: 'route', href: '/transfer/import' }
		});
	});

	it('syncs same-url popstate when an overlay is open', () => {
		recordNavigation('/', '/about', 'link');
		pushOverlay('bottom-sheet');

		expect(resolvePopstateBack('/about', '/about', { kind: 'shell' })).toBe('sync');
	});

	it('syncs same-url popstate even when overlay frame was already popped', () => {
		recordNavigation('/', '/about', 'link');
		pushOverlay('bottom-sheet');
		popOverlay();

		expect(resolvePopstateBack('/about', '/about', { kind: 'shell' })).toBe('sync');
	});

	it('syncs popstate when browser target matches previous route', () => {
		recordNavigation('/', '/about', 'link');
		recordNavigation('/about', '/about/update', 'link');

		expect(resolvePopstateBack('/about/update', '/about', { kind: 'shell' })).toBe('sync');
	});
});
