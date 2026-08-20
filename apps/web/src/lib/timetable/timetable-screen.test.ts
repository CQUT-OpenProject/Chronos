import { describe, expect, it } from 'vite-plus/test';
import { getTimetableScreen } from './timetable-screen.svelte';
import { createTimetable, createCourse } from '@chronos/core';
import type { AppShellController } from '$lib/app/app-shell.svelte';

describe('TimetableScreenController', () => {
	const sampleTimetable = createTimetable({
		id: 'tt-test',
		name: '测试课表',
		academicConfig: {
			termStartDate: '2026-03-02',
			startWeek: 1,
			endWeek: 20,
			periodTimes: [
				{ index: 1, startTime: '08:00', endTime: '08:45' },
				{ index: 2, startTime: '08:55', endTime: '09:40' }
			]
		},
		viewPrefs: {
			showSaturday: false,
			showSunday: false,
			showNonCurrentWeekCourses: true
		},
		courses: [
			createCourse({
				id: 'c-1',
				name: '数据结构',
				dayOfWeek: 1,
				startPeriod: 1,
				endPeriod: 2,
				weeks: [1, 2, 3],
				teacher: '王老师',
				location: '花溪校区 第五教学楼 A201'
			})
		]
	});

	const mockShell = {
		state: {
			appState: {
				timetables: [],
				currentTimetableId: 'tt-test',
				wallpaperUri: null,
				currentTimetable: sampleTimetable,
				themeMode: 'auto',
				timetableLayoutMode: 'fixed',
				paletteMode: 'vibrant',
				capsuleCornerStyle: 'rounded',
				hapticFeedbackEnabled: true
			},
			initialized: true,
			isDark: false,
			hasWallpaper: false
		},
		appearance: {} as any,
		controller: {} as any,
		init: () => {},
		destroy: () => {},
		updatePreferences: async () => {},
		setThemeMode: async () => {},
		setTimetableLayoutMode: async () => {},
		setPaletteMode: async () => {},
		setColorScheme: async () => {},
		setCapsuleCornerStyle: async () => {},
		setHapticFeedbackEnabled: async () => {},
		setWallpaper: async () => {},
		switchTimetable: async () => {},
		deleteTimetable: async () => {},
		clearAllData: async () => {}
	} as unknown as AppShellController;

	it('initializes with shell and computes viewport state', () => {
		const screen = getTimetableScreen();
		screen.init(mockShell);

		const state = screen.state;
		expect(state.hasLoadedAppState).toBe(true);
		expect(state.startWeek).toBe(1);
		expect(state.endWeek).toBe(20);
		expect(state.weeks.length).toBe(20);
		expect(state.displayedWeek).toBeGreaterThanOrEqual(1);
		expect(typeof state.weekRangeText).toBe('string');
	});

	it('allows setting displayed week and expanding/collapsing overlap slots', () => {
		const screen = getTimetableScreen();
		screen.init(mockShell);

		screen.setDisplayedWeek(5);
		expect(screen.state.displayedWeek).toBe(5);

		expect(screen.isSlotExpanded('1-1-2')).toBe(false);
		screen.expandSlot('1-1-2');
		expect(screen.isSlotExpanded('1-1-2')).toBe(true);
		expect(screen.state.expandedSlots.has('1-1-2')).toBe(true);

		screen.collapseSlot('1-1-2');
		expect(screen.isSlotExpanded('1-1-2')).toBe(false);
	});

	it('provides week layout and grid models for active and adjacent weeks', () => {
		const screen = getTimetableScreen();
		screen.init(mockShell);

		screen.setDisplayedWeek(2);
		const gridModel = screen.state.weekGridModels.get(2);
		expect(gridModel).toBeDefined();
		expect(gridModel?.visibleDays.length).toBe(5);

		const courseModels = screen.state.weekCourseDisplayModels.get(2);
		expect(courseModels).toBeDefined();
		expect(courseModels?.length).toBe(1);
		expect(courseModels?.[0]?.course.name).toBe('数据结构');
	});
});
