import { getPreferencesRepository, getRepository } from './repository';
import type { PreferencesRepository } from '$lib/domain/interfaces/preferences-repository';
import type { TimetableRepository } from '$lib/domain/interfaces/timetable-repository';
import { ObserveAppStateUseCase } from '$lib/domain/usecases/observe-app-state';
import { SwitchTimetableUseCase } from '$lib/domain/usecases/switch-timetable';
import { DeleteTimetableUseCase } from '$lib/domain/usecases/delete-timetable';
import { CreateTimetableUseCase } from '$lib/domain/usecases/create-timetable';
import { SetThemeModeUseCase } from '$lib/domain/usecases/set-theme-mode';
import { SetWallpaperUseCase } from '$lib/domain/usecases/set-wallpaper';
import { SetDynamicColorEnabledUseCase } from '$lib/domain/usecases/set-dynamic-color-enabled';
import { SaveTimetableDetailsUseCase } from '$lib/domain/usecases/save-timetable-details';
import { SaveCourseUseCase } from '$lib/domain/usecases/save-course';
import { DeleteCourseUseCase } from '$lib/domain/usecases/delete-course';

export function createAppServices(
	repository: TimetableRepository = getRepository(),
	preferences: PreferencesRepository = getPreferencesRepository()
) {
	return {
		observeAppState: new ObserveAppStateUseCase(repository),
		switchTimetable: new SwitchTimetableUseCase(preferences),
		deleteTimetable: new DeleteTimetableUseCase(repository, preferences),
		createTimetable: new CreateTimetableUseCase(repository, preferences),
		setThemeMode: new SetThemeModeUseCase(preferences),
		setWallpaper: new SetWallpaperUseCase(preferences),
		setDynamicColorEnabled: new SetDynamicColorEnabledUseCase(preferences),
		saveTimetableDetails: new SaveTimetableDetailsUseCase(repository),
		saveCourse: new SaveCourseUseCase(repository),
		deleteCourse: new DeleteCourseUseCase(repository),
		repository
	};
}

export type AppServices = ReturnType<typeof createAppServices>;
