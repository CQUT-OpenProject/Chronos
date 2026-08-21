import type { AppShellController } from '$lib/app/app-shell.svelte';
import type { TimetableSettingsDraft } from '$lib/models/drafts';
import type { Timetable } from '@chronos/core';
import { trackEvent } from '$lib/client/analytics';
import { toSettingsDraft } from '$lib/timetable/timetable-mappers';
import { getAppController } from '$lib/services/app-engine';
import { currentWeekMonday, todayIsoDate } from '@chronos/core';
import { defaultPeriodTimes } from '$lib/models/defaults';

export class TimetableDetailsEditor {
	draft = $state<TimetableSettingsDraft | null>(null);
	private loadedTimetableId = $state<string | null>(null);

	constructor(
		private shell: AppShellController,
		private onDone: () => void
	) {}

	loadFromTimetable(timetable: Timetable | null) {
		if (!timetable) {
			this.draft = null;
			this.loadedTimetableId = null;
			return;
		}
		if (this.loadedTimetableId === timetable.id) return;
		this.loadedTimetableId = timetable.id;
		this.draft = toSettingsDraft(timetable);
	}

	get canSave() {
		return Boolean(this.draft);
	}

	save = async () => {
		const timetable = this.shell.controller.currentTimetable;
		if (!timetable || !this.draft) return;
		const controller = getAppController();
		await controller.saveCurrentTimetableDetails({
			name: this.draft.name,
			academicConfig: this.draft.academicConfig,
			viewPrefs: this.draft.viewPrefs,
			importMetadata: this.draft.importMetadata?.source
				? {
						source: this.draft.importMetadata.source,
						campusId: this.draft.importMetadata.campusId
					}
				: undefined
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
		const today = todayIsoDate();
		this.draft.viewPrefs = {
			showSaturday: true,
			showSunday: true,
			showNonCurrentWeekCourses: true
		};

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
