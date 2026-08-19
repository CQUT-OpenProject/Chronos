import type { AppShellController } from '$lib/app/app-shell.svelte';
import { DEFAULT_CQUT_CAMPUS_ID, type CqutCampusId } from '$lib/models/cqut-campus';
import type { TimetableSettingsDraft } from '$lib/models/drafts';
import { currentWeekMonday, defaultPeriodTimes } from '$lib/models/defaults';
import { TimetableImportSource, type Timetable } from '$lib/models/timetable';
import { SystemTimeProvider } from '$lib/domain/services/time-provider';
import { trackEvent } from '$lib/client/analytics';
import { applyCampusPeriodTimes, toSettingsDraft } from '$lib/timetable/timetable-mappers';
import { getAppController } from '$lib/services/app-engine';

const timeProvider = new SystemTimeProvider();

export class TimetableDetailsEditor {
	draft = $state<TimetableSettingsDraft | null>(null);
	missingCampusMessage = $state<string | null>(null);
	private loadedTimetableId = $state<string | null>(null);

	constructor(
		private shell: AppShellController,
		private onDone: () => void
	) {}

	loadFromTimetable(timetable: Timetable | null) {
		if (!timetable) {
			this.draft = null;
			this.missingCampusMessage = null;
			this.loadedTimetableId = null;
			return;
		}
		if (this.loadedTimetableId === timetable.id) return;
		this.loadedTimetableId = timetable.id;
		this.draft = toSettingsDraft(timetable);
		this.missingCampusMessage = null;
	}

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
		const controller = getAppController();
		await controller.saveCurrentTimetableDetails({
			name: this.draft.name,
			academicConfig: this.draft.academicConfig,
			viewPrefs: this.draft.viewPrefs
		});
		trackEvent('timetable_details_save');
		this.onDone();
	};

	private resetAcademicConfigToDefaults(today: string) {
		if (!this.draft) return;
		this.draft.academicConfig = {
			...this.draft.academicConfig,
			termStartDate: currentWeekMonday(today),
			periodTimes: defaultPeriodTimes().map((period) => ({ ...period }))
		};
	}

	resetToDefaultSettings = () => {
		if (!this.draft) return;
		trackEvent('timetable_details_reset');
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
				this.resetAcademicConfigToDefaults(today);
			}
			return;
		}

		this.resetAcademicConfigToDefaults(today);
	};
}

export function createTimetableDetailsEditor(
	shell: AppShellController,
	onDone: () => void
): TimetableDetailsEditor {
	return new TimetableDetailsEditor(shell, onDone);
}

export type TimetableDetailsController = TimetableDetailsEditor;
