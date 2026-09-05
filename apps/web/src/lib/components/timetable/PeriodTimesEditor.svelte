<script lang="ts">
	import { tick } from 'svelte';
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { PeriodTimeDraft } from '$lib/models/drafts';
	import { defaultPeriodTimes } from '$lib/models/defaults';
	import { getAppController } from '$lib/services/app-engine';
	import { removePeriodAt, reindexPeriodTimes } from '$lib/timetable/timetable-mappers';
	import {
		countCoursesAffectedByPeriodDelete,
		hasRoomForNextPeriod,
		periodDurationMinutes,
		suggestNextPeriodTime,
		validatePeriodTimes,
		type PeriodProblem
	} from '$lib/timetable/period-times';
	import { countDistinctCourseNames, countDistinctHiddenCourses } from '@chronos/core';
	import { formatTimeValue, parseTimeValue, type TimeValue } from '@chronos/ui-kit';
	import Button from '$lib/components/ui/Button.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import IconButton from '$lib/components/ui/IconButton.svelte';
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';
	import TimeWheel from '$lib/components/ui/TimeWheel.svelte';
	import { Refresh } from '$lib/icons';

	let {
		value = $bindable([])
	}: {
		value?: PeriodTimeDraft[];
	} = $props();

	const controller = getAppController();
	const courses = $derived(controller.currentTimetable?.courses ?? []);

	let editPos = $state<number | null>(null);
	let editOpen = $state(false);
	let editDraft = $state<{ start: TimeValue; end: TimeValue }>({
		start: { hour: 0, minute: 0 },
		end: { hour: 0, minute: 0 }
	});
	let wheelStart: TimeWheel | null = $state(null);
	let wheelEnd: TimeWheel | null = $state(null);
	let pendingDeletePos = $state<number | null>(null);
	let deleteConfirmOpen = $state(false);
	let resetConfirmOpen = $state(false);

	const problems = $derived(validatePeriodTimes(value));
	const problemByIndex = $derived.by(() => {
		const map = new Map<number, PeriodProblem>();
		// First problem wins: invalid-range is reported before overlaps,
		// so a dirty row never hides behind an overlap implicating a neighbor.
		for (const problem of problems) {
			if (!map.has(problem.index)) map.set(problem.index, problem);
		}
		return map;
	});
	const isDefault = $derived.by(() => {
		const defaults = defaultPeriodTimes();
		return (
			value.length === defaults.length &&
			value.every(
				(period, i) =>
					period.startTime === defaults[i]?.startTime && period.endTime === defaults[i]?.endTime
			)
		);
	});

	const editPeriod = $derived(editPos !== null ? (value[editPos] ?? null) : null);
	const editMinutes = $derived.by(() => {
		if (!editPeriod) return null;
		const minutes = periodDurationMinutes({
			startTime: formatTimeValue(editDraft.start),
			endTime: formatTimeValue(editDraft.end)
		});
		return minutes === undefined
			? null
			: hostT('timetable.details.periods.duration', { count: minutes });
	});
	const editTitle = $derived(
		editPeriod
			? editMinutes
				? `${hostT('timetable.details.periods.label', { index: editPeriod.index })} · ${editMinutes}`
				: hostT('timetable.details.periods.label', { index: editPeriod.index })
			: ''
	);

	function problemLabel(problem: PeriodProblem): string {
		return problem.kind === 'overlap' && problem.withIndex !== undefined
			? hostT('timetable.details.periods.overlap', { index: problem.withIndex })
			: hostT('timetable.details.periods.invalidEnd');
	}

	function addPeriod() {
		if (!hasRoomForNextPeriod(value)) return;
		value = [...value, { index: value.length + 1, ...suggestNextPeriodTime(value) }];
	}

	const canAddPeriod = $derived(hasRoomForNextPeriod(value));
	// Courses are only hidden, never deleted: surface the count so a trimmed
	// timetable never looks like data loss. Re-adding periods restores them.
	const hiddenCourseCount = $derived(countDistinctHiddenCourses(courses, value.length));

	async function openEdit(pos: number) {
		const period = value[pos];
		if (!period) return;
		editPos = pos;
		editDraft = {
			start: parseTimeValue(period.startTime) ?? { hour: 0, minute: 0 },
			end: parseTimeValue(period.endTime) ?? { hour: 0, minute: 0 }
		};
		editOpen = true;
		await tick();
		wheelStart?.scrollToValue();
		wheelEnd?.scrollToValue();
	}

	function confirmEdit() {
		if (editPos === null) return;
		const pos = editPos;
		value = value.map((period, i) =>
			i === pos
				? {
						...period,
						startTime: formatTimeValue(editDraft.start),
						endTime: formatTimeValue(editDraft.end)
					}
				: period
		);
		editOpen = false;
		editPos = null;
	}

	function deleteFromSheet() {
		if (editPos === null) return;
		const pos = editPos;
		editOpen = false;
		editPos = null;
		requestDelete(pos);
	}

	function requestDelete(pos: number) {
		const period = value[pos];
		if (!period) return;
		if (countCoursesAffectedByPeriodDelete(courses, period.index) === 0) {
			confirmDelete(pos);
			return;
		}
		pendingDeletePos = pos;
		deleteConfirmOpen = true;
	}

	function confirmDelete(pos: number) {
		value = reindexPeriodTimes(removePeriodAt(value, pos));
		pendingDeletePos = null;
		deleteConfirmOpen = false;
	}

	function confirmReset() {
		value = defaultPeriodTimes().map((period) => ({ ...period }));
		resetConfirmOpen = false;
	}

	const pendingDeletePeriod = $derived(
		pendingDeletePos !== null ? (value[pendingDeletePos] ?? null) : null
	);
	const pendingDeleteCount = $derived(
		pendingDeletePeriod ? countCoursesAffectedByPeriodDelete(courses, pendingDeletePeriod.index) : 0
	);
	const wheelLabels = $derived({
		placeholder: '',
		hour: hostT('ui.time.hour'),
		minute: hostT('ui.time.minute'),
		cancel: '',
		confirm: '',
		triggerEmpty: () => '',
		triggerLabeled: () => '',
		columnAria: (fieldLabel: string, column: string) =>
			hostT('ui.time.column', { label: fieldLabel, column })
	});
