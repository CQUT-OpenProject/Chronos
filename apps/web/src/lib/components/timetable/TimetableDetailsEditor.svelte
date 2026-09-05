<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { TimetableDetailsController } from '$lib/timetable/timetable-details.svelte';
	import FormCard from '$lib/components/ui/FormCard.svelte';
	import DateField from '$lib/components/ui/DateField.svelte';
	import StepperField from '$lib/components/ui/StepperField.svelte';
	import Switch from '$lib/components/ui/Switch.svelte';
	import TextField from '$lib/components/ui/TextField.svelte';
	import PeriodTimesEditor from '$lib/components/timetable/PeriodTimesEditor.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';

	let {
		editor
	}: {
		editor: TimetableDetailsController;
	} = $props();

	const draft = $derived(editor.draft);
</script>

{#if draft}
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
				value={Math.max(1, draft.academicConfig.endWeek - draft.academicConfig.startWeek + 1)}
				min={1}
				max={30}
				embedded
				onchange={(total) => {
					draft.academicConfig.endWeek = draft.academicConfig.startWeek + total - 1;
				}}
			/>
		</FormCard>

		<MineSection title={hostT('timetable.details.section.display')}>
			<MineRow label title={hostT('timetable.details.showSaturday')}>
				{#snippet trailing()}
					<Switch bind:checked={draft.viewPrefs.showSaturday} />
				{/snippet}
			</MineRow>
			<MineRow label title={hostT('timetable.details.showSunday')}>
				{#snippet trailing()}
					<Switch bind:checked={draft.viewPrefs.showSunday} />
				{/snippet}
			</MineRow>
			<MineRow label title={hostT('timetable.details.showNonCurrentWeek')}>
				{#snippet trailing()}
					<Switch bind:checked={draft.viewPrefs.showNonCurrentWeekCourses} />
				{/snippet}
			</MineRow>
		</MineSection>

		<PeriodTimesEditor bind:value={draft.academicConfig.periodTimes} />
	</div>
{/if}
