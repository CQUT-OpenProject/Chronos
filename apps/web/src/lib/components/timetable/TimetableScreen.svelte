<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import { timetableDayLabel } from '$lib/timetable/day-labels';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { formatWeekDateRange, dayOfWeekFromIso } from '@chronos/core';
	import { getContext } from 'svelte';
	import TopAppBar from '$lib/components/TopAppBar.svelte';
	import { TimetableWallpaperLayer } from '@chronos/ui-kit';
	import { haptic } from '$lib/haptic/haptic';
	import TimetableWeekSwiper from './TimetableWeekSwiper.svelte';
	import TimetableCapsuleIndicator from './TimetableCapsuleIndicator.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import BottomSheet from '$lib/components/ui/BottomSheet.svelte';

	let {
		screen,
		active = true,
		onCourseClick
	}: {
		screen: TimetableScreenController;
		active?: boolean;
		onCourseClick: (courseId: string) => void;
	} = $props();

	const screenState = $derived(screen.state);
	const shell = getContext<AppShellController>('appShell');

	const startWeek = $derived(screenState.startWeek);
	const endWeek = $derived(screenState.endWeek);
	const coursePalette = $derived(shell.appearance.coursePalette);
	const hasDynamicColorBackground = $derived(shell.state.hasDynamicColorBackground);
	const dynamicColorUri = $derived(shell.state.dynamicColorUri);
	const layoutMode = $derived(shell.controller.userPreferences?.timetableLayoutMode ?? 'fixed');
	const capsuleCornerStyle = $derived(
		shell.controller.userPreferences?.capsuleCornerStyle ?? 'sharp'
	);

	const pendingWeekDelete = $derived(screen.pendingWeekDelete);
	const hasMultipleWeeks = $derived(startWeek < endWeek);
	let weekDeleteSheetOpen = $state(false);
	let pagerPreviewWeek = $state<number | null>(null);

	const displayedWeekNumber = $derived(screenState.displayedWeek);
	const weekRangeText = $derived(
		formatWeekDateRange(
			screenState.currentTimetable?.academicConfig,
			displayedWeekNumber,
			screenState.today,
			screenState.currentTimetable?.viewPrefs
		)
	);
	const headerTodayLabel = $derived(
		displayedWeekNumber === screenState.academicWeek
			? timetableDayLabel(dayOfWeekFromIso(screenState.today))
			: ''
	);
	const weekHeaderAriaLabel = $derived(
		hostT('timetable.week.headerAria', {
			week: displayedWeekNumber,
			range: weekRangeText
		})
	);
	const weekLabel = $derived(
		hostT('timetable.week.label', {
			week: displayedWeekNumber,
			today: headerTodayLabel ? ` ${headerTodayLabel}` : ''
		})
	);

	$effect(() => {
		if (pendingWeekDelete) weekDeleteSheetOpen = true;
	});

	function onHeaderClick() {
		haptic.light();
		screen.jumpToCurrentWeek();
	}

	function focusWeekIndicator() {
		if (!hasMultipleWeeks) return;
		requestAnimationFrame(() => {
			document.getElementById('week-indicator')?.focus();
		});
	}

	function onWeekHeaderKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || (event.key === 'Enter' && event.shiftKey)) {
			event.preventDefault();
			focusWeekIndicator();
			return;
		}

		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			onHeaderClick();
		}
	}

	function onWindowKeydown(event: KeyboardEvent) {
		if (event.key !== 'Escape' || !screenState.isEditing) return;
		if (event.defaultPrevented) return;
		const target = event.target;
		if (
			target instanceof Element &&
			target.closest('[data-dialog-content], [data-dialog-overlay]')
		) {
			return;
		}
		haptic.light();
		screen.setEditing(false);
	}

	$effect(() => {
		if (!active && screenState.isEditing) {
			screen.setEditing(false);
		}
	});

	let prevTimetableId = $state<string | undefined>(undefined);
	$effect(() => {
		const id = screenState.currentTimetable?.id;
		if (id === prevTimetableId) return;
		prevTimetableId = id;
		pagerPreviewWeek = null;
	});
</script>

<svelte:window onkeydown={active ? onWindowKeydown : undefined} />

<div class="relative flex h-[calc(100dvh-var(--bottom-bar-height))] flex-col">
	<TopAppBar class="shrink-0">
		{#snippet titleSnippet()}
			<button
				type="button"
				class="flex min-h-0 flex-1 cursor-pointer flex-col justify-center py-0.5 text-left select-none focus-visible:outline-none sm:py-1"
				aria-label={weekHeaderAriaLabel}
				aria-controls={hasMultipleWeeks ? 'week-indicator' : undefined}
				onclick={onHeaderClick}
				onkeydown={onWeekHeaderKeydown}
			>
				<div class="flex h-6 items-center sm:h-7">
					<p
						class="text-title-large truncate text-base leading-tight font-bold sm:text-lg md:text-xl"
					>
						{weekRangeText}
					</p>
				</div>
				<div class="flex h-4.5 items-center sm:h-5">
					<p
						class="text-body-medium truncate text-xs leading-tight text-on-surface-variant sm:text-sm"
					>
						{weekLabel}
					</p>
				</div>
			</button>
		{/snippet}
	</TopAppBar>

	<TimetableWallpaperLayer
		wallpaperUri={hasDynamicColorBackground ? dynamicColorUri : null}
		blurred={screenState.isEditing}
	>
		{#key screenState.currentTimetable?.id}
			<TimetableWeekSwiper
				{screen}
				{active}
				hasDynamicBackground={hasDynamicColorBackground}
				{coursePalette}
				{layoutMode}
				{capsuleCornerStyle}
				{onCourseClick}
				onPagerPreview={(week) => (pagerPreviewWeek = week)}
			/>
		{/key}
	</TimetableWallpaperLayer>

	{#if !screenState.isEditing && screenState.currentTimetable}
		<TimetableCapsuleIndicator {screen} {pagerPreviewWeek} />
	{/if}
</div>

{#if pendingWeekDelete}
	<BottomSheet
		bind:open={weekDeleteSheetOpen}
		showHandle={false}
		onOpenChangeComplete={(isOpen) => {
			if (!isOpen) screen.cancelWeekDelete();
		}}
		title={hostT('timetable.deleteWeek.title')}
		description={hostT('timetable.deleteWeek.desc', {
			name: pendingWeekDelete.course.name,
			week: pendingWeekDelete.week
		})}
	>
		{#snippet footer()}
			<Button variant="text" onclick={() => (weekDeleteSheetOpen = false)}>
				{hostT('common.cancel')}
			</Button>
			<Button variant="filled" onclick={() => void screen.confirmWeekDelete()}>
				{hostT('common.delete')}
			</Button>
		{/snippet}
	</BottomSheet>
{/if}
