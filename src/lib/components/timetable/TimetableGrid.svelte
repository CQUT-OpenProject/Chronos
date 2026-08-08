<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import type { Course } from '$lib/models/course';
	import type { TimetableCourseDisplayModel, TimetableGridModel } from '$lib/models/presentation';
	import MiddleTruncateText from '$lib/components/timetable/MiddleTruncateText.svelte';
	import { createSizedCanvasMeasurer, fitFontSizePx } from '$lib/text/middle-truncate';
	import { placeCapsules, type PlacedCourseCapsule } from '$lib/timetable/capsule-layout';
	import { timetableDayShortLabel } from '$lib/timetable/day-labels';
	import {
		computeDelayUntilNextCurrentTimeRefreshMillis,
		currentTimeMinutes,
		findCurrentPeriodIndex,
		parsePeriodRanges
	} from '$lib/timetable/period-clock';

	const FIT_MIN_FONT_PX = 6;

	interface Props {
		displayedWeek: number;
		isCurrentWeek: boolean;
		gridModel: TimetableGridModel;
		courseDisplayModels: TimetableCourseDisplayModel[];
		hasWallpaper: boolean;
		isDark?: boolean;
		bottomContentPadding?: string;
		onCourseClick?: (course: Course) => void;
		onCourseLongClick?: (course: Course) => void;
	}

	let {
		displayedWeek,
		isCurrentWeek,
		gridModel,
		courseDisplayModels,
		hasWallpaper,
		isDark = false,
		bottomContentPadding = '0px',
		onCourseClick,
		onCourseLongClick
	}: Props = $props();

	let scrollContainer = $state<HTMLDivElement | undefined>();
	let bodyViewportHeight = $state(0);
	let gridBodyWidth = $state(0);
	let centeredFor = $state<string | null>(null);
	let expandedSlots = $state(new Set<string>());
	let now = $state(new Date());

	const parsedPeriods = $derived(parsePeriodRanges(gridModel.periods));
	const visibleDayCount = $derived(gridModel.visibleDays.length);
	const columnWidthPx = $derived(visibleDayCount > 0 ? gridBodyWidth / visibleDayCount : 0);

	const placements = $derived(
		placeCapsules({
			courseDisplayModels,
			visibleDays: gridModel.visibleDays,
			columnWidthPx,
			expandedSlotKeys: expandedSlots,
			isDark
		})
	);

	const currentPeriodIndex = $derived(
		findCurrentPeriodIndex(parsedPeriods, currentTimeMinutes(now))
	);

	const shellBgClass = $derived(hasWallpaper ? '' : isDark ? 'bg-zinc-900' : 'bg-white');

	const gridBodySolidBgClass = $derived(hasWallpaper ? '' : isDark ? 'bg-zinc-900' : 'bg-white');

	let gridHeaderHeight = $state(0);

	const gridHeaderMeasureAttach: Attachment = (node) => {
		const update = () => {
			gridHeaderHeight = node.offsetHeight;
		};
		update();
		const observer = new ResizeObserver(update);
		observer.observe(node);
		return () => observer.disconnect();
	};

	const wallpaperOverlayLayers = $derived.by(() => {
		const headerHeight = gridHeaderHeight > 0 ? gridHeaderHeight : 60;
		const headerBand =
			'linear-gradient(var(--wallpaper-tint-sidebar), var(--wallpaper-tint-sidebar))';
		const bodyBand =
			'linear-gradient(90deg, var(--wallpaper-tint-sidebar) 0, var(--wallpaper-tint-sidebar) var(--sidebar-width), var(--wallpaper-tint-grid) var(--sidebar-width), var(--wallpaper-tint-grid) 100%)';
		return {
			backgroundImage: `${headerBand}, ${bodyBand}`,
			backgroundSize: `100% ${headerHeight}px, 100% calc(100% - ${headerHeight}px)`,
			backgroundPosition: 'top, bottom',
			backgroundRepeat: 'no-repeat'
		};
	});

	$effect(() => {
		const centerKey = `${displayedWeek}-${isCurrentWeek}`;
		if (!isCurrentWeek || centeredFor === centerKey || !scrollContainer || bodyViewportHeight === 0)
			return;
		const target = currentPeriodIndex;
		if (target == null) return;

		const rowHeight =
			parseFloat(getComputedStyle(scrollContainer).getPropertyValue('--row-height')) || 96;
		const targetOffset = Math.max(
			0,
			(target - 1) * rowHeight + rowHeight / 2 - bodyViewportHeight / 2
		);
		scrollContainer.scrollTop = targetOffset;
		centeredFor = centerKey;
	});

	$effect(() => {
		let timeoutId: ReturnType<typeof setTimeout>;

		const schedule = () => {
			const delay = computeDelayUntilNextCurrentTimeRefreshMillis(new Date(), parsedPeriods);
			timeoutId = setTimeout(() => {
				now = new Date();
				schedule();
			}, delay);
		};

		schedule();
		return () => clearTimeout(timeoutId);
	});

	function dayOfMonth(date: string): string {
		return date.slice(8, 10);
	}

	/**
	 * Pass a getter so `{@attach fitWidthFont(() => …)}` does not re-create the
	 * attachment when params change — inner `$effect` applies updates instead.
	 */
	function fitWidthFont(
		getParams: () => { lines: string[]; maxFontPx: number; fromParent?: boolean }
	): Attachment<HTMLElement> {
		return (node) => {
			const apply = () => {
				const { lines, maxFontPx, fromParent = false } = getParams();
				const contents = lines.filter((line) => line.length > 0);
				const box = fromParent ? (node.parentElement ?? node) : node;
				let available = box.clientWidth;
				if (fromParent) {
					const style = getComputedStyle(node);
					available -=
						(Number.parseFloat(style.paddingLeft) || 0) +
						(Number.parseFloat(style.paddingRight) || 0);
					available = Math.max(0, available);
				}
				if (available <= 0 || contents.length === 0) return;

				const measurerForSize = createSizedCanvasMeasurer(node);
				const fontPx = fitFontSizePx(
					available,
					(size) => {
						const measure = measurerForSize(size);
						return Math.max(...contents.map((line) => measure(line)));
					},
					maxFontPx,
					FIT_MIN_FONT_PX
				);
				node.style.fontSize = `${fontPx}px`;
			};

			let observed: Element | null = null;
			const observer = new ResizeObserver(apply);

			$effect(() => {
				const { fromParent = false } = getParams();
				const target = fromParent ? (node.parentElement ?? node) : node;
				if (observed !== target) {
					observer.disconnect();
					observer.observe(target);
					observed = target;
				}
				apply();
			});

			return () => observer.disconnect();
		};
	}

	function courseCardHandlers(course: Course) {
		let longPressTimer: ReturnType<typeof setTimeout> | undefined;
		let didLongPress = false;

		return {
			oncontextmenu: (event: Event) => {
				event.preventDefault();
				onCourseLongClick?.(course);
			},
			onpointerdown: () => {
				if (!onCourseLongClick) return;
				didLongPress = false;
				longPressTimer = setTimeout(() => {
					didLongPress = true;
					onCourseLongClick(course);
				}, 500);
			},
			onpointerup: () => {
				clearTimeout(longPressTimer);
			},
			onpointerleave: () => {
				clearTimeout(longPressTimer);
			},
			onpointercancel: () => {
				clearTimeout(longPressTimer);
			},
			onclick: (event: MouseEvent) => {
				if (didLongPress) {
					event.preventDefault();
					didLongPress = false;
					return;
				}
				onCourseClick?.(course);
			}
		};
	}

	function expandSlot(key: string) {
		expandedSlots = new Set([...expandedSlots, key]);
	}

	function bodyScrollAction(node: HTMLDivElement) {
		scrollContainer = node;
		bodyViewportHeight = node.clientHeight;
		const observer = new ResizeObserver(() => {
			bodyViewportHeight = node.clientHeight;
		});
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
				if (scrollContainer === node) scrollContainer = undefined;
			}
		};
	}

	const gridBodyWidthAttach: Attachment = (node) => {
		const update = () => {
			gridBodyWidth = node.clientWidth;
		};
		update();
		const observer = new ResizeObserver(update);
		observer.observe(node);
		return () => observer.disconnect();
	};
