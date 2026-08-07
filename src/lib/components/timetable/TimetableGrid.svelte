<script lang="ts">
	import type { Attachment } from 'svelte/attachments';
	import type { Course } from '$lib/models/course';
	import type { TimetableCourseDisplayModel, TimetableGridModel } from '$lib/models/presentation';
	import MiddleTruncateText from '$lib/components/timetable/MiddleTruncateText.svelte';
	import { createSizedCanvasMeasurer, fitFontSizePx } from '$lib/text/middle-truncate';
	import {
		buildSlotGroups,
		blendColors,
		computeDelayUntilNextCurrentTimeRefreshMillis,
		currentTimeMinutes,
		findCurrentPeriodIndex,
		locationDisplayLines,
		parseColor,
		parsePeriodRanges,
		timetableDayShortLabel
	} from '$lib/timetable/timetable-grid-logic';

	const DARK_SURFACE = '#17171a';
	const ON_SURFACE_DARK = '#f4f4f5';
	const BADGE_LABEL = '非本周';
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
	let centeredFor = $state<string | null>(null);
	let expandedSlots = $state(new Set<string>());
	let now = $state(new Date());

	const parsedPeriods = $derived(parsePeriodRanges(gridModel.periods));
	const visibleDayIndexMap = $derived(
		new Map(gridModel.visibleDays.map((day, index) => [day.dayOfWeek, index]))
	);
	const visibleDayCount = $derived(gridModel.visibleDays.length);
	const slotGroups = $derived(buildSlotGroups(courseDisplayModels));
	const columnFraction = $derived(visibleDayCount > 0 ? 100 / visibleDayCount : 0);

	const currentPeriodIndex = $derived(
		isCurrentWeek ? findCurrentPeriodIndex(parsedPeriods, currentTimeMinutes(now)) : null
	);

	const shellBgClass = $derived(hasWallpaper ? '' : isDark ? 'bg-zinc-900' : 'bg-white');

	const overlayBgClass = $derived(hasWallpaper ? (isDark ? 'bg-zinc-900/72' : 'bg-white/54') : '');

	const gridBgClass = $derived(
		hasWallpaper ? (isDark ? 'bg-zinc-900/62' : 'bg-white/38') : isDark ? 'bg-zinc-900' : 'bg-white'
	);

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
		if (!isCurrentWeek) return;

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

	function slotKey(day: number, start: number, end: number): string {
		return `${day}-${start}-${end}`;
	}

	function dayOfMonth(date: string): string {
		return date.slice(8, 10);
	}

	function crowdingTextClass(overlapCount = 1): string {
		const crowding = visibleDayCount * overlapCount;
		// Both weekend days on (7 columns): one step smaller than the 6-day scale.
		if (visibleDayCount >= 7) {
			if (crowding >= 11) return 'text-[10px]';
			return 'text-xs';
		}
		if (crowding >= 11) return 'text-xs';
		if (crowding >= 7) return 'text-sm';
		return 'text-[15px]';
	}

	function placeholderTextClass(): string {
		if (visibleDayCount === 7) return 'text-[10px]';
		if (visibleDayCount === 6) return 'text-sm';
		return 'text-[15px]';
	}

	function detailFontPx(overlapCount = 1): number {
		const crowded = visibleDayCount * overlapCount >= 11;
		if (visibleDayCount >= 7) return crowded ? 9 : 10;
		return crowded ? 10 : 12;
	}

	function badgeFontPx(overlapCount = 1): number {
		const crowded = visibleDayCount * overlapCount >= 11;
		if (visibleDayCount >= 7) return crowded ? 8 : 9;
		return detailFontPx(overlapCount);
	}

	/**
	 * Pass a getter so `{@attach fitWidthFont(() => …)}` does not re-create the
	 * attachment when params change — inner `$effect` applies updates instead.
	 */
	function fitWidthFont(
		getParams: () => { lines: string[]; maxFontPx: number; fromParent?: boolean }
	): Attachment {
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

	function courseColors(course: Course): { background: string; text: string } {
		const rawBackground = parseColor(course.color);
		if (isDark) {
			return {
				background: blendColors(rawBackground, DARK_SURFACE, 0.58),
				text: blendColors(ON_SURFACE_DARK, rawBackground, 0.18)
			};
		}
		return {
			background: rawBackground,
			text: parseColor(course.textColor)
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
</script>

<div
	class="flex h-full flex-col {shellBgClass}"
	style="--row-height: 5.5rem; --sidebar-width: 3.25rem"
>
	<div class="flex shrink-0 items-center py-2 {overlayBgClass}">
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
				class="shrink-0 {overlayBgClass}"
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
				class="relative min-w-0 flex-1 {gridBgClass}"
				style:height="calc(var(--row-height) * {gridModel.displayedPeriodCount})"
			>
				{#each slotGroups as group (slotKey(group.dayOfWeek, group.startPeriod, group.endPeriod))}
					{@const key = slotKey(group.dayOfWeek, group.startPeriod, group.endPeriod)}
					{@const count = group.courses.length}
					{@const columnIndex = visibleDayIndexMap.get(group.dayOfWeek) ?? 0}
					{@const columnLeft = columnIndex * columnFraction}
					{@const slotSpan = group.endPeriod - group.startPeriod + 1}
					{@const isExpanded = expandedSlots.has(key)}

					{#if count === 1}
						{@const displayModel = group.courses[0]!}
						{@const course = displayModel.course}
						{@const courseSpan = course.endPeriod - course.startPeriod + 1}
						<div
							class="absolute box-border overflow-hidden py-[3px]"
							style:top="calc((var(--row-height) * {course.startPeriod - 1}))"
							style:left="{columnLeft}%"
							style:width="{columnFraction}%"
							style:height="calc(var(--row-height) * {courseSpan})"
						>
							{@render courseCard(displayModel, 1)}
						</div>
					{:else if !isExpanded}
						<div
							class="absolute box-border py-[3px]"
							style:top="calc((var(--row-height) * {group.startPeriod - 1}))"
							style:left="{columnLeft}%"
							style:width="{columnFraction}%"
							style:height="calc(var(--row-height) * {slotSpan})"
						>
							<button
								type="button"
								class="flex h-full w-full items-center justify-center rounded-xl border border-zinc-300/50 bg-zinc-100 p-2 text-center shadow-sm dark:border-zinc-600/50 dark:bg-zinc-800/60"
								onclick={() => expandSlot(key)}
							>
								<span class="text-zinc-600 dark:text-zinc-300 {placeholderTextClass()}">
									此时段有 {count} 门课程重叠
								</span>
							</button>
						</div>
					{:else}
						{@const perCourseWidth = columnFraction / count}
						{#each group.courses as displayModel, index (displayModel.course.id)}
							{@const course = displayModel.course}
							{@const courseSpan = course.endPeriod - course.startPeriod + 1}
							<div
								class="absolute box-border overflow-hidden py-[3px]"
								style:top="calc((var(--row-height) * {course.startPeriod - 1}))"
								style:left="{columnLeft + perCourseWidth * index}%"
								style:width="{perCourseWidth}%"
								style:height="calc(var(--row-height) * {courseSpan})"
							>
								{@render courseCard(displayModel, count)}
							</div>
						{/each}
					{/if}
				{/each}
			</div>
		</div>
	</div>
</div>

{#snippet courseCard(displayModel: TimetableCourseDisplayModel, overlapCount: number)}
	{@const course = displayModel.course}
	{@const colors = courseColors(course)}
	{@const locationLines = locationDisplayLines(course.location)}
	{@const textClass = crowdingTextClass(overlapCount)}
	{@const detailPx = detailFontPx(overlapCount)}
	{@const badgePx = badgeFontPx(overlapCount)}
	{@const teacher = course.teacher.trim()}
	{@const handlers = courseCardHandlers(course)}
	<button
		type="button"
		class="flex h-full min-h-0 w-full flex-col overflow-hidden rounded-2xl border p-2 text-left shadow-md {displayModel.isInDisplayedWeek
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
		{#if !displayModel.isInDisplayedWeek}
			<span class="mb-0.5 flex w-full shrink-0 justify-center">
				<span
					class="max-w-full rounded-lg px-1.5 py-0.5 whitespace-nowrap"
					style:background-color="color-mix(in srgb, {colors.text} 12%, transparent)"
					style:color="color-mix(in srgb, {colors.text} 80%, transparent)"
					style:font-size="{badgePx}px"
					{@attach fitWidthFont(() => ({
						lines: [BADGE_LABEL],
						maxFontPx: badgePx,
						fromParent: true
					}))}
				>
					{BADGE_LABEL}
				</span>
			</span>
		{/if}
		<MiddleTruncateText
			text={course.name}
			class="min-h-0 flex-1 leading-tight font-medium {textClass}"
			style="color: {colors.text}"
		/>
		{#if locationLines.length > 0}
			<div
				class="mt-1.5 h-[3lh] shrink-0 leading-tight"
				style="color: color-mix(in srgb, {colors.text} 80%, transparent); font-size: {detailPx}px"
				{@attach fitWidthFont(() => ({ lines: locationLines, maxFontPx: detailPx }))}
			>
				{#each locationLines as line, index (index)}
					<div class="overflow-hidden whitespace-nowrap">{line}</div>
				{/each}
			</div>
		{/if}
		{#if teacher}
			<div
				class="mt-0.5 shrink-0 overflow-hidden leading-tight whitespace-nowrap"
				style="color: color-mix(in srgb, {colors.text} 80%, transparent); font-size: {detailPx}px"
				{@attach fitWidthFont(() => ({ lines: [teacher], maxFontPx: detailPx }))}
			>
				{teacher}
			</div>
		{/if}
	</button>
{/snippet}
