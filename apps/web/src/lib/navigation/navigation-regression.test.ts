import { createHistoryOverlaySync } from '@chronos/ui-kit';
import { beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import {
	configureNavigationCoordinator,
	navigateBack,
	navigateForward,
	onBeforeNavigate,
	onAfterNavigate,
	syncNavigationPage,
	openOverlayHistory,
	registerPageBackFallback,
	stageShellTabDeparture,
	getPendingTraversal
} from './nav-coordinator';
import { getNavigationSnapshot, getTopFrame, initNavStack } from './nav-stack';

/** Router-owned wrapping is deliberately opaque to the coordinator. */
function browserAdapter(initial = '/') {
	type Entry = {
		url: URL;
		wrapper: { routerIndex: number; navigationGroup: number; pageState: App.PageState };
	};
	const entries: Entry[] = [
		{
			url: new URL(initial, 'https://app'),
			wrapper: { routerIndex: 41, navigationGroup: 0, pageState: {} }
		}
	];
	let position = 0;
	let renderedHref = initial;
	let pendingDelta: number | undefined;
	let fail = false;
	const getPage = () => ({
		url: entries[position].url,
		state: entries[position].wrapper.pageState
	});
	const replaceState = (_url: string, state: App.PageState) => {
		entries[position].wrapper.pageState = state;
	};
	const pushState = (_url: string, state: App.PageState) => {
		entries.splice(position + 1);
		entries.push({
			url: getPage().url,
			wrapper: {
				routerIndex: 42 + position,
				navigationGroup: entries[position].wrapper.navigationGroup,
				pageState: state
			}
		});
		position++;
	};
	const setActiveTab = vi.fn();
	const traversals: Array<{ from: string; delta: number }> = [];
	const goto = vi.fn(async (url: string, opts?: { replaceState?: boolean }) => {
		const to = new URL(url, 'https://app');
		const traversal = getPendingTraversal();
		if (traversal) traversals.push(traversal);
		onBeforeNavigate({
			from: { url: getPage().url },
			to: { url: to },
			type: 'goto',
			willUnload: false
		} as never);
		if (fail) throw new Error('canceled');
		const entry = {
			url: to,
			wrapper: {
				routerIndex: 43 + position,
				navigationGroup: entries[position].wrapper.navigationGroup + (opts?.replaceState ? 0 : 1),
				pageState: {}
			}
		};
		if (opts?.replaceState) entries[position] = entry;
		else {
			entries.splice(position + 1);
			entries.push(entry);
			position++;
		}
		renderedHref = to.pathname + to.search + to.hash;
		onAfterNavigate();
		syncNavigationPage();
	});
	const historyGo = vi.fn((delta: number) => {
		pendingDelta = delta;
	});
	configureNavigationCoordinator({
		getPage,
		pushState,
		replaceState,
		goto,
		historyGo,
		setActiveTab
	});
	initNavStack(initial, initial !== '/');
	syncNavigationPage(true);
	function traverse(delta: number) {
		const from = getPage().url;
		const previousGroup = entries[position].wrapper.navigationGroup;
		position += delta;
		const full = previousGroup !== entries[position].wrapper.navigationGroup;
		if (full)
			onBeforeNavigate({
				from: { url: from },
				to: { url: getPage().url },
				type: 'popstate',
				delta,
				willUnload: false
			} as never);
		if (full) {
			renderedHref = getPage().url.pathname + getPage().url.search + getPage().url.hash;
			onAfterNavigate();
		}
		syncNavigationPage();
	}
	return {
		entries,
		traversals,
		get renderedHref() {
			return renderedHref;
		},
		goto,
		historyGo,
		setActiveTab,
		getPage,
		replaceState,
		traverse,
		get position() {
			return position;
		},
		set fail(value: boolean) {
			fail = value;
		},
		complete() {
			const delta = pendingDelta;
			pendingDelta = undefined;
			if (delta !== undefined) traverse(delta);
		}
	};
}
describe('navigation and overlay browser contract', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});
	it('UI back traverses once, preserves forward entries and never pushes', async () => {
		const browser = browserAdapter();
		await navigateForward('/about');
		navigateBack();
		navigateBack();
		expect(browser.historyGo.mock.calls).toEqual([[-1]]);
		expect(browser.entries).toHaveLength(2);
		browser.complete();
		expect(getTopFrame()?.href).toBe('/');
		browser.traverse(1);
		expect(getTopFrame()?.href).toBe('/about');
		expect(browser.goto).toHaveBeenCalledTimes(1);
		expect(getNavigationSnapshot().records).toHaveLength(2);
	});

	it('canceled browser back releases its request without changing the logical position', async () => {
		const browser = browserAdapter();
		await navigateForward('/about');
		const before = getNavigationSnapshot();
		navigateBack();
		let reject!: (error: Error) => void;
		const complete = new Promise<void>((_resolve, fail) => {
			reject = fail;
		});
		onBeforeNavigate({
			from: { url: browser.getPage().url },
			to: { url: new URL('https://app/') },
			type: 'popstate',
			delta: -1,
			complete,
			willUnload: false
		} as never);
		reject(new Error('canceled'));
		await Promise.resolve();
		expect(getNavigationSnapshot()).toEqual(before);
		navigateBack();
		expect(browser.historyGo).toHaveBeenCalledTimes(2);
		browser.complete();
		expect(getTopFrame()?.href).toBe('/');
	});
	it('does not use router history APIs before the completed initialization callback', () => {
		const replaceState = vi.fn();
		configureNavigationCoordinator({
			goto: vi.fn(),
			historyGo: vi.fn(),
			pushState: vi.fn(),
			replaceState,
			setActiveTab: vi.fn(),
			getPage: () => ({ url: new URL('https://app/'), state: {} })
		});
		syncNavigationPage();
		expect(replaceState).not.toHaveBeenCalled();
		onAfterNavigate();
		expect(replaceState).toHaveBeenCalledOnce();
	});

	it('defers an initially open overlay until router initialization and cancels an unmounted one', async () => {
		let state: App.PageState = {};
		const writes: App.PageState[] = [];
		configureNavigationCoordinator({
			goto: vi.fn(),
			historyGo: vi.fn(),
			setActiveTab: vi.fn(),
			getPage: () => ({ url: new URL('https://app/'), state }),
			replaceState: (_url, next) => {
				state = next;
			},
			pushState: (_url, next) => {
				state = next;
				writes.push(next);
			}
		});
		const dismiss = vi.fn();
		openOverlayHistory('initial', dismiss);
		const removed = openOverlayHistory('unmounted', vi.fn());
		removed.dispose();
		expect(writes).toHaveLength(0);
		onAfterNavigate();
		await Promise.resolve();
		expect(writes).toHaveLength(1);
		expect(getTopFrame()).toMatchObject({ kind: 'overlay', overlayId: 'initial' });
		expect(dismiss).not.toHaveBeenCalled();
	});
	it('does not commit canceled or failed navigations', async () => {
		const browser = browserAdapter();
		const before = getNavigationSnapshot();
		onBeforeNavigate({
			to: { url: new URL('https://app/about') },
			type: 'goto',
			willUnload: false
		} as never);
		expect(getNavigationSnapshot()).toEqual(before);
		browser.fail = true;
		await expect(navigateForward('/about')).rejects.toThrow('canceled');
		expect(getNavigationSnapshot()).toEqual(before);
	});
	it('keeps repeated URLs and complete query/hash during multi-step traversal', async () => {
		const browser = browserAdapter();
		await navigateForward('/about?a=1#one');
		await navigateForward('/about?a=2#two');
		await navigateForward('/about?a=1#one');
		const ids = getNavigationSnapshot().records.map((frame) => frame.id);
		expect(new Set(ids).size).toBe(4);
		browser.traverse(-2);
		expect(getTopFrame()?.href).toBe('/about?a=1#one');
		browser.traverse(2);
		expect(getNavigationSnapshot().cursor).toBe(3);
	});
	it('deep link replacement retains entry and fallback replaces only after success', async () => {
		const browser = browserAdapter('/s?payload=hello');
		await navigateForward('/transfer/import/confirm', { replace: true });
		expect(getTopFrame()).toMatchObject({ entry: 'deeplink' });
		navigateBack();
		await Promise.resolve();
		expect(browser.entries).toHaveLength(1);
		expect(browser.getPage().url.pathname).toBe('/');
		expect(browser.historyGo).not.toHaveBeenCalled();
	});
	it('old page cleanup cannot clear new page fallback', async () => {
		const browser = browserAdapter('/about');
		const remove = registerPageBackFallback({ kind: 'route', href: '/settings' });
		registerPageBackFallback({ kind: 'route', href: '/timetable' });
		remove();
		navigateBack();
		await Promise.resolve();
		expect(browser.getPage().url.pathname).toBe('/timetable');
	});
	it('restores the source shell tab', async () => {
		const browser = browserAdapter();
		stageShellTabDeparture('plugin.today');
		await navigateForward('/about');
		navigateBack();
		browser.complete();
		expect(browser.setActiveTab).toHaveBeenLastCalledWith('plugin.today');
	});
	it('nested overlays dismiss only the traversed instance and duplicate sync is harmless', () => {
		const browser = browserAdapter();
		const outer = vi.fn();
		const inner = vi.fn();
		openOverlayHistory('same-id', outer);
		openOverlayHistory('same-id', inner);
		browser.traverse(-1);
		syncNavigationPage();
		expect(inner).toHaveBeenCalledOnce();
		expect(outer).not.toHaveBeenCalled();
		browser.traverse(-1);
		expect(outer).toHaveBeenCalledOnce();
		expect(browser.historyGo).not.toHaveBeenCalled();
	});
	it('program close and dispose are idempotent; forward skips closed overlays', () => {
		const browser = browserAdapter();
		const dismiss = vi.fn();
		const handle = openOverlayHistory('sheet', dismiss);
		handle.close();
		handle.close();
		handle.dispose();
		expect(browser.historyGo.mock.calls).toEqual([[-1]]);
		browser.complete();
		browser.traverse(1);
		expect(browser.historyGo).toHaveBeenLastCalledWith(-1);
		browser.complete();
		expect(browser.position).toBe(0);
		expect(dismiss).toHaveBeenCalledOnce();
	});
	it('parent disposal invalidates children and consumes the entire nested history', () => {
		const browser = browserAdapter();
		const outer = vi.fn();
		const inner = vi.fn();
		const port = { openOverlay: openOverlayHistory };
		const parent = createHistoryOverlaySync({ overlayId: 'parent', setOpen: outer, port });
		const child = createHistoryOverlaySync({ overlayId: 'child', setOpen: inner, port, parent });
		parent.syncOpenState(true);
		child.syncOpenState(true);
		parent.dispose();
		expect(browser.historyGo).toHaveBeenLastCalledWith(-2);
		browser.complete();
		expect(outer).toHaveBeenCalledOnce();
		expect(inner).toHaveBeenCalledOnce();
		expect(browser.position).toBe(0);
	});

	it('disposing a non-parent overlay leaves an independent top instance open', () => {
		const browser = browserAdapter();
		const first = vi.fn();
		const second = vi.fn();
		const handle = openOverlayHistory('first', first);
		openOverlayHistory('second', second);
		handle.dispose();
		expect(first).toHaveBeenCalledOnce();
		expect(second).not.toHaveBeenCalled();
		expect(browser.historyGo).not.toHaveBeenCalled();
		navigateBack();
		browser.complete();
		expect(second).toHaveBeenCalledOnce();
		expect(browser.position).toBe(0);
	});
	it('an overlay route replaces the overlay, without inheriting its underlying deep-link entry', async () => {
		const browser = browserAdapter('/about');
		openOverlayHistory('sheet', vi.fn());
		await navigateForward('/about/install');
		expect(getTopFrame()).toMatchObject({ entry: 'normal' });
		navigateBack();
		expect(browser.historyGo).toHaveBeenLastCalledWith(-1);
		browser.complete();
		expect(getTopFrame()?.href).toBe('/about');
		expect(browser.renderedHref).toBe('/about');
		expect(browser.traversals.at(-1)).toEqual({ from: '/about/install', delta: -1 });
	});
	it('overlay route navigation replaces its entry and forward skips earlier tombstones', async () => {
		const browser = browserAdapter();
		const dismiss = vi.fn();
		openOverlayHistory('parent', dismiss);
		openOverlayHistory('child', vi.fn());
		await navigateForward('/about');
		expect(browser.entries).toHaveLength(3);
		expect(dismiss).toHaveBeenCalledOnce();
		navigateBack();
		expect(browser.historyGo).toHaveBeenLastCalledWith(-2);
		browser.complete();
		browser.traverse(1);
		expect(browser.historyGo).toHaveBeenLastCalledWith(1);
		browser.complete();
		expect(getTopFrame()?.href).toBe('/about');
		expect(browser.renderedHref).toBe('/about');
	});
	it('public state survives shallow writes without copying the router wrapper', () => {
		const browser = browserAdapter();
		browser.replaceState('', { ...browser.getPage().state, other: 'preserved' } as App.PageState);
		openOverlayHistory('sheet', vi.fn());
		expect(browser.getPage().state).toHaveProperty('other', 'preserved');
		expect(browser.getPage().state).not.toHaveProperty('routerIndex');
	});
});
