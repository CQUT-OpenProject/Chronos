<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { TimetableDetailsController } from '$lib/timetable/timetable-details.svelte';
	import FormCard from '$lib/components/ui/FormCard.svelte';
	import DateField from '$lib/components/ui/DateField.svelte';
	import StepperField from '$lib/components/ui/StepperField.svelte';
	import TextField from '$lib/components/ui/TextField.svelte';
	import PeriodTimesEditor from '$lib/components/timetable/PeriodTimesEditor.svelte';

	let {
		editor
	}: {
		editor: TimetableDetailsController;
	} = $props();

	const draft = $derived(editor.draft);

	/** Align with `MAX_TIMETABLE_WEEK` in `@chronos/codec-kit`. */
	const MAX_TOTAL_WEEKS = 32;
</script>

{#if draft}
	{@const totalWeeks = Math.max(
		1,
		draft.academicConfig.endWeek - draft.academicConfig.startWeek + 1
	)}
	{@const totalWeeksMax = Math.max(MAX_TOTAL_WEEKS, totalWeeks)}
	<div class="space-y-4">
		<FormCard>
			<TextField
				label={hostT('timetable.details.name')}
				autocomplete="name"
				bind:value={draft.name}
			/>
			<DateField
				label={hostT('timetable.details.termStart')}
				bind:value={draft.academicConfig.termStartDate}
			/>
			<StepperField
				label={hostT('timetable.details.totalWeeks')}
				value={totalWeeks}
				min={1}
				max={totalWeeksMax}
				embedded
				onchange={(total) => {
					draft.academicConfig.endWeek = draft.academicConfig.startWeek + total - 1;
				}}
			/>
		</FormCard>

		<PeriodTimesEditor bind:value={draft.academicConfig.periodTimes} />
	</div>
{/if}
