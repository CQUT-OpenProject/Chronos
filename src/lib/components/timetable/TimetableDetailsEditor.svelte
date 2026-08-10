<script lang="ts">
	import type { TimetableDetailsController } from '$lib/timetable/timetable-details.svelte';
	import type { CqutCampusId } from '$lib/models/cqut-campus';
	import { defaultPeriodTimes } from '$lib/models/defaults';
	import {
		removePeriodAt,
		reindexPeriodTimes,
		shouldShowAcademicWeekRangeSettings,
		shouldShowNonCurrentWeekCourseSetting,
		shouldShowTermStartDateSetting,
		shouldUseOnlineCampusPeriodTimes
	} from '$lib/timetable/timetable-mappers';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import OnlineCampusPeriodSection from '$lib/components/timetable/OnlineCampusPeriodSection.svelte';
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

	const showTermStart = $derived(
		draft ? shouldShowTermStartDateSetting(draft.importMetadata.source) : false
	);
	const showWeekRange = $derived(
		draft ? shouldShowAcademicWeekRangeSettings(draft.importMetadata.source) : false
	);
	const showNonCurrentWeek = $derived(
		draft ? shouldShowNonCurrentWeekCourseSetting(draft.importMetadata.source) : false
	);
	const useOnlineCampusPeriods = $derived(
		draft ? shouldUseOnlineCampusPeriodTimes(draft.importMetadata.source) : false
	);
	const selectedCampus = $derived(editor.selectedCampus);
	const missingCampusMessage = $derived(editor.missingCampusMessage);

	function addPeriod() {
		if (!draft) return;
		const defaults = defaultPeriodTimes();
		const nextIndex = draft.academicConfig.periodTimes.length + 1;
		const template = defaults[nextIndex - 1] ?? defaults.at(-1)!;
		editor.draft!.academicConfig.periodTimes = [
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
		editor.draft!.academicConfig.periodTimes = reindexPeriodTimes(
			removePeriodAt(draft.academicConfig.periodTimes, index)
		);
	}

	function selectCampus(campusId: CqutCampusId) {
		editor.selectCampus(campusId);
	}
</script>

{#if draft}
	<div class="space-y-4">
		<TextField label="课表名称" bind:value={editor.draft.name} />

		<MineSection title="显示选项">
			<MineRow label title="显示周六">
				{#snippet trailing()}
					<Switch bind:checked={editor.draft.viewPrefs.showSaturday} />
				{/snippet}
			</MineRow>
			<MineRow label title="显示周日">
				{#snippet trailing()}
					<Switch bind:checked={editor.draft.viewPrefs.showSunday} />
				{/snippet}
			</MineRow>
			{#if showNonCurrentWeek}
				<MineRow label title="显示非本周课程">
					{#snippet trailing()}
						<Switch bind:checked={editor.draft.viewPrefs.showNonCurrentWeekCourses} />
					{/snippet}
				</MineRow>
			{/if}
		</MineSection>

		{#if showTermStart}
			<TextField
				label="学期起始日（周一）"
				type="date"
				bind:value={editor.draft.academicConfig.termStartDate}
			/>
		{/if}

		{#if showWeekRange}
			<StepperField label="开始周" bind:value={editor.draft.academicConfig.startWeek} min={1} />
			<StepperField
				label="结束周"
				bind:value={editor.draft.academicConfig.endWeek}
				min={editor.draft.academicConfig.startWeek}
			/>
		{/if}

		{#if useOnlineCampusPeriods && selectedCampus}
			<OnlineCampusPeriodSection
				{selectedCampus}
				{missingCampusMessage}
				onSelectCampus={selectCampus}
			/>
		{:else}
			<div class="flex flex-col gap-2.5">
				<div class="flex items-center justify-between px-1">
					<h3 class="m3-title-medium">节次时间</h3>
					<Button variant="text" class="px-2" onclick={addPeriod}>添加节次</Button>
				</div>
				{#each editor.draft.academicConfig.periodTimes as period, index (period.index)}
					<Card variant="outlined" class="!p-3">
						<div class="mb-2 flex items-center justify-between">
							<span class="m3-body-medium text-on-surface-variant">第 {period.index} 节</span>
							<button
								type="button"
								class="flex size-8 shrink-0 items-center justify-center rounded-full text-error transition-colors hover:bg-error/10 active:bg-error/20"
								aria-label={`删除第 ${period.index} 节`}
								onclick={() => removePeriod(index)}
							>
								<DeleteFill class="size-5" />
							</button>
						</div>
						<div class="grid grid-cols-2 gap-2">
							<TextField label="开始" type="time" bind:value={period.startTime} />
							<TextField label="结束" type="time" bind:value={period.endTime} />
						</div>
					</Card>
				{/each}
			</div>
		{/if}
	</div>
{/if}
