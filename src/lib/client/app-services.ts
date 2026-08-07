import { getRepository } from './repository';
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

export function createAppServices(repository: TimetableRepository = getRepository()) {
	return {
		observeAppState: new ObserveAppStateUseCase(repository),
		switchTimetable: new SwitchTimetableUseCase(repository),
		deleteTimetable: new DeleteTimetableUseCase(repository),
		createTimetable: new CreateTimetableUseCase(repository),
		setThemeMode: new SetThemeModeUseCase(repository),
		setWallpaper: new SetWallpaperUseCase(repository),
		setDynamicColorEnabled: new SetDynamicColorEnabledUseCase(repository),
		saveTimetableDetails: new SaveTimetableDetailsUseCase(repository),
		saveCourse: new SaveCourseUseCase(repository),
		deleteCourse: new DeleteCourseUseCase(repository),
		repository
	};
}

export type AppServices = ReturnType<typeof createAppServices>;
