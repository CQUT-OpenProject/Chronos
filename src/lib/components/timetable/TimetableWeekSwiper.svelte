<script lang="ts">
	import { register } from 'swiper/element/bundle';
	import type { SwiperContainer } from 'swiper/element/bundle';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import TimetableGrid from './TimetableGrid.svelte';

	register();

	let {
		screen,
		weeks,
		startWeek,
		hasWallpaper,
		isDark,
		onCourseClick,
		onCourseLongClick
	}: {
		screen: TimetableScreenController;
		weeks: number[];
		startWeek: number;
		hasWallpaper: boolean;
		isDark: boolean;
		onCourseClick: (courseId: string) => void;
		onCourseLongClick: (courseId: string) => void;
	} = $props();

	const screenState = $derived(screen.state);

	let swiperEl = $state<SwiperContainer | undefined>();
	let suppressPagerWeekSync = $state(true);

	function onSlideSettled() {
		if (suppressPagerWeekSync || !swiperEl?.swiper) return;
		const week = startWeek + swiperEl.swiper.activeIndex;
		if (week !== screen.state.displayedWeek) {
			screen.setDisplayedWeek(week);
		}
	}

	function syncSwiperToDisplayedWeek(week: number, start: number) {
		const swiper = swiperEl?.swiper;
		if (!swiper || suppressPagerWeekSync) return;

		const targetIndex = Math.max(0, Math.min(week - start, weeks.length - 1));
		if (swiper.activeIndex === targetIndex) return;

		suppressPagerWeekSync = true;
		swiper.slideTo(targetIndex, 0);
		suppressPagerWeekSync = false;
	}

	$effect(() => {
		const el = swiperEl;
		const initialWeek = screenState.displayedWeek;
		const initialStartWeek = startWeek;
		if (!el) return;

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
			initialSlide: Math.max(0, initialWeek - initialStartWeek)
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
		const week = screenState.displayedWeek;
		const start = startWeek;
		syncSwiperToDisplayedWeek(week, start);
	});
</script>

<swiper-container bind:this={swiperEl} init={false} class="timetable-week-swiper">
	{#each weeks as week (week)}
		{@const gridModel = screenState.weekGridModels.get(week)}
		{@const courseModels = screenState.weekCourseDisplayModels.get(week) ?? []}
		<swiper-slide class="timetable-week-slide">
			{#if gridModel}
				<TimetableGrid
					displayedWeek={week}
					isCurrentWeek={week === screenState.academicWeek}
					{gridModel}
					courseDisplayModels={courseModels}
					{hasWallpaper}
					{isDark}
					bottomContentPadding="0px"
					onCourseClick={(course) => onCourseClick(course.id)}
					onCourseLongClick={(course) => onCourseLongClick(course.id)}
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
