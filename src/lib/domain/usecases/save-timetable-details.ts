import { defaultPeriodTimes } from '$lib/models/defaults';
import type { PeriodTime, TimetableImportMetadata } from '$lib/models/timetable';
import { normalizeTimetableName } from '$lib/models/timetable';
import type { TimetableSettingsDraft } from '$lib/models/drafts';
import { AcademicCalendarService } from '../services/academic-calendar';
import type { TimetableRepository } from '../interfaces/timetable-repository';
import { SystemTimeProvider, type TimeProvider } from '../services/time-provider';

export class SaveTimetableDetailsUseCase {
	constructor(
		private readonly repository: TimetableRepository,
		private readonly academicCalendarService = new AcademicCalendarService(),
		private readonly timeProvider: TimeProvider = new SystemTimeProvider()
	) {}

	async invoke(timetableId: string, draft: TimetableSettingsDraft): Promise<void> {
		const timetable = await this.repository.getTimetable(timetableId);
		if (!timetable) return;

		const safeStartWeek = Math.max(draft.academicConfig.startWeek, 1);
		const normalizedPeriods = normalizePeriods(draft.academicConfig.periodTimes);

		const importMetadata: TimetableImportMetadata = {
			source: draft.importMetadata.source,
			campusId: draft.importMetadata.campusId,
			campusPeriodTimes: draft.importMetadata.campusPeriodTimes
				? (Object.fromEntries(
						Object.entries(draft.importMetadata.campusPeriodTimes).map(([campus, periods]) => [
							campus,
							periods.map((period) => ({ ...period }))
						])
					) as TimetableImportMetadata['campusPeriodTimes'])
				: undefined
		};

		await this.repository.saveTimetable({
			...timetable,
			name: normalizeTimetableName(draft.name),
			updatedAt: this.timeProvider.currentTimeMillis(),
			academicConfig: {
				termStartDate: this.academicCalendarService.normalizeTermStartDate(
					draft.academicConfig.termStartDate,
					this.timeProvider.today()
				),
				startWeek: safeStartWeek,
				endWeek: Math.max(draft.academicConfig.endWeek, safeStartWeek),
				periodTimes: normalizedPeriods
			},
			importMetadata,
			viewPrefs: {
				showSaturday: draft.viewPrefs.showSaturday,
				showSunday: draft.viewPrefs.showSunday,
				showNonCurrentWeekCourses: draft.viewPrefs.showNonCurrentWeekCourses
			}
		});
	}
}

function normalizePeriods(
	periodTimes: TimetableSettingsDraft['academicConfig']['periodTimes']
): PeriodTime[] {
	const sorted = [...periodTimes].sort((left, right) => left.index - right.index);
	const defaults = defaultPeriodTimes();

	const normalized = sorted.map((period, index) => ({
		index: index + 1,
		startTime: period.startTime.trim() || defaults[index]?.startTime || '--:--',
		endTime: period.endTime.trim() || defaults[index]?.endTime || '--:--'
	}));

	return normalized.length > 0 ? normalized : defaults;
}
