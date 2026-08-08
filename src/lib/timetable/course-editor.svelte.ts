import type { AppShellController } from '$lib/app/app-shell.svelte';
import type { CourseDraft } from '$lib/models/drafts';
import { courseToDraft } from '$lib/timetable/timetable-mappers';

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

	const timetable = $derived(shell.state.appState.currentTimetable);
	const canSave = $derived(Boolean(draft?.name.trim()));

	$effect(() => {
		const courseId = getCourseId();
		if (!courseId) {
			draft = emptyDraft();
			return;
		}
		const snapshot = shell.state.appState.currentTimetable;
		const course = snapshot?.courses.find((entry) => entry.id === courseId);
		draft = course ? courseToDraft(course) : null;
	});

	async function save() {
		if (!timetable || !draft) return;
		await shell.services.saveCourse.invoke(timetable.id, draft);
		onDone();
	}

	async function deleteCourse() {
		if (!draft?.id) return;
		await shell.services.deleteCourse.invoke(draft.id);
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
		save,
		deleteCourse
	};
}

export type CourseEditorController = ReturnType<typeof createCourseEditor>;
