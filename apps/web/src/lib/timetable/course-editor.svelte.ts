import type { AppShellController } from '$lib/app/app-shell.svelte';
import { trackEvent } from '$lib/client/analytics';
import type { CourseDraft } from '$lib/models/drafts';
import { courseToDraft } from '$lib/timetable/timetable-mappers';
import { getAppController } from '$lib/services/app-engine';
import { createCourse } from '@chronos/core';

function emptyDraft(): CourseDraft {
	return {
		name: '',
		teacher: '',
		location: '',
		dayOfWeek: 1,
		startPeriod: 1,
		endPeriod: 1,
		color: '#EADDFF',
		textColor: '#21005D',
		weeks: [],
		remark: ''
	};
}

export function createCourseEditor(
	shell: AppShellController,
	getCourseId: () => string | null,
	onDone: () => void
) {
	let draft = $state<CourseDraft | null>(null);
	let syncedCourseKey = $state<string | null>(null);
	const controller = getAppController();

	const timetable = $derived(shell.state.appState.currentTimetable);
	const canSave = $derived(Boolean(draft?.name.trim()));
	const coursePalette = $derived(shell.appearance.coursePalette);

	function syncFromRoute() {
		const courseId = getCourseId();
		const key = courseId ?? '__new__';
		if (syncedCourseKey === key) return;
		syncedCourseKey = key;
		if (!courseId) {
			draft = emptyDraft();
			return;
		}
		const course = shell.state.appState.currentTimetable?.courses.find(
			(entry) => entry.id === courseId
		);
		draft = course ? courseToDraft(course) : null;
	}

	async function save() {
		if (!timetable || !draft) return;
		const course = createCourse({
			id: draft.id || `c_${Date.now()}`,
			name: draft.name,
			teacher: draft.teacher,
			location: draft.location,
			dayOfWeek: draft.dayOfWeek,
			startPeriod: draft.startPeriod,
			endPeriod: draft.endPeriod,
			color: draft.color,
			textColor: draft.textColor,
			weeks: draft.weeks,
			remark: draft.remark
		});
		await controller.saveCourse(course);
		trackEvent('course_save');
		onDone();
	}

	async function deleteCourse() {
		if (!draft?.id) return;
		await controller.deleteCourse(draft.id);
		trackEvent('course_delete');
		onDone();
	}

	return {
		get draft() {
			return draft;
		},
		get timetable() {
			return timetable;
		},
		get canSave() {
			return canSave;
		},
		get coursePalette() {
			return coursePalette;
		},
		save,
		deleteCourse,
		syncFromRoute
	};
}

export type CourseEditorController = ReturnType<typeof createCourseEditor>;
