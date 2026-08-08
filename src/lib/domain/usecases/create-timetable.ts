import { academicConfigSchema, createTimetable } from '$lib/models/timetable';
import { AcademicCalendarService } from '../services/academic-calendar';
import type { PreferencesRepository } from '../interfaces/preferences-repository';
import type { TimetableRepository } from '../interfaces/timetable-repository';
import { SystemTimeProvider, type TimeProvider } from '../services/time-provider';

export class CreateTimetableUseCase {
	constructor(
		private readonly repository: TimetableRepository,
		private readonly preferences: PreferencesRepository,
		private readonly academicCalendarService = new AcademicCalendarService(),
		private readonly timeProvider: TimeProvider = new SystemTimeProvider()
	) {}

	async invoke(name: string): Promise<void> {
		const now = this.timeProvider.currentTimeMillis();
		const timetable = createTimetable({
			id: crypto.randomUUID(),
			name: name.trim() || '未命名课表',
			courses: [],
			createdAt: now,
			updatedAt: now,
			academicConfig: academicConfigSchema.parse({
				termStartDate: this.academicCalendarService.normalizeTermStartDate(
					'',
					this.timeProvider.today()
				)
			})
		});

		await this.repository.saveTimetable(timetable);
		await this.preferences.setCurrentTimetableId(timetable.id);
	}
}
