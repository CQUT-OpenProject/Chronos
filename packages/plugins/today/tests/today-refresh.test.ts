import { describe, expect, it, vi } from 'vite-plus/test';
import { writable } from 'svelte/store';
import {
	ChronosEngine,
	createCourse,
	createTimetable,
	IStorageService,
	type CoursePaletteEntry,
	type CourseQueryHit
} from '@chronos/core';
import { createMockEnv } from '@chronos/core/test-utils';
import type { ChronosUiController, ChronosUiSnapshot } from '@chronos/ui-kit';
import { createTodayPlugin } from '../src/index';
import { createTodayScreenController } from '../src/today-screen.svelte';
async function harness() {
	const paints = vi.fn(
		async () =>
			new Map<string, CoursePaletteEntry>([['A', { background: '#111111', foreground: '#ffffff' }]])
	);
	const { env, timetables } = createMockEnv({
		coursePresentation: {
			getCoursePalette: () => [],
			resolveCoursePaintsForTimetable: paints,
			resolveCoursePaint: async () => ({ background: '#111111', foreground: '#ffffff' })
		}
	});
	const engine = new ChronosEngine({ env });
	await engine.init();
	await engine.loadPlugin(createTodayPlugin());
	const course = createCourse({ id: 'a', name: 'A', dayOfWeek: 1, startPeriod: 1, endPeriod: 1 });
	const timetable = createTimetable({ id: 't', name: 'T', courses: [course] });
	timetable.academicConfig.periodTimes = [{ index: 1, startTime: '08:00', endTime: '08:45' }];
	timetables.set(timetable.id, timetable);
	await engine.switchTimetable(timetable.id);
	const ctx = engine.getPluginContext('tool-today');
	await ctx.updateConfig({ prepareReminderMinutes: 10 });
	const query = vi
		.spyOn(ctx.service(IStorageService), 'queryCourses')
		.mockResolvedValue([{ timetableId: 't', timetableName: 'T', course }]);
	const snapshot = writable({
		currentTimetable: timetable,
		timetables: [],
		clockNow: new Date('2026-03-02T07:49:00'),
		clockTodayIso: '2026-03-02',
		coursePaletteRevision: 0
	} as unknown as ChronosUiSnapshot);
	const screen = createTodayScreenController();
	await screen.init(
		{ snapshot, getPluginContext: () => ctx } as unknown as ChronosUiController,
		'tool-today'
	);
	return { engine, screen, snapshot, query, course, paints, ctx };
}
async function settle() {
	for (let i = 0; i < 20; i++) await Promise.resolve();
}
describe('Today relevant input refresh', () => {
	it('07:50 updates the ten-minute reminder without rereading courses; unrelated and palette updates do not query', async () => {
		const { engine, screen, snapshot, query } = await harness();
		expect(screen.courseEntries[0].status).toBe('upcoming');
		snapshot.update((s) => ({ ...s, clockNow: new Date('2026-03-02T07:50:00') }));
		await settle();
		expect(screen.courseEntries[0].status).toBe('preparing');
		expect(query).toHaveBeenCalledTimes(1);
		snapshot.update((s) => ({
			...s,
			currentLocale: 'en',
			courseBadges: {},
			coursePaletteRevision: 1
		}));
		await settle();
		expect(query).toHaveBeenCalledTimes(1);
		screen.dispose();
		engine.dispose();
	});
	it('newer date result wins even when an older query completes last, and disposal invalidates pending work', async () => {
		const { engine, screen, snapshot, query, course } = await harness();
		let release!: (hits: CourseQueryHit[]) => void;
		query.mockImplementationOnce(
			() =>
				new Promise((resolve) => {
					release = resolve;
				})
		);
		snapshot.update((s) => ({ ...s, clockTodayIso: '2026-03-03' }));
		await settle();
		query.mockResolvedValue([
			{ timetableId: 't', timetableName: 'T', course: { ...course, name: 'Newest' } }
		]);
		snapshot.update((s) => ({ ...s, clockTodayIso: '2026-03-04' }));
		await settle();
		release([{ timetableId: 't', timetableName: 'T', course: { ...course, name: 'Stale' } }]);
		await settle();
		expect(screen.courseEntries[0].hit.course.name).toBe('Newest');
		query.mockImplementationOnce(
			() =>
				new Promise((resolve) => {
					release = resolve;
				})
		);
		snapshot.update((s) => ({ ...s, clockTodayIso: '2026-03-05' }));
		await settle();
		screen.dispose();
		release([]);
		await settle();
		expect(screen.courseEntries).toEqual([]);
		engine.dispose();
	});
	it('only the newest palette request can paint the current courses', async () => {
		const { engine, screen, snapshot, query, paints, ctx } = await harness();
		let release!: (value: Map<string, CoursePaletteEntry>) => void;
		paints.mockImplementationOnce(
			() =>
				new Promise((resolve) => {
					release = resolve;
				})
		);
		snapshot.update((s) => ({ ...s, coursePaletteRevision: 1 }));
		await settle();
		const newest = new Map([['A', { background: '#abcdef', foreground: '#000000' }]]);
		paints.mockResolvedValue(newest);
		snapshot.update((s) => ({ ...s, coursePaletteRevision: 2 }));
		await settle();
		release(new Map([['A', { background: '#stale', foreground: '#ffffff' }]]));
		await settle();
		expect(screen.paintByCourseKey.get('t\0A')).toEqual(newest.get('A'));
		expect(query).toHaveBeenCalledTimes(1);
		await ctx.updateConfig({ prepareReminderMinutes: 30 });
		await settle();
		expect(screen.courseEntries[0].status).toBe('preparing');
		expect(query).toHaveBeenCalledTimes(1);
		screen.dispose();
		engine.dispose();
	});
});
