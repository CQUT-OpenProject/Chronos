<script module>
	import { register } from 'swiper/element/bundle';

	let swiperRegistered = false;

	function ensureSwiperRegistered() {
		if (swiperRegistered) return;
		register();
		swiperRegistered = true;
	}
</script>

<script lang="ts">
	import { untrack } from 'svelte';
	import type { SwiperContainer } from 'swiper/element/bundle';
	import { trackEvent } from '$lib/client/analytics';
	import type { CapsuleCornerStyle, TimetableLayoutMode } from '@chronos/core';
	import type { CoursePaletteEntry } from '@chronos/core';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import TimetableGrid from './TimetableGrid.svelte';

	ensureSwiperRegistered();

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

	let swiperEl = $state<SwiperContainer | undefined>();
	let suppressPagerWeekSync = $state(true);
	let paintAdjacent = $state(false);

	function onSlideSettled() {
		if (suppressPagerWeekSync || !swiperEl?.swiper) return;
		const slideIndex = swiperEl.swiper.activeIndex;
		if (slideIndex !== screen.state.slideIndex) {
			trackEvent('timetable_week_swipe');
			screen.settlePagerAtSlide(slideIndex);
		}
	}

	function syncSwiperToSlideIndex(slideIndex: number) {
		const swiper = swiperEl?.swiper;
		if (!swiper || suppressPagerWeekSync) return;
		if (swiper.activeIndex === slideIndex) return;

		suppressPagerWeekSync = true;
		swiper.slideTo(slideIndex, 0);
		suppressPagerWeekSync = false;
	}

	$effect(() => {
		const el = swiperEl;
		if (!el) return;

		const initialSlideIndex = untrack(() => screenState.slideIndex);

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
		syncSwiperToSlideIndex(screenState.slideIndex);
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

<swiper-container bind:this={swiperEl} init={false} class="timetable-week-swiper">
	{#each screenState.weeks as week (week)}
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
