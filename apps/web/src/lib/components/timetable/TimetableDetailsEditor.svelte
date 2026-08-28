<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { TimetableDetailsController } from '$lib/timetable/timetable-details.svelte';
	import { defaultPeriodTimes } from '$lib/models/defaults';
	import { removePeriodAt, reindexPeriodTimes } from '$lib/timetable/timetable-mappers';
	import Button from '$lib/components/ui/Button.svelte';
	import FormCard from '$lib/components/ui/FormCard.svelte';
	import IconButton from '$lib/components/ui/IconButton.svelte';
	import DateField from '$lib/components/ui/DateField.svelte';
	import TimeField from '$lib/components/ui/TimeField.svelte';
	import StepperField from '$lib/components/ui/StepperField.svelte';
	import Switch from '$lib/components/ui/Switch.svelte';
	import TextField from '$lib/components/ui/TextField.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import { DeleteFill } from '$lib/icons';

	let {
		editor
	}: {
		editor: TimetableDetailsController;
	} = $props();

	const draft = $derived(editor.draft);

	const showTermStart = $derived(Boolean(draft));
	const showWeekRange = $derived(Boolean(draft));
	const showNonCurrentWeek = $derived(Boolean(draft));

	function addPeriod() {
		if (!draft) return;
		const defaults = defaultPeriodTimes();
		const nextIndex = draft.academicConfig.periodTimes.length + 1;
		const template = defaults[nextIndex - 1] ?? defaults.at(-1)!;
		draft.academicConfig.periodTimes = [
			...draft.academicConfig.periodTimes,
			{
				index: nextIndex,
				startTime: template.startTime,
				endTime: template.endTime
			}
		];
	}

	function removePeriod(index: number) {
		if (!draft) return;
		draft.academicConfig.periodTimes = reindexPeriodTimes(
			removePeriodAt(draft.academicConfig.periodTimes, index)
		);
	}
</script>

{#if draft}
	<div class="space-y-4">
		<FormCard>
			<TextField
				label={hostT('timetable.details.name')}
				autocomplete="name"
				bind:value={draft.name}
			/>
			{#if showTermStart}
				<DateField
					label={hostT('timetable.details.termStart')}
					bind:value={draft.academicConfig.termStartDate}
				/>
			{/if}
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
			{#if showNonCurrentWeek}
				<MineRow label title={hostT('timetable.details.showNonCurrentWeek')}>
					{#snippet trailing()}
						<Switch bind:checked={draft.viewPrefs.showNonCurrentWeekCourses} />
					{/snippet}
				</MineRow>
			{/if}
		</MineSection>

		{#if showWeekRange}
			<FormCard>
				<StepperField
					label={hostT('timetable.details.startWeek')}
					bind:value={draft.academicConfig.startWeek}
					min={1}
					embedded
				/>
				<StepperField
					label={hostT('timetable.details.endWeek')}
					bind:value={draft.academicConfig.endWeek}
					min={draft.academicConfig.startWeek}
					embedded
				/>
			</FormCard>
		{/if}

		<div class="flex flex-col gap-2.5">
			<div class="flex items-center justify-between px-1">
				<h3 class="m3-title-medium">
					{hostT('timetable.details.periods.heading')}
				</h3>
				<Button variant="text" class="px-2" onclick={addPeriod}>
					{hostT('timetable.details.periods.add')}
				</Button>
			</div>
			{#each draft.academicConfig.periodTimes as period, index (period.index)}
				<FormCard>
					<div class="flex items-center justify-between px-4 py-2">
						<span class="m3-body-medium text-on-surface-variant">
							{hostT('timetable.details.periods.label', {
								index: period.index
							})}
						</span>
						<IconButton
							variant="danger"
							size="sm"
							class="!size-8"
							ariaLabel={hostT('timetable.details.periods.deleteAria', {
								index: period.index
							})}
							onclick={() => removePeriod(index)}
						>
							<DeleteFill class="size-5" />
						</IconButton>
					</div>
					<div class="grid grid-cols-2">
						<TimeField
							label={hostT('timetable.details.period.start')}
							bind:value={period.startTime}
						/>
						<TimeField label={hostT('timetable.details.period.end')} bind:value={period.endTime} />
					</div>
				</FormCard>
			{/each}
		</div>
	</div>
{/if}