</script>

<div
	class="relative flex h-full w-full flex-col {shellBgClass}"
	style="--row-height: 5.5rem; --sidebar-width: 3.25rem"
>
	{#if hasWallpaper}
		<div
			class="pointer-events-none absolute inset-0 z-0"
			style:background-image={wallpaperOverlayLayers.backgroundImage}
			style:background-size={wallpaperOverlayLayers.backgroundSize}
			style:background-position={wallpaperOverlayLayers.backgroundPosition}
			style:background-repeat={wallpaperOverlayLayers.backgroundRepeat}
			aria-hidden="true"
		></div>
	{/if}

	<div class="relative z-10 flex h-full min-h-0 w-full flex-col">
		<div class="flex shrink-0 items-center py-2" {@attach gridHeaderMeasureAttach}>
			<div
				class="flex w-[var(--sidebar-width)] flex-col items-center text-center text-xs text-zinc-500"
			>
				<span>{gridModel.monthLabel}</span>
				<span>月</span>
			</div>
			<div class="flex min-w-0 flex-1">
				{#each gridModel.visibleDays as day (day.dayOfWeek)}
					<div class="flex min-w-0 flex-1 flex-col items-center">
						<span class="text-xs text-zinc-500">{timetableDayShortLabel(day.dayOfWeek)}</span>
						<div
							class="mt-1 flex size-[26px] items-center justify-center rounded-full text-sm {day.isToday
								? 'bg-brand text-white dark:bg-soft-blue dark:text-ink'
								: 'text-zinc-900 dark:text-zinc-100'}"
						>
							{dayOfMonth(day.date)}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<div
			use:bodyScrollAction
			class="min-h-0 flex-1 overflow-y-auto"
			style:padding-bottom={bottomContentPadding}
		>
			<div class="flex" style:height="calc(var(--row-height) * {gridModel.displayedPeriodCount})">
				<aside
					class="shrink-0"
					style:width="var(--sidebar-width)"
					style:height="calc(var(--row-height) * {gridModel.displayedPeriodCount})"
				>
					{#each gridModel.periods as period (period.index)}
						{@const isActive = period.index === currentPeriodIndex}
						<div
							class="flex h-[var(--row-height)] flex-col items-center justify-center px-1 py-[3px] text-center"
						>
							<div
								class="flex h-full w-full flex-col items-center justify-center rounded-2xl {isActive
									? 'bg-brand-muted dark:bg-soft-blue/25'
									: ''}"
							>
								<span class="text-sm font-bold {isActive ? 'text-brand dark:text-soft-blue' : ''}">
									{period.index}
								</span>
								<span
									class="mt-1 text-[10px] leading-tight {isActive
										? 'text-brand dark:text-soft-blue'
										: 'text-zinc-500'}"
								>
									{period.startTime}<br />{period.endTime}
								</span>
							</div>
						</div>
					{/each}
				</aside>

				<div
					{@attach gridBodyWidthAttach}
					class="relative min-w-0 flex-1 {gridBodySolidBgClass}"
					style:height="calc(var(--row-height) * {gridModel.displayedPeriodCount})"
				>
					{#each placements as item (item.key)}
						{@const span = item.geometry.endPeriod - item.geometry.startPeriod + 1}
						<div
							class="absolute box-border overflow-hidden py-[3px]"
							style:top="calc((var(--row-height) * {item.geometry.startPeriod - 1}))"
							style:left="{item.geometry.leftPercent}%"
							style:width="{item.geometry.widthPercent}%"
							style:height="calc(var(--row-height) * {span})"
						>
							{#if item.kind === 'overlap-placeholder'}
								<button
									type="button"
									class="flex h-full w-full items-center justify-center rounded-xl border border-zinc-300/50 bg-zinc-100 p-2 text-center shadow-sm dark:border-zinc-600/50 dark:bg-zinc-800/60"
									onclick={() => expandSlot(item.key)}
								>
									<span
										class="text-zinc-600 dark:text-zinc-300"
										style:font-size="{item.placeholderPx}px"
									>
										此时段有 {item.count} 门课程重叠
									</span>
								</button>
							{:else}
								{@render courseCard(item)}
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

{#snippet courseCard(placed: PlacedCourseCapsule)}
	{@const colors = placed.colors}
	{@const scale = placed.scale}
	{@const locationLines = placed.locationLines}
	{@const locationMetrics = placed.locationMetrics}
	{@const teacher = placed.teacher}
	{@const handlers = courseCardHandlers(placed.course)}
	<button
		type="button"
		class="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border p-2 text-left shadow-md {placed
			.displayModel.isInDisplayedWeek
			? ''
			: 'opacity-45'}"
		style:background-color={colors.background}
		style:border-color="color-mix(in srgb, {colors.text} 12%, transparent)"
		oncontextmenu={handlers.oncontextmenu}
		onpointerdown={handlers.onpointerdown}
		onpointerup={handlers.onpointerup}
		onpointerleave={handlers.onpointerleave}
		onpointercancel={handlers.onpointercancel}
		onclick={handlers.onclick}
	>
		{#if placed.badgeLabel}
			<span class="mb-0.5 flex w-full shrink-0 justify-center">
				<span
					class="max-w-full rounded-lg px-1.5 py-0.5 whitespace-nowrap"
					style:background-color="color-mix(in srgb, {colors.text} 12%, transparent)"
					style:color="color-mix(in srgb, {colors.text} 80%, transparent)"
					style:font-size="{scale.badgePx}px"
					{@attach fitWidthFont(() => ({
						lines: [placed.badgeLabel!],
						maxFontPx: scale.badgePx,
						fromParent: true
					}))}
				>
					{placed.badgeLabel}
				</span>
			</span>
		{/if}
		<MiddleTruncateText
			text={placed.course.name}
			class="min-h-0 flex-1 leading-tight font-medium"
			style="color: {colors.text}; font-size: {scale.titlePx}px"
		/>
		{#if locationLines.length > 0}
			<div
				class="mt-1.5 shrink-0 overflow-hidden leading-tight"
				style="color: color-mix(in srgb, {colors.text} 80%, transparent); font-size: {locationMetrics.fontPx}px; height: {locationMetrics.heightPx}px"
				{@attach fitWidthFont(() => ({
					lines: locationLines,
					maxFontPx: locationMetrics.fontPx
				}))}
			>
				{#each locationLines as line, index (index)}
					<div class="overflow-hidden whitespace-nowrap">{line}</div>
				{/each}
			</div>
		{/if}
		{#if teacher}
			<div
				class="mt-0.5 shrink-0 overflow-hidden leading-tight whitespace-nowrap"
				style="color: color-mix(in srgb, {colors.text} 80%, transparent); font-size: {scale.detailPx}px"
				{@attach fitWidthFont(() => ({ lines: [teacher], maxFontPx: scale.detailPx }))}
			>
				{teacher}
			</div>
		{/if}
	</button>
{/snippet}
