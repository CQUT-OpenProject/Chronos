import { describe, expect, it } from 'vite-plus/test';
import { createCourse } from '$lib/models/course';
import { createTimetable, TimetableImportSource } from '$lib/models/timetable';
import { ThemeMode, type AppState } from '$lib/models/app-state';
import {
	emptyOnlineSchedulePayload,
	type OnlineScheduleFetchResult,
	type OnlineSchedulePayload
} from '$lib/models/online-schedule';
import type { Timetable } from '$lib/models/timetable';
import type { TimetableRepository } from '../interfaces/timetable-repository';
import type { PreferencesRepository } from '../interfaces/preferences-repository';
import type { TimetableShareCodec } from '../interfaces/timetable-share-codec';
import type { RemoteTimetableSource } from '../interfaces/remote-timetable-source';
import type { AuthSnapshot } from '$lib/models/auth';
import { AcademicCalendarService } from '../services/academic-calendar';
import type { TimeProvider } from '../services/time-provider';
import { CalculateAcademicWeekUseCase } from './calculate-academic-week';
import { ImportTimetableUseCase } from './import-timetable';
import { PreviewOnlineTimetableUseCase } from './preview-online-timetable';
import { SaveTimetableDetailsUseCase } from './save-timetable-details';
import { ImportMode } from '../import-mode';
import { success, type AppResult } from '../result/app-result';

class FixedTimeProvider implements TimeProvider {
	today(): string {
		return '2026-03-04';
	}

	currentTime(): string {
		return '09:00';
	}

	currentTimeMillis(): number {
		return 100;
	}
}

class FakeAppBackend {
	timetables = new Map<string, Timetable>();
	currentTimetableId: string | null = null;
	wallpaperUri: string | null = null;
	themeMode = ThemeMode.SYSTEM;
	state: AppState = {
		timetables: [],
		currentTimetableId: null,
		wallpaperUri: null,
		currentTimetable: null,
		themeMode: ThemeMode.SYSTEM
	};

	syncState() {
		const current = this.currentTimetableId
			? (this.timetables.get(this.currentTimetableId) ?? null)
			: null;
		this.state = {
			timetables: [...this.timetables.values()].map((timetable) => ({
				id: timetable.id,
				name: timetable.name,
				courseCount: timetable.courses.length,
				createdAt: timetable.createdAt,
				updatedAt: timetable.updatedAt
			})),
			currentTimetableId: this.currentTimetableId,
			wallpaperUri: this.wallpaperUri,
			currentTimetable: current,
			themeMode: this.themeMode
		};
	}
}

class FakeTimetableRepository implements TimetableRepository {
	constructor(readonly backend = new FakeAppBackend()) {}

	get preferences(): PreferencesRepository {
		return new FakePreferencesRepository(this.backend);
	}

	subscribeAppState(listener: (state: AppState) => void): () => void {
		listener(this.backend.state);
		return () => undefined;
	}

	seedCurrent(): Timetable {
		const timetable = sampleImportedTimetable({
			id: 'current-id',
			name: '当前课表',
			createdAt: 50,
			viewPrefs: {
				showSaturday: true,
				showSunday: false,
				showNonCurrentWeekCourses: true
			}
		});
		this.backend.timetables.set(timetable.id, timetable);
		this.backend.currentTimetableId = timetable.id;
		this.backend.syncState();
		return timetable;
	}

	async getAppStateSnapshot(): Promise<AppState> {
		return this.backend.state;
	}

	async getTimetable(id: string): Promise<Timetable | null> {
		return this.backend.timetables.get(id) ?? null;
	}

	async saveTimetable(timetable: Timetable): Promise<void> {
		this.backend.timetables.set(timetable.id, timetable);
		if (!this.backend.currentTimetableId) this.backend.currentTimetableId = timetable.id;
		this.backend.syncState();
	}

	async saveCourse(): Promise<void> {}

	async deleteCourse(): Promise<void> {}

	async deleteTimetable(): Promise<void> {}

	sampleImportedTimetable(overrides: Partial<Timetable> = {}): Timetable {
		return createTimetable({
			id: 'imported-id',
			name: '导入课表',
			createdAt: 1,
			updatedAt: 1,
			courses: [
				createCourse({
					id: 'imported-course',
					name: '编译原理',
					teacher: '张老师',
					location: 'B201',
					dayOfWeek: 1,
					startPeriod: 1,
					endPeriod: 2,
					color: '#EADDFF',
					textColor: '#21005D'
				})
			],
			importMetadata: { source: TimetableImportSource.SHARED_JSON },
			...overrides
		});
	}
}

