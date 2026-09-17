import { describe, it, expect, vi } from 'vite-plus/test';
import {
	ChronosEngine,
	COURSE_PALETTE_ENTRIES,
	createCourse,
	createTimetable,
	assignCourseDisplayColors
} from '@chronos/core';
import { createMockEnv } from '@chronos/core/test-utils';
import {
	createCoursePaletteRef,
	createWebCoursePresentationPort
} from './course-presentation-port';

describe('createWebCoursePresentationPort', () => {
	it('assigns paints using the full timetable course list', async () => {
		const { env, timetables } = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		const courseA = createCourse({
			id: 'ca',
			name: 'Course A',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 1
		});
		const courseB = createCourse({
			id: 'cb',
			name: 'Course B',
			dayOfWeek: 2,
			startPeriod: 1,
			endPeriod: 1
		});
		const courseC = createCourse({
			id: 'cc',
			name: 'Course C',
			dayOfWeek: 3,
			startPeriod: 1,
			endPeriod: 1
		});
		const timetable = createTimetable({
			id: 'test-paints',
			name: 'Test',
			courses: [courseA, courseB, courseC]
		});
		timetables.set(timetable.id, timetable);
		await engine.switchTimetable(timetable.id);

		const paletteRef = createCoursePaletteRef();
		const port = createWebCoursePresentationPort(paletteRef, () => engine);
		const fullLookup = assignCourseDisplayColors(timetable.courses, paletteRef.current);

		const resolved = await port.resolveCoursePaintsForTimetable(timetable.id);
		expect(resolved.get('Course A')).toEqual(fullLookup.get('Course A'));
		expect(resolved.get('Course B')).toEqual(fullLookup.get('Course B'));
		expect(resolved.get('Course C')).toEqual(fullLookup.get('Course C'));
	});

	it('invalidates automatically when palette identity changes', async () => {
		const { env, timetables } = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();

		const course = createCourse({
			id: 'cached',
			name: 'Cached',
			dayOfWeek: 1,
			startPeriod: 1,
			endPeriod: 1
		});
		const timetable = createTimetable({ id: 'cached-paints', name: 'Cached', courses: [course] });
		timetables.set(timetable.id, timetable);
		await engine.switchTimetable(timetable.id);

		const paletteRef = createCoursePaletteRef();
		const port = createWebCoursePresentationPort(paletteRef, () => engine);
		const first = await port.resolveCoursePaintsForTimetable(timetable.id);
		paletteRef.current = COURSE_PALETTE_ENTRIES.map((entry, index) =>
			index === 0 ? { background: '#111111', foreground: '#ffffff' } : entry
		);
		const stale = await port.resolveCoursePaintsForTimetable(timetable.id);
		expect(stale).not.toBe(first);

		const refreshed = await port.resolveCoursePaintsForTimetable(timetable.id);
		expect(refreshed).toBe(stale);
	});
	it('uses the latest palette after an asynchronous timetable read finishes', async () => {
		const { env } = createMockEnv();
		const engine = new ChronosEngine({ env });
		await engine.init();
		const timetable = createTimetable({
			id: 'paused',
			name: 'Paused',
			courses: [
				createCourse({ id: 'paused-a', name: 'A', dayOfWeek: 1, startPeriod: 1, endPeriod: 1 })
			]
		});
		let release!: (value: typeof timetable) => void;
		vi.spyOn(engine.storage, 'getTimetable')
			.mockImplementationOnce(
				() =>
					new Promise((resolve) => {
						release = resolve;
					})
			)
			.mockResolvedValue(timetable);
		const ref = createCoursePaletteRef();
		const port = createWebCoursePresentationPort(ref, () => engine);
		const pending = port.resolveCoursePaintsForTimetable('paused');
		ref.current = [{ background: '#112233', foreground: '#ffffff' }];
		release(timetable);
		const first = await pending;
		expect([...first.values()]).toEqual([ref.current[0]]);
		expect(await port.resolveCoursePaintsForTimetable('paused')).toBe(first);
		engine.dispose();
	});
});