</script>

<div class="flex flex-col gap-2.5">
	<div class="flex items-center justify-between px-1">
		<h3 class="text-title-medium">
			{hostT('timetable.details.periods.heading')}
		</h3>
		<div class="flex items-center gap-1">
			<IconButton
				variant="standard"
				size="sm"
				ariaLabel={hostT('timetable.details.periods.reset')}
				disabled={isDefault}
				onclick={() => (resetConfirmOpen = true)}
			>
				<Refresh class="size-5" />
			</IconButton>
			<Button
				variant="text"
				class="px-2"
				disabled={!canAddPeriod}
				title={!canAddPeriod ? hostT('timetable.details.periods.dayFull') : undefined}
				onclick={addPeriod}
			>
				{hostT('timetable.details.periods.add')}
			</Button>
		</div>
	</div>

	<div class="divide-y divide-outline-variant/40 rounded-3xl border border-border/60 bg-surface">
		{#each value as period, pos (period.index)}
			{@const problem = problemByIndex.get(period.index)}
			<button
				type="button"
				class="flex w-full cursor-pointer items-center gap-3 px-4 py-3.5 text-left"
				aria-label={hostT('timetable.details.periods.label', { index: period.index })}
				onclick={() => void openEdit(pos)}
			>
				<span class="text-body-large min-w-0 flex-1 text-on-surface">
					{hostT('timetable.details.periods.label', { index: period.index })}
				</span>
				{#if problem}
					<span class="text-body-medium shrink-0 text-error">{problemLabel(problem)}</span>
				{:else}
					<span class="flex shrink-0 items-center gap-1.5 tabular-nums">
						<span
							class="text-body-large rounded-xl bg-surface-container px-3 py-1.5 text-on-surface"
						>
							{period.startTime}
						</span>
						<span class="text-body-medium text-on-surface-variant" aria-hidden="true">-</span>
						<span
							class="text-body-large rounded-xl bg-surface-container px-3 py-1.5 text-on-surface"
						>
							{period.endTime}
						</span>
					</span>
				{/if}
			</button>
		{/each}
	</div>

	{#if hiddenCourseCount > 0}
		<div class="flex items-center justify-between gap-2 px-1">
			<p class="text-body-small text-on-surface-variant">
				{hostT('timetable.details.periods.hiddenHint', { count: hiddenCourseCount })}
			</p>
			<Button variant="text" class="shrink-0 px-2" disabled={!canAddPeriod} onclick={addPeriod}>
				{hostT('timetable.details.periods.add')}
			</Button>
		</div>
	{/if}
</div>

<BottomSheet bind:open={editOpen} title={editTitle}>
	<div class="flex flex-col gap-3 px-4 pt-1 pb-2">
		<div class="flex flex-col gap-1">
			<span class="text-label-small px-1 text-on-surface-variant">
				{hostT('timetable.details.period.start')}
			</span>
			<TimeWheel
				bind:this={wheelStart}
				bind:value={editDraft.start}
				label={hostT('timetable.details.period.start')}
				labels={wheelLabels}
				idPrefix="period-edit-start"
			/>
		</div>
		<div class="border-t border-outline" aria-hidden="true"></div>
		<div class="flex flex-col gap-1">
			<span class="text-label-small px-1 text-on-surface-variant">
				{hostT('timetable.details.period.end')}
			</span>
			<TimeWheel
				bind:this={wheelEnd}
				bind:value={editDraft.end}
				label={hostT('timetable.details.period.end')}
				labels={wheelLabels}
				idPrefix="period-edit-end"
			/>
		</div>
	</div>

	<div class="flex items-center justify-between gap-2 px-4 pb-2">
		<button
			type="button"
			class="text-label-large h-11 rounded-full px-5 text-error hover:bg-error/10 active:bg-error/20"
			onclick={deleteFromSheet}
		>
			{hostT('timetable.details.periods.deleteConfirm')}
		</button>
		<div class="flex items-center gap-2">
			<button
				type="button"
				class="text-label-large h-11 rounded-full px-5 text-on-surface-variant hover:bg-on-surface/5 active:bg-on-surface/10"
				onclick={() => {
					editOpen = false;
					editPos = null;
				}}
			>
				{hostT('common.cancel')}
			</button>
			<button
				type="button"
				class="text-label-large h-11 rounded-full bg-brand px-6 text-on-primary hover:shadow-xs active:opacity-90"
				onclick={confirmEdit}
			>
				{hostT('common.confirm')}
			</button>
		</div>
	</div>
</BottomSheet>

<Dialog
	bind:open={resetConfirmOpen}
	title={hostT('timetable.details.periods.resetTitle')}
	description={hostT('timetable.details.periods.resetDesc', {
		count: countDistinctCourseNames(courses)
	})}
>
	{#snippet footer()}
		<Button variant="text" onclick={() => (resetConfirmOpen = false)}>
			{hostT('common.cancel')}
		</Button>
		<Button variant="filled" onclick={confirmReset}>
			{hostT('common.confirm')}
		</Button>
	{/snippet}
</Dialog>

{#if pendingDeletePeriod}
	<Dialog
		bind:open={deleteConfirmOpen}
		onOpenChange={(next) => {
			if (!next) pendingDeletePos = null;
		}}
		title={hostT('timetable.details.periods.deleteTitle', {
			index: pendingDeletePeriod.index
		})}
		description={hostT('timetable.details.periods.deleteDesc', { count: pendingDeleteCount })}
	>
		{#snippet footer()}
			<Button
				variant="text"
				onclick={() => {
					deleteConfirmOpen = false;
					pendingDeletePos = null;
				}}
			>
				{hostT('common.cancel')}
			</Button>
			<Button
				variant="filled"
				onclick={() => pendingDeletePos !== null && confirmDelete(pendingDeletePos)}
			>
				{hostT('timetable.details.periods.deleteConfirm')}
			</Button>
		{/snippet}
	</Dialog>
{/if}