class FakePreferencesRepository implements PreferencesRepository {
	constructor(private readonly backend: FakeAppBackend) {}

	async setCurrentTimetableId(id: string | null): Promise<void> {
		this.backend.currentTimetableId = id;
		this.backend.syncState();
	}

	async setWallpaper(wallpaper: Blob | null): Promise<void> {
		this.backend.wallpaperUri = wallpaper ? 'blob:wallpaper' : null;
		this.backend.syncState();
	}

	async setThemeMode(mode: ThemeMode): Promise<void> {
		this.backend.themeMode = mode;
		this.backend.syncState();
	}
}

class FakeTimetableShareCodec implements TimetableShareCodec {
	constructor(private readonly timetable: Timetable) {}

	decode(): AppResult<OnlineSchedulePayload> {
		return success(emptyOnlineSchedulePayload());
	}

	encode(): AppResult<string> {
		return success('{}');
	}

	toTimetable(_payload: OnlineSchedulePayload): AppResult<Timetable> {
		return success(this.timetable);
	}
}

class FakeRemoteTimetableSource implements RemoteTimetableSource {
	async fetchSchedule(_authSnapshot: AuthSnapshot): Promise<AppResult<OnlineScheduleFetchResult>> {
		return success({
			schedule: { ...emptyOnlineSchedulePayload(), yearTerm: '2025-2026-2' }
		});
	}
}

function sampleImportedTimetable(overrides: Partial<Timetable> = {}): Timetable {
	return createTimetable({
		id: 'imported-id',
		name: '导入课表',
		createdAt: 1,
		updatedAt: 1,
		courses: [
			createCourse({
				id: 'imported-course',
				name: '编译原理',
				teacher: '张老师',
				location: 'B201',
				dayOfWeek: 1,
				startPeriod: 1,
				endPeriod: 2,
				color: '#EADDFF',
				textColor: '#21005D'
			})
		],
		importMetadata: { source: TimetableImportSource.SHARED_JSON },
		...overrides
	});
}

