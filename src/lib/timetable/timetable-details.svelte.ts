import type { AppShellController } from '$lib/app/app-shell.svelte';
import { DEFAULT_CQUT_CAMPUS_ID, type CqutCampusId } from '$lib/models/cqut-campus';
import type { TimetableSettingsDraft } from '$lib/models/drafts';
import { currentWeekMonday, defaultPeriodTimes } from '$lib/models/defaults';
import { TimetableImportSource } from '$lib/models/timetable';
import { SystemTimeProvider } from '$lib/domain/services/time-provider';
import {
	applyCampusPeriodTimes,
	ensureOnlineCampusMetadata,
	toSettingsDraft
} from '$lib/timetable/timetable-mappers';

const timeProvider = new SystemTimeProvider();

export class TimetableDetailsEditor {
	draft = $state<TimetableSettingsDraft | null>(null);
	missingCampusMessage = $state<string | null>(null);

	constructor(
		private shell: AppShellController,
		private onDone: () => void
	) {}

	get canSave() {
		return Boolean(this.draft);
	}

	get selectedCampus(): CqutCampusId | null {
		return this.draft?.importMetadata.campusId ?? null;
	}

	selectCampus = (campusId: CqutCampusId) => {
		if (!this.draft) return;
		const applied = applyCampusPeriodTimes(this.draft, campusId);
		this.missingCampusMessage = applied ? null : '请重新导入课表以获取该校区节次时间';
	};

	save = async () => {
		const timetable = this.shell.state.appState.currentTimetable;
		if (!timetable || !this.draft) return;
		await this.shell.services.saveTimetableDetails.invoke(timetable.id, this.draft);
		this.onDone();
	};

	resetToDefaultSettings = () => {
		if (!this.draft) return;
		const today = timeProvider.today();
		this.draft.viewPrefs = {
			showSaturday: true,
			showSunday: true,
			showNonCurrentWeekCourses: true
		};

		if (this.draft.importMetadata.source === TimetableImportSource.ONLINE_EDU) {
			const applied = applyCampusPeriodTimes(this.draft, DEFAULT_CQUT_CAMPUS_ID);
			this.missingCampusMessage = applied ? null : '请重新导入课表以获取该校区节次时间';
			if (!applied) {
				this.draft.academicConfig = {
					...this.draft.academicConfig,
					termStartDate: currentWeekMonday(today),
					periodTimes: defaultPeriodTimes().map((period) => ({ ...period }))
				};
			}
			return;
		}

		this.draft.academicConfig = {
			...this.draft.academicConfig,
			termStartDate: currentWeekMonday(today),
			periodTimes: defaultPeriodTimes().map((period) => ({ ...period }))
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
			editor.missingCampusMessage = null;
			loadedTimetableId = null;
			return;
		}
		if (loadedTimetableId === timetable.id) return;
		loadedTimetableId = timetable.id;
		editor.draft = toSettingsDraft(timetable);
		ensureOnlineCampusMetadata(editor.draft);
		editor.missingCampusMessage = null;
	});

	return editor;
}

export type TimetableDetailsController = TimetableDetailsEditor;
