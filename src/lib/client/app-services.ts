import { getPreferencesRepository, getRepository } from './repository';
import type { PreferencesRepository } from '$lib/domain/interfaces/preferences-repository';
import type { TimetableRepository } from '$lib/domain/interfaces/timetable-repository';
import { DeleteTimetableUseCase } from '$lib/domain/usecases/delete-timetable';
import { CreateTimetableUseCase } from '$lib/domain/usecases/create-timetable';
import { SaveTimetableDetailsUseCase } from '$lib/domain/usecases/save-timetable-details';
import { SaveCourseUseCase } from '$lib/domain/usecases/save-course';
import { DeleteCourseUseCase } from '$lib/domain/usecases/delete-course';

export function createAppServices(
	repository: TimetableRepository = getRepository(),
	preferences: PreferencesRepository = getPreferencesRepository()
) {
	return {
		repository,
		preferences,
		deleteTimetable: new DeleteTimetableUseCase(repository, preferences),
		createTimetable: new CreateTimetableUseCase(repository, preferences),
		saveTimetableDetails: new SaveTimetableDetailsUseCase(repository),
		saveCourse: new SaveCourseUseCase(repository),
		deleteCourse: new DeleteCourseUseCase(repository)
	};
}

export type AppServices = ReturnType<typeof createAppServices>;
