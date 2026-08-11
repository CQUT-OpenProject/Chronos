<script lang="ts">
	import { formatSlashDate } from '$lib/domain/date';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import type { TimetableGridModel } from '$lib/models/presentation';
	import { timetableDayLabel } from '$lib/timetable/day-labels';
	import type { AppShellController } from '$lib/app/app-shell.svelte';
	import { createWeekSliderGesture } from '$lib/timetable/week-slider-gesture.svelte';
	import { getContext } from 'svelte';
	import { EditNote } from '$lib/icons';
	import TopAppBar from '$lib/components/TopAppBar.svelte';
	import IconButton from '$lib/components/ui/IconButton.svelte';
	import Slider from '$lib/components/ui/Slider.svelte';
	import TimetableWeekSwiper from './TimetableWeekSwiper.svelte';

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
	const isDark = $derived(shell.state.isDark);
	const hasWallpaper = $derived(Boolean(screenState.appState.wallpaperUri));

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
		formatWeekRange(screenState.weekGridModels.get(screenState.displayedWeek))
	);
	const headerTodayLabel = $derived(
		screenState.displayedWeek === screenState.academicWeek
			? timetableDayLabel(dayOfWeekFromIso(screenState.today))
			: ''
	);
	const weekHeaderAriaLabel = $derived(
		`第 ${displayedWeekNumber} 周，${weekRangeText}，点击返回本周`
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

	function formatWeekRange(gridModel: TimetableGridModel | undefined) {
		const days = gridModel?.visibleDays ?? [];
		const first = days[0]?.date;
		const last = days.at(-1)?.date;
		if (!first || !last) return formatSlashDate(screenState.today);
		return `${formatShortDate(first)} - ${formatShortDate(last)}`;
	}

	function formatShortDate(iso: string) {
		const [, month, day] = iso.split('-');
		return `${Number(month)}/${Number(day)}`;
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
				class="flex min-h-16 min-w-0 flex-1 cursor-pointer touch-none flex-col justify-center select-none"
				role="button"
				tabindex="0"
				aria-label={weekHeaderAriaLabel}
				aria-expanded={weekGesture.weekSliderVisible}
				aria-controls={weekGesture.weekSliderVisible ? 'week-slider' : undefined}
				onpointerdown={weekGesture.onPointerDown}
				onkeydown={onWeekHeaderKeydown}
				oncontextmenu={(event) => event.preventDefault()}
			>
				<div class="flex h-7 items-center">
					{#if weekGesture.weekSliderVisible && startWeek < endWeek}
						<Slider
							id="week-slider"
							ariaLabel="选择教学周次"
							bind:value={weekGesture.dragWeek}
							min={startWeek}
							max={endWeek}
							step={1}
							stops
							onValueChange={(week) => screen.setDisplayedWeek(week)}
							onValueCommit={weekGesture.onSliderCommit}
						/>
					{:else}
						<p class="m3-title-large truncate leading-none font-bold">{weekRangeText}</p>
					{/if}
				</div>
				<div class="flex h-5 items-center">
					<p class="m3-body-medium truncate leading-none text-on-surface-variant">
						第 {displayedWeekNumber} 周{headerTodayLabel ? ` ${headerTodayLabel}` : ''}
					</p>
				</div>
			</div>
		{/snippet}
		{#snippet actions()}
			<IconButton
				variant="tonal"
				size="sm"
				ariaLabel="编辑课表"
				onclick={() => {
					navigator.vibrate?.(10);
					onEditTimetableDetails();
				}}
			>
				<EditNote class="size-[22px]" />
			</IconButton>
		{/snippet}
	</TopAppBar>

	<div class="relative min-h-0 flex-1">
		{#if hasWallpaper}
			<div
				class="absolute inset-0 bg-cover bg-center"
				style:background-image="url('{screenState.appState.wallpaperUri}')"
			></div>
		{/if}

		{#key screenState.appState.currentTimetable?.id}
			<TimetableWeekSwiper {screen} {hasWallpaper} {isDark} {onCourseClick} {onCourseLongClick} />
		{/key}
	</div>
</div>
