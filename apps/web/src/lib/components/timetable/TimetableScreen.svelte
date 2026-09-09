<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import { timetableDayLabel } from '$lib/timetable/day-labels';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { createWeekSliderGesture } from '$lib/timetable/week-slider-gesture.svelte';
	import { formatWeekDateRange, dayOfWeekFromIso } from '@chronos/core';
	import { getContext } from 'svelte';
	import TopAppBar from '$lib/components/TopAppBar.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import { TimetableWallpaperLayer } from '@chronos/ui-kit';
	import { haptic } from '$lib/haptic/haptic';
	import TimetableWeekSwiper from './TimetableWeekSwiper.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';

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

	const weekGesture = createWeekSliderGesture({
		getStartWeek: () => startWeek,
		getEndWeek: () => endWeek,
		getDisplayedWeek: () => screenState.displayedWeek,
		onWeekChange: (week) => screen.setDisplayedWeek(week),
		onJumpToCurrentWeek: () => screen.jumpToCurrentWeek()
	});

	const displayedWeekNumber = $derived(
		weekGesture.weekSliderVisible ? weekGesture.dragWeek : screenState.displayedWeek
	);
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
	const pendingWeekDelete = $derived(screen.pendingWeekDelete);
	const deleteWeekDialogOpen = $derived(pendingWeekDelete !== null);

	function focusWeekSliderThumb() {
		requestAnimationFrame(() => {
			const slider = document.getElementById('week-slider');
			const thumb = slider?.querySelector<HTMLElement>('[role="slider"]');
			thumb?.focus();
		});
	}

	function onWeekHeaderKeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || (event.key === 'Enter' && event.shiftKey)) {
			event.preventDefault();
			if (weekGesture.openWeekSlider()) {
				focusWeekSliderThumb();
			}
			return;
		}

		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			weekGesture.onHeaderTap();
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
</script>

<svelte:window
	onpointermove={active ? weekGesture.onWindowPointerMove : undefined}
	onpointerup={active ? weekGesture.onWindowPointerUp : undefined}
	onpointercancel={active ? weekGesture.onWindowPointerCancel : undefined}
	onkeydown={active ? onWindowKeydown : undefined}
/>

<div class="relative flex h-[calc(100dvh-var(--bottom-bar-height))] flex-col">
	<TopAppBar class="shrink-0">
		{#snippet titleSnippet()}
			<div
				bind:this={weekGesture.headerContainerEl}
				class="flex min-h-0 flex-1 cursor-pointer touch-none flex-col justify-center py-0.5 select-none sm:py-1"
				role="button"
				tabindex="0"
				aria-label={weekHeaderAriaLabel}
				aria-expanded={weekGesture.weekSliderVisible}
				aria-controls={weekGesture.weekSliderVisible ? 'week-slider' : undefined}
				onpointerdown={weekGesture.onPointerDown}
				onkeydown={onWeekHeaderKeydown}
				oncontextmenu={(event) => event.preventDefault()}
			>
				<div class="flex h-6 items-center sm:h-7">
					{#if weekGesture.weekSliderVisible && startWeek < endWeek}
						<Slider
							id="week-slider"
							ariaLabel={hostT('timetable.week.sliderAria')}
							bind:value={weekGesture.dragWeek}
							min={startWeek}
							max={endWeek}
							step={1}
							stops
							onValueChange={weekGesture.onSliderValueChange}
							onValueCommit={weekGesture.onSliderCommit}
						/>
					{:else}
						<p
							class="text-title-large truncate text-base leading-tight font-bold sm:text-lg md:text-xl"
						>
							{weekRangeText}
						</p>
					{/if}
				</div>
				<div class="flex h-4.5 items-center sm:h-5">
					<p
						class="text-body-medium truncate text-xs leading-tight text-on-surface-variant sm:text-sm"
					>
						{weekLabel}
					</p>
				</div>
			</div>
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
			/>
		{/key}
	</TimetableWallpaperLayer>
</div>

{#if pendingWeekDelete}
	<Dialog
		open={deleteWeekDialogOpen}
		onOpenChange={(open) => {
			if (!open) screen.cancelWeekDelete();
		}}
		title={hostT('timetable.deleteWeek.title')}
		description={hostT('timetable.deleteWeek.desc', {
			name: pendingWeekDelete.course.name,
			week: pendingWeekDelete.week
		})}
	>
		{#snippet footer()}
			<Button variant="text" onclick={() => screen.cancelWeekDelete()}>
				{hostT('common.cancel')}
			</Button>
			<Button variant="filled" onclick={() => void screen.confirmWeekDelete()}>
				{hostT('common.delete')}
			</Button>
		{/snippet}
	</Dialog>
{/if}
