<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { CourseEditorController } from '$lib/timetable/course-editor.svelte';
	import { COURSE_REMARK_MAX_LENGTH } from '@chronos/core';
	import FormCard from '$lib/components/ui/FormCard.svelte';
	import StepperField from '$lib/components/ui/StepperField.svelte';
	import TextField from '$lib/components/ui/TextField.svelte';

	let {
		editor,
		maxPeriods = 10
	}: {
		editor: CourseEditorController;
		maxPeriods?: number;
	} = $props();

	const draft = $derived(editor.draft);
	const optionalPlaceholder = $derived(hostT('course.form.optional'));

	function handleStartPeriodChange(value: number) {
		if (!draft) return;
		draft.endPeriod = Math.max(draft.endPeriod, value);
	}
</script>

{#if draft}
	<div class="space-y-4">
		<FormCard>
			<TextField label={hostT('course.form.name')} bind:value={draft.name} />
			<TextField
				label={hostT('course.form.teacher')}
				placeholder={optionalPlaceholder}
				autocomplete="name"
				bind:value={draft.teacher}
			/>
			<TextField
				label={hostT('course.form.location')}
				placeholder={optionalPlaceholder}
				autocomplete="address-line1"
				bind:value={draft.location}
			/>
			<TextField
				label={hostT('course.form.remark')}
				multiline
				rows={3}
				placeholder={optionalPlaceholder}
				autocomplete="off"
				maxlength={COURSE_REMARK_MAX_LENGTH}
				bind:value={draft.remark}
			/>
		</FormCard>

		<FormCard>
			<StepperField
				label={hostT('course.form.dayOfWeek')}
				bind:value={draft.dayOfWeek}
				min={1}
				max={7}
				embedded
			/>
			<StepperField
				label={hostT('course.form.startPeriod')}
				bind:value={draft.startPeriod}
				min={1}
				max={maxPeriods}
				embedded
				onchange={handleStartPeriodChange}
			/>
			<StepperField
				label={hostT('course.form.endPeriod')}
				bind:value={draft.endPeriod}
				min={draft.startPeriod}
				max={maxPeriods}
				embedded
			/>
		</FormCard>
	</div>
{/if}
