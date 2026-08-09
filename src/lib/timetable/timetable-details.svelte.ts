import type { AppShellController } from '$lib/app/app-shell.svelte';
import type { TimetableSettingsDraft } from '$lib/models/drafts';
import { currentWeekMonday, defaultPeriodTimes } from '$lib/models/defaults';
import { SystemTimeProvider } from '$lib/domain/services/time-provider';
import { toSettingsDraft } from '$lib/timetable/timetable-mappers';

const timeProvider = new SystemTimeProvider();

export class TimetableDetailsEditor {
	draft = $state<TimetableSettingsDraft | null>(null);

	constructor(
		private shell: AppShellController,
		private onDone: () => void
	) {}

	get canSave() {
		return Boolean(this.draft?.name.trim());
	}

	save = async () => {
		const timetable = this.shell.state.appState.currentTimetable;
		if (!timetable || !this.draft) return;
		await this.shell.services.saveTimetableDetails.invoke(timetable.id, this.draft);
		this.onDone();
	};

	resetToDefaultSettings = () => {
		if (!this.draft) return;
		const today = timeProvider.today();
		this.draft.academicConfig = {
			...this.draft.academicConfig,
			termStartDate: currentWeekMonday(today),
			periodTimes: defaultPeriodTimes().map((period) => ({ ...period }))
		};
		this.draft.viewPrefs = {
			showSaturday: true,
			showSunday: true,
			showNonCurrentWeekCourses: true
		};
	};
}

export function createTimetableDetailsEditor(
	shell: AppShellController,
	onDone: () => void
): TimetableDetailsEditor {
	const editor = new TimetableDetailsEditor(shell, onDone);
	let loadedTimetableId = $state<string | null>(null);

	const timetable = $derived(shell.state.appState.currentTimetable);

	$effect(() => {
		if (!timetable) {
			editor.draft = null;
			loadedTimetableId = null;
			return;
		}
		if (loadedTimetableId === timetable.id) return;
		loadedTimetableId = timetable.id;
		editor.draft = toSettingsDraft(timetable);
	});

	return editor;
}

export type TimetableDetailsController = TimetableDetailsEditor;
