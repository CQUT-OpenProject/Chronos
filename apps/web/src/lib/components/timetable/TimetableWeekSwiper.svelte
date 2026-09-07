<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import type { SwiperContainer } from 'swiper/element';
	import { trackEvent } from '$lib/client/analytics';
	import type { CapsuleCornerStyle, TimetableLayoutMode } from '@chronos/core';
	import type { CoursePaletteEntry } from '@chronos/core';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import { weekSlideWindow } from '$lib/timetable/week-navigation';
	import TimetableGrid from './TimetableGrid.svelte';

	let {
		screen,
		hasDynamicBackground,
		coursePalette,
		layoutMode,
		capsuleCornerStyle = 'sharp',
		active = true,
		onCourseClick
	}: {
		screen: TimetableScreenController;
		hasDynamicBackground: boolean;
		coursePalette: readonly CoursePaletteEntry[];
		layoutMode: TimetableLayoutMode;
		capsuleCornerStyle?: CapsuleCornerStyle;
		active?: boolean;
		onCourseClick: (courseId: string) => void;
	} = $props();

	const screenState = $derived(screen.state);
	const slideWindow = $derived(
		weekSlideWindow(screenState.displayedWeek, screenState.startWeek, screenState.endWeek)
	);

	let swiperReady = $state(false);
	let swiperEl = $state<SwiperContainer | undefined>();
	let suppressPagerWeekSync = true;
	let paintAdjacent = $state(false);

	onMount(() => {
		let cancelled = false;

		void (async () => {
			await import('swiper/css');
			const { register } = await import('swiper/element');
			if (cancelled) return;
			register();
			swiperReady = true;
		})();

		return () => {
			cancelled = true;
		};
	});

	function onSlideSettled() {
		if (suppressPagerWeekSync || !swiperEl?.swiper) return;
		const week = slideWindow.weeks[swiperEl.swiper.activeIndex];
		if (week != null && week !== screen.state.displayedWeek) {
			trackEvent('timetable_week_swipe');
			screen.setDisplayedWeek(week);
		}
	}

	function syncSwiperToWindow(centerIndex: number) {
		const swiper = swiperEl?.swiper;
		if (!swiper || suppressPagerWeekSync) return;

		suppressPagerWeekSync = true;
		swiper.update();
		swiper.slideTo(centerIndex, 0);
		suppressPagerWeekSync = false;
	}

	$effect(() => {
		if (!swiperReady) return;
		const el = swiperEl;
		if (!el) return;

		const initialSlideIndex = untrack(() => slideWindow.centerIndex);

		suppressPagerWeekSync = true;

		Object.assign(el, {
			slidesPerView: 1,
			speed: 300,
			resistanceRatio: 0.85,
			touchRatio: 1,
			threshold: 5,
			longSwipesRatio: 0.3,
			followFinger: true,
			touchReleaseOnEdges: true,
			initialSlide: initialSlideIndex
		});

		el.initialize();

		const swiper = el.swiper;
		swiper?.on('slideChangeTransitionEnd', onSlideSettled);

		suppressPagerWeekSync = false;

		return () => {
			swiper?.off('slideChangeTransitionEnd', onSlideSettled);
			el.swiper?.destroy(true, true);
		};
	});

	$effect(() => {
		const { centerIndex } = slideWindow;
		void screenState.displayedWeek;
		syncSwiperToWindow(centerIndex);
	});

	$effect(() => {
		if (!active) {
			paintAdjacent = false;
			return;
		}
		const frame = requestAnimationFrame(() => {
			paintAdjacent = true;
		});
		return () => cancelAnimationFrame(frame);
	});
</script>

{#if swiperReady}
	<swiper-container bind:this={swiperEl} init={false} class="timetable-week-swiper">
		{#each slideWindow.weeks as week (week)}
			{@const gridModel = screenState.weekGridModels.get(week)}
			{@const courseModels = screenState.weekCourseDisplayModels.get(week) ?? []}
			<swiper-slide class="timetable-week-slide">
				{#if gridModel && (week === screenState.displayedWeek || paintAdjacent)}
					<TimetableGrid
						displayedWeek={week}
						isCurrentWeek={week === screenState.academicWeek}
						currentPeriodIndex={screenState.currentPeriodIndex}
						expandedSlots={screenState.expandedSlots}
						onExpandSlot={(slotKey) => screen.expandSlot(slotKey)}
						{gridModel}
						courseDisplayModels={courseModels}
						{hasDynamicBackground}
						{coursePalette}
						paletteCourses={screenState.currentTimetable?.courses}
						{layoutMode}
						{capsuleCornerStyle}
						onCourseClick={(course) => onCourseClick(course.id)}
					/>
				{/if}
			</swiper-slide>
		{/each}
	</swiper-container>
{/if}

<style>
	.timetable-week-swiper {
		display: block;
		height: 100%;
		width: 100%;
	}

	.timetable-week-slide {
		display: block;
		height: 100%;
		overflow: hidden;
	}
</style>
