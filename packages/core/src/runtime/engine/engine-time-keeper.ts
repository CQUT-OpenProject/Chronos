import { AcademicCalendarService } from '../../algorithms/calendar';
import { todayIsoDate } from '../../algorithms/date';
import {
	createDayClock,
	currentTimeMinutes,
	findCurrentPeriodIndex,
	parsePeriodRanges,
	type DayClockHandle
} from '../../algorithms/period-clock';
import type { Timetable } from '../../domain/timetable';
import type { EventPipeline } from '../event-pipeline';

/** Manages academic calendar time ticks and day-boundary scheduling. */
export class EngineTimeKeeper {
	private dayClock: DayClockHandle | null = null;
	private frozenNow: Date | null = null;
	private readonly calendarService = new AcademicCalendarService();

	constructor(
		private readonly events: EventPipeline,
		private readonly getCurrentTimetable: () => Timetable | null,
		private readonly setActiveWeek: (week: number) => void,
		private readonly setCurrentPeriodIndex: (index: number | null) => void
	) {}

	now(): Date {
		return this.frozenNow ? new Date(this.frozenNow.getTime()) : new Date();
	}

	isFrozen(): boolean {
		return this.frozenNow !== null;
	}

	setVirtualNow(now: Date | null): void {
		this.frozenNow = now ? new Date(now.getTime()) : null;
		if (this.frozenNow) {
			this.dayClock?.dispose();
			this.dayClock = null;
		} else {
			this.start();
		}
		this.updateTime();
	}

	start(): void {
		this.dayClock?.dispose();
		this.dayClock = null;
		if (this.frozenNow) return;
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

	updateTime(now = this.now()): void {
		const todayIso = todayIsoDate(now);
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
			todayIso,
			frozen: this.frozenNow !== null
		});
	}

	dispose(): void {
		this.dayClock?.dispose();
		this.dayClock = null;
	}
}
