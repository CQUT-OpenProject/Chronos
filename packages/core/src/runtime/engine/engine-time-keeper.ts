import { AcademicCalendarService } from '../../engine/calendar';
import { formatIsoDate } from '../../engine/date';
import {
	createDayClock,
	currentTimeMinutes,
	findCurrentPeriodIndex,
	parsePeriodRanges,
	type DayClockHandle
} from '../../engine/period-clock';
import type { Timetable } from '../../domain/timetable';
import type { EventPipeline } from '../event-pipeline';

/** Manages academic calendar time ticks and day-boundary scheduling. */
export class EngineTimeKeeper {
	private dayClock: DayClockHandle | null = null;
	private readonly calendarService = new AcademicCalendarService();

	constructor(
		private readonly events: EventPipeline,
		private readonly getCurrentTimetable: () => Timetable | null,
		private readonly setActiveWeek: (week: number) => void,
		private readonly setCurrentPeriodIndex: (index: number | null) => void
	) {}

	start(): void {
		this.dayClock?.dispose();
		this.dayClock = createDayClock({
			getPeriodTimes: () => this.getCurrentTimetable()?.academicConfig.periodTimes ?? [],
			onMidnight: () => {
				this.updateTime();
			},
			onPeriodBoundary: () => {
				this.updateTime();
			}
		});
	}

	reschedule(): void {
		this.dayClock?.reschedule();
	}

	updateTime(now = new Date()): void {
		const todayIso = formatIsoDate(now);
		const academicConfig = this.getCurrentTimetable()?.academicConfig;

		const currentWeek = academicConfig
			? this.calendarService.calculateAcademicWeek(todayIso, academicConfig)
			: 1;

		const currentPeriod =
			academicConfig?.periodTimes && academicConfig.periodTimes.length > 0
				? findCurrentPeriodIndex(
						parsePeriodRanges(academicConfig.periodTimes),
						currentTimeMinutes(now),
						'none'
					)
				: null;

		this.setActiveWeek(currentWeek);
		this.setCurrentPeriodIndex(currentPeriod);

		this.events.emit('time:tick', {
			currentWeek,
			currentPeriod,
			now,
			todayIso
		});
	}

	dispose(): void {
		this.dayClock?.dispose();
		this.dayClock = null;
	}
}
