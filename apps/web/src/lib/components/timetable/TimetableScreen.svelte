<script lang="ts">
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import { timetableDayLabelRead } from '$lib/timetable/day-labels';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { createWeekSliderGesture } from '$lib/timetable/week-slider-gesture.svelte';
	import { formatWeekDateRange } from '@chronos/core';
	import { getContext } from 'svelte';
	import { EditNote } from '$lib/icons';
	import TopAppBar from '$lib/components/TopAppBar.svelte';
	import IconButton from '$lib/components/ui/IconButton.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import TimetableWeekSwiper from './TimetableWeekSwiper.svelte';
	import { TimetableWallpaperLayer } from '@chronos/ui-kit';
	import { haptic } from '$lib/haptic/haptic';
	import { hostTextRead } from '$lib/i18n/host-text';

	let {
		screen,
		onEditTimetableDetails,
		onCourseClick,
		onCourseLongClick
	}: {
		screen: TimetableScreenController;
		onEditTimetableDetails: () => void;
		onCourseClick: (courseId: string) => void;
		onCourseLongClick: (courseId: string) => void;
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
		shell.controller.userPreferences?.capsuleCornerStyle ?? 'rounded'
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
			? timetableDayLabelRead(shell.controller, dayOfWeekFromIso(screenState.today))
			: ''
	);
	const weekHeaderAriaLabel = $derived(
		hostTextRead(shell.controller, 'timetable.week.headerAria', {
			week: displayedWeekNumber,
			range: weekRangeText
		})
	);
	const weekLabel = $derived(
		hostTextRead(shell.controller, 'timetable.week.label', {
			week: displayedWeekNumber,
			today: headerTodayLabel ? ` ${headerTodayLabel}` : ''
		})
	);

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

	function dayOfWeekFromIso(iso: string) {
		const date = new Date(`${iso}T12:00:00`);
		const jsDay = date.getDay();
		return jsDay === 0 ? 7 : jsDay;
	}
</script>

<svelte:window
	onpointermove={weekGesture.onWindowPointerMove}
	onpointerup={weekGesture.onWindowPointerUp}
	onpointercancel={weekGesture.onWindowPointerCancel}
/>

<div class="flex h-[calc(100dvh-var(--bottom-bar-height))] flex-col">
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
							ariaLabel={hostTextRead(shell.controller, 'timetable.week.sliderAria')}
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
							class="m3-title-large truncate text-base leading-tight font-bold sm:text-lg md:text-xl"
						>
							{weekRangeText}
						</p>
					{/if}
				</div>
				<div class="flex h-4.5 items-center sm:h-5">
					<p
						class="m3-body-medium truncate text-xs leading-tight text-on-surface-variant sm:text-sm"
					>
						{weekLabel}
					</p>
				</div>
			</div>
		{/snippet}
		{#snippet actions()}
			<IconButton
				variant="tonal"
				size="sm"
				ariaLabel={hostTextRead(shell.controller, 'timetable.edit.aria')}
				onclick={() => {
					haptic.light();
					onEditTimetableDetails();
				}}
			>
				<EditNote class="size-[22px]" />
			</IconButton>
		{/snippet}
	</TopAppBar>

	<TimetableWallpaperLayer wallpaperUri={hasDynamicColorBackground ? dynamicColorUri : null}>
		{#key screenState.currentTimetable?.id}
			<TimetableWeekSwiper
				{screen}
				hasDynamicBackground={hasDynamicColorBackground}
				{coursePalette}
				{layoutMode}
				{capsuleCornerStyle}
				{onCourseClick}
				{onCourseLongClick}
			/>
		{/key}
	</TimetableWallpaperLayer>
</div>
