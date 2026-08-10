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
	import FormCard from '$lib/components/ui/FormCard.svelte';
	import IconButton from '$lib/components/ui/IconButton.svelte';
	import OnlineCampusPeriodSection from '$lib/components/timetable/OnlineCampusPeriodSection.svelte';
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
		<FormCard>
			<TextField label="课表名称" autocomplete="name" bind:value={editor.draft.name} />
			{#if showTermStart}
				<DateField
					label="学期起始日（周一）"
					bind:value={editor.draft.academicConfig.termStartDate}
				/>
			{/if}
		</FormCard>

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

		{#if showWeekRange}
			<FormCard>
				<StepperField
					label="开始周"
					bind:value={editor.draft.academicConfig.startWeek}
					min={1}
					embedded
				/>
				<StepperField
					label="结束周"
					bind:value={editor.draft.academicConfig.endWeek}
					min={editor.draft.academicConfig.startWeek}
					embedded
				/>
			</FormCard>
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
					<FormCard>
						<div class="flex items-center justify-between px-4 py-2">
							<span class="m3-body-medium text-on-surface-variant">第 {period.index} 节</span>
							<IconButton
								variant="danger"
								size="sm"
								class="!size-8"
								ariaLabel={`删除第 ${period.index} 节`}
								onclick={() => removePeriod(index)}
							>
								<DeleteFill class="size-5" />
							</IconButton>
						</div>
						<div class="grid grid-cols-2">
							<TimeField label="开始" bind:value={period.startTime} />
							<TimeField label="结束" bind:value={period.endTime} />
						</div>
					</FormCard>
				{/each}
			</div>
		{/if}
	</div>
{/if}