describe('domain use cases', () => {
	const academicCalendarService = new AcademicCalendarService();

	it('calculateAcademicWeek clamps before term start', () => {
		const useCase = new CalculateAcademicWeekUseCase();
		const result = useCase.invoke('2026-03-01', {
			termStartDate: '2026-03-09',
			startWeek: 3,
			endWeek: 18,
			periodTimes: []
		});
		expect(result).toBe(3);
	});

	it('academicCalendarService normalizes non monday term start date', () => {
		const weekStart = academicCalendarService.resolveWeekStart(
			{
				termStartDate: '2026-03-03',
				startWeek: 1,
				endWeek: 20,
				periodTimes: []
			},
			2,
			'2026-03-09'
		);
		expect(weekStart).toBe('2026-03-09');
	});

	it('saveTimetableDetails normalizes fields and updates structured config', async () => {
		const repo = new FakeTimetableRepository();
		const timetable = repo.seedCurrent();
		const useCase = new SaveTimetableDetailsUseCase(
			repo,
			academicCalendarService,
			new FixedTimeProvider()
		);

		await useCase.invoke(timetable.id, {
			name: ' ',
			academicConfig: {
				termStartDate: '2026-03-03',
				startWeek: 0,
				endWeek: 0,
				periodTimes: [
					{ index: 3, startTime: ' ', endTime: '11:00' },
					{ index: 1, startTime: '08:00', endTime: ' ' }
				]
			},
			importMetadata: { source: TimetableImportSource.FILE_HTML },
			viewPrefs: {
				showSaturday: false,
				showSunday: true,
				showNonCurrentWeekCourses: true
			}
		});

		const saved = await repo.getTimetable(timetable.id);
		expect(saved).not.toBeNull();
		expect(saved?.name).toBe('未命名课表');
		expect(saved?.academicConfig.termStartDate).toBe('2026-03-02');
		expect(saved?.academicConfig.startWeek).toBe(1);
		expect(saved?.academicConfig.endWeek).toBe(1);
		expect(saved?.importMetadata.source).toBe(TimetableImportSource.FILE_HTML);
		expect(saved?.viewPrefs.showSaturday).toBe(false);
		expect(saved?.viewPrefs.showSunday).toBe(true);
		expect(saved?.viewPrefs.showNonCurrentWeekCourses).toBe(true);
		expect(saved?.academicConfig.periodTimes).toHaveLength(2);
		expect(saved?.academicConfig.periodTimes[0]?.startTime).toBe('08:00');
	});

	it('saveTimetableDetails persists online campus metadata', async () => {
		const repo = new FakeTimetableRepository();
		const timetable = repo.seedCurrent();
		const useCase = new SaveTimetableDetailsUseCase(
			repo,
			academicCalendarService,
			new FixedTimeProvider()
		);

		await useCase.invoke(timetable.id, {
			name: '知行课表',
			academicConfig: {
				termStartDate: '2026-03-02',
				startWeek: 1,
				endWeek: 20,
				periodTimes: [{ index: 1, startTime: '08:30', endTime: '09:15' }]
			},
			importMetadata: {
				source: TimetableImportSource.ONLINE_EDU,
				campusId: 'liangjiang',
				campusPeriodTimes: {
					liangjiang: [{ index: 1, startTime: '08:30', endTime: '09:15' }],
					huaxi: [{ index: 1, startTime: '08:00', endTime: '08:45' }]
				}
			},
			viewPrefs: {
				showSaturday: true,
				showSunday: true,
				showNonCurrentWeekCourses: false
			}
		});

		const saved = await repo.getTimetable(timetable.id);
		expect(saved?.importMetadata.campusId).toBe('liangjiang');
		expect(saved?.importMetadata.campusPeriodTimes?.huaxi?.[0]?.startTime).toBe('08:00');
	});

	it('importTimetable overwrite preserves identity and view prefs while replacing structure', async () => {
		const repo = new FakeTimetableRepository();
		const existing = repo.seedCurrent();
		const imported = repo.sampleImportedTimetable({
			academicConfig: {
				termStartDate: '2026-02-23',
				startWeek: 2,
				endWeek: 16,
				periodTimes: [{ index: 1, startTime: '08:00', endTime: '08:45' }]
			},
			importMetadata: { source: TimetableImportSource.FILE_HTML },
			viewPrefs: {
				showSaturday: false,
				showSunday: false,
				showNonCurrentWeekCourses: false
			}
		});
		const useCase = new ImportTimetableUseCase(repo, repo.preferences);

		await useCase.import(imported, ImportMode.OVERWRITE_CURRENT);

		const current = (await repo.getAppStateSnapshot()).currentTimetable;
		expect(current?.id).toBe(existing.id);
		expect(current?.name).toBe(existing.name);
		expect(current?.createdAt).toBe(existing.createdAt);
		expect(current?.viewPrefs).toEqual(existing.viewPrefs);
		expect(current?.academicConfig).toEqual(imported.academicConfig);
		expect(current?.importMetadata).toEqual(imported.importMetadata);
		expect(current?.courses[0]?.id).toBe(`${existing.id}:1`);
	});

	it('importTimetable as new keeps imported view prefs and structure', async () => {
		const repo = new FakeTimetableRepository();
		repo.seedCurrent();
		const imported = repo.sampleImportedTimetable({
			viewPrefs: {
				showSaturday: false,
				showSunday: true,
				showNonCurrentWeekCourses: true
			},
			importMetadata: { source: TimetableImportSource.ONLINE_EDU }
		});
		const useCase = new ImportTimetableUseCase(repo, repo.preferences);

		await useCase.import(imported, ImportMode.AS_NEW);

		const current = (await repo.getAppStateSnapshot()).currentTimetable;
		expect(current).not.toBeNull();
		expect(current?.id).not.toBe(imported.id);
		expect(current?.viewPrefs).toEqual(imported.viewPrefs);
		expect(current?.importMetadata).toEqual(imported.importMetadata);
	});

	it('previewOnlineTimetable stamps online import source', async () => {
		const codecTimetable = sampleImportedTimetable({
			importMetadata: { source: TimetableImportSource.UNKNOWN }
		});
		const useCase = new PreviewOnlineTimetableUseCase(
			new FakeRemoteTimetableSource(),
			new FakeTimetableShareCodec(codecTimetable)
		);

		const result = await useCase.invoke({ account: '10001', password: 'pwd' });
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.value.importMetadata.source).toBe(TimetableImportSource.ONLINE_EDU);
		}
	});
});
