import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test';
import { createAppShell } from './app-shell.svelte';

const mocks = vi.hoisted(() => ({
	preferences: { timetableLayoutMode: 'compact' as 'compact' | 'fixed' },
	updatePreferences: vi.fn().mockResolvedValue(undefined),
	applyAppearance: vi.fn().mockResolvedValue(undefined)
}));

vi.mock('$lib/appearance/appearance.svelte', () => ({
	createAppearance: () => ({ apply: mocks.applyAppearance })
}));

vi.mock('$lib/appearance/apply-active-theme', () => ({ applyActiveTheme: vi.fn() }));

vi.mock('$lib/services/app-engine', () => ({
	getAppController: () => ({
		get userPreferences() {
			return mocks.preferences;
		},
		activeThemeId: 'm3-default',
		currentTimetable: null,
		timetables: [],
		updatePreferences: mocks.updatePreferences
	}),
	getAppEngine: () => ({
		events: { emit: vi.fn() },
		on: () => ({ dispose: vi.fn() }),
		themes: { getTheme: () => null }
	}),
	getSharedCoursePaletteRef: () => ({}),
	notifyCoursePaletteChanged: vi.fn(),
	resetAppToInitialState: vi.fn()
}));

vi.mock('@chronos/ui-kit', () => ({ applyReduceMotionClass: vi.fn() }));

describe('app shell timetable layout in compact landscape', () => {
	let setLandscape: (matches: boolean) => void;
	let removeLandscapeListener: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		mocks.preferences.timetableLayoutMode = 'compact';
		mocks.updatePreferences.mockClear();
		let landscapeListener: ((event: { matches: boolean }) => void) | undefined;
		removeLandscapeListener = vi.fn();
		const landscapeQuery = {
			matches: true,
			addEventListener: vi.fn((_type, listener) => {
				landscapeListener = listener;
			}),
			removeEventListener: removeLandscapeListener
		};
		setLandscape = (matches) => {
			landscapeQuery.matches = matches;
			landscapeListener?.({ matches });
		};
		vi.stubGlobal('window', {
			matchMedia: (query: string) =>
				query === '(orientation: landscape) and (max-height: 500px)'
					? landscapeQuery
					: { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
		});
	});

	afterEach(() => vi.unstubAllGlobals());

	it('uses scrolling in compact landscape and restores the saved fit mode in portrait', async () => {
		const shell = createAppShell();
		shell.init();
		expect(shell.state.compactLandscape).toBe(true);
		expect(shell.state.effectiveTimetableLayoutMode).toBe('fixed');

		await shell.setTimetableLayoutMode('compact');
		expect(mocks.updatePreferences).not.toHaveBeenCalled();
		setLandscape(false);
		expect(shell.state.effectiveTimetableLayoutMode).toBe('compact');
		expect(mocks.preferences.timetableLayoutMode).toBe('compact');

		shell.destroy();
		expect(removeLandscapeListener).toHaveBeenCalledOnce();
	});

	it('preserves a saved scrolling preference across rotation', () => {
		mocks.preferences.timetableLayoutMode = 'fixed';
		const shell = createAppShell();
		shell.init();
		expect(shell.state.effectiveTimetableLayoutMode).toBe('fixed');
		setLandscape(false);
		expect(shell.state.effectiveTimetableLayoutMode).toBe('fixed');
		shell.destroy();
	});

	it('allows fit mode when the compact-landscape query does not match at startup', () => {
		setLandscape(false);
		const shell = createAppShell();
		shell.init();
		expect(shell.state.compactLandscape).toBe(false);
		expect(shell.state.effectiveTimetableLayoutMode).toBe('compact');
		shell.destroy();
	});
});
