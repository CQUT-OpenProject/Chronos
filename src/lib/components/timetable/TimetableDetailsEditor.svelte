<script lang="ts">
	import type { TimetableSettingsDraft } from '$lib/models/drafts';
	import { currentWeekMonday, defaultPeriodTimes } from '$lib/models/defaults';
	import {
		removePeriodAt,
		reindexPeriodTimes,
		replacePeriodAt,
		shouldShowAcademicWeekRangeSettings,
		shouldShowNonCurrentWeekCourseSetting,
		shouldShowTermStartDateSetting
	} from '$lib/timetable/timetable-mappers';

	let {
		draft = $bindable(),
		onSave
	}: {
		draft: TimetableSettingsDraft;
		onSave: () => void | Promise<void>;
	} = $props();

	const showTermStart = $derived(shouldShowTermStartDateSetting(draft.importMetadata.source));
	const showWeekRange = $derived(shouldShowAcademicWeekRangeSettings(draft.importMetadata.source));
	const showNonCurrentWeek = $derived(
		shouldShowNonCurrentWeekCourseSetting(draft.importMetadata.source)
	);

	function addPeriod() {
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
		draft.academicConfig.periodTimes = reindexPeriodTimes(
			removePeriodAt(draft.academicConfig.periodTimes, index)
		);
	}

	function updatePeriod(index: number, field: 'startTime' | 'endTime', value: string) {
		const current = draft.academicConfig.periodTimes[index];
		draft.academicConfig.periodTimes = replacePeriodAt(draft.academicConfig.periodTimes, index, {
			...current,
			[field]: value
		});
	}

	function resetToDefaultSettings() {
		const today = new Date().toISOString().slice(0, 10);
		draft.academicConfig = {
			...draft.academicConfig,
			termStartDate: currentWeekMonday(today),
			periodTimes: defaultPeriodTimes().map((period) => ({ ...period }))
		};
		draft.viewPrefs = {
			showSaturday: true,
			showSunday: true,
			showNonCurrentWeekCourses: true
		};
	}
</script>

<div class="space-y-4">
	<label class="block space-y-1">
		<span class="text-sm text-on-surface-variant">课表名称</span>
		<input
			class="w-full rounded-lg border border-outline px-3 py-2 text-sm dark:border-outline-variant dark:bg-surface-variant"
			bind:value={draft.name}
		/>
	</label>

	{#if showTermStart}
		<label class="block space-y-1">
			<span class="text-sm text-on-surface-variant">学期起始日（周一）</span>
			<input
				type="date"
				class="w-full rounded-lg border border-outline px-3 py-2 text-sm dark:border-outline-variant dark:bg-surface-variant"
				bind:value={draft.academicConfig.termStartDate}
			/>
		</label>
	{/if}

	{#if showWeekRange}
		<div class="grid grid-cols-2 gap-3">
			<label class="block space-y-1">
				<span class="text-sm text-on-surface-variant">开始周</span>
				<input
					type="number"
					min="1"
					class="w-full rounded-lg border border-outline px-3 py-2 text-sm dark:border-outline-variant dark:bg-surface-variant"
					bind:value={draft.academicConfig.startWeek}
				/>
			</label>
			<label class="block space-y-1">
				<span class="text-sm text-on-surface-variant">结束周</span>
				<input
					type="number"
					min="1"
					class="w-full rounded-lg border border-outline px-3 py-2 text-sm dark:border-outline-variant dark:bg-surface-variant"
					bind:value={draft.academicConfig.endWeek}
				/>
			</label>
		</div>
	{/if}

	<div class="space-y-2">
		<div class="flex items-center justify-between">
			<span class="text-sm font-medium">节次时间</span>
			<button type="button" class="text-sm text-brand dark:text-soft-blue" onclick={addPeriod}>
				添加节次
			</button>
		</div>
		{#each draft.academicConfig.periodTimes as period, index (period.index)}
			<div
				class="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-2 rounded-[18px] border border-outline px-2 py-1 dark:border-outline-variant"
			>
				<span class="text-sm text-on-surface-variant">第 {period.index} 节</span>
				<input
					class="rounded-lg border border-outline px-2 py-1 text-sm dark:border-outline-variant dark:bg-surface-variant"
					value={period.startTime}
					oninput={(event) =>
						updatePeriod(index, 'startTime', (event.currentTarget as HTMLInputElement).value)}
				/>
				<input
					class="rounded-lg border border-outline px-2 py-1 text-sm dark:border-outline-variant dark:bg-surface-variant"
					value={period.endTime}
					oninput={(event) =>
						updatePeriod(index, 'endTime', (event.currentTarget as HTMLInputElement).value)}
				/>
				<button type="button" class="text-sm text-danger" onclick={() => removePeriod(index)}>
					删
				</button>
			</div>
		{/each}
	</div>

	<div class="space-y-2">
		<label class="flex items-center gap-2 text-sm">
			<input type="checkbox" bind:checked={draft.viewPrefs.showSaturday} />
			显示周六
		</label>
		<label class="flex items-center gap-2 text-sm">
			<input type="checkbox" bind:checked={draft.viewPrefs.showSunday} />
			显示周日
		</label>
		{#if showNonCurrentWeek}
			<label class="flex items-center gap-2 text-sm">
				<input type="checkbox" bind:checked={draft.viewPrefs.showNonCurrentWeekCourses} />
				显示非本周课程
			</label>
		{/if}
	</div>

	<button
		type="button"
		class="w-full rounded-lg border border-outline px-3 py-2 text-sm dark:border-outline-variant"
		onclick={resetToDefaultSettings}
	>
		恢复所有设置
	</button>

	<button
		type="button"
		class="w-full rounded-lg bg-brand px-3 py-2 text-sm text-white disabled:opacity-50"
		disabled={!draft.name.trim()}
		onclick={() => onSave()}
	>
		保存
	</button>
</div>
