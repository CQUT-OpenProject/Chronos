import {
	inferYearsFromAcademicConfig,
	clearHolidayCalendarFromStorage,
	type ChronosContext,
	type HolidayCalendarConfig,
	IHttpService,
	IStorageService,
	type Timetable
} from '@chronos/core';
import { fetchHolidayCnYears } from './holiday-cn-client';

const syncInFlightByTimetableId = new Map<string, Promise<boolean>>();

export async function clearHolidayCalendarFromAllTimetables(ctx: ChronosContext): Promise<number> {
	return clearHolidayCalendarFromStorage(ctx.service(IStorageService));
}

export function needsHolidaySync(
	existing: HolidayCalendarConfig | undefined,
	requiredYears: readonly number[]
): boolean {
	if (!existing?.syncedAt || !existing.syncedYears?.length) return true;
	const syncedYears = new Set(existing.syncedYears);
	return requiredYears.some((year) => !syncedYears.has(year));
}

export interface SyncHolidayCalendarOptions {
	force?: boolean;
}

export async function syncHolidayCalendarFromHolidayCn(
	ctx: ChronosContext,
	options: SyncHolidayCalendarOptions = {}
): Promise<boolean> {
	const timetable = ctx.state.currentTimetable;
	if (!timetable) {
		throw new Error('No active timetable');
	}

	const timetableId = timetable.id;
	const inflight = syncInFlightByTimetableId.get(timetableId);
	if (inflight) {
		return inflight;
	}

	const promise = performHolidaySync(ctx, timetableId, timetable.academicConfig, options).finally(
		() => {
			syncInFlightByTimetableId.delete(timetableId);
		}
	);
	syncInFlightByTimetableId.set(timetableId, promise);
	return promise;
}

export async function ensureHolidayCalendarSynced(
	ctx: ChronosContext,
	options: SyncHolidayCalendarOptions = {}
): Promise<boolean> {
	if (!ctx.state.currentTimetable) return false;
	return syncHolidayCalendarFromHolidayCn(ctx, options);
}

async function performHolidaySync(
	ctx: ChronosContext,
	timetableId: string,
	academicConfig: Timetable['academicConfig'],
	options: SyncHolidayCalendarOptions
): Promise<boolean> {
	const requiredYears = inferYearsFromAcademicConfig(academicConfig);
	const storage = ctx.service(IStorageService);
	const latest = await storage.getTimetable(timetableId);
	if (!latest) {
		throw new Error(`Timetable not found: ${timetableId}`);
	}

	if (!options.force && !needsHolidaySync(latest.academicConfig.holidayCalendar, requiredYears)) {
		return false;
	}

	const http = ctx.service(IHttpService);
	const { holidays } = await fetchHolidayCnYears(http, requiredYears);

	const holidayCalendar: HolidayCalendarConfig = {
		holidays,
		syncedAt: Date.now(),
		syncedYears: [...requiredYears]
	};

	const updatedAcademicConfig = {
		...latest.academicConfig,
		holidayCalendar
	};

	if (ctx.state.currentTimetable?.id === timetableId) {
		await ctx.actions.saveCurrentTimetableDetails({
			academicConfig: updatedAcademicConfig
		});
		return true;
	}

	const updated: Timetable = {
		...latest,
		academicConfig: updatedAcademicConfig,
		updatedAt: Date.now()
	};
	await storage.saveTimetable(updated);
	return true;
}
