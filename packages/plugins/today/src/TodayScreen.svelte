<script lang="ts">
	import { onMount } from 'svelte';
	import type { ReactiveChronosController } from '@chronos/ui-kit';
	import { appLocaleToBcp47, pluginText } from '@chronos/ui-kit';
	import { createFitWidthFontAttachment } from '@chronos/ui-kit/utils/fit-width-font.svelte';
	import {
		AcademicCalendarService,
		assignCourseDisplayColors,
		IHostNavigation,
		normalizedCourseName,
		resolveCoursePaint
	} from '@chronos/core';
	import { TODAY_MESSAGES } from './messages';
	import { TODAY_PLUGIN_ID } from './constants';
	import { resolvePeriodTimeRange } from './today-courses';
	import { createTodayScreenController } from './today-screen.svelte';

	interface Props {
		controller: ReactiveChronosController;
		pluginId: string;
		active?: boolean;
	}

	let { controller, pluginId, active = true }: Props = $props();

	const HEADLINE_SMALL_FONT_PX = 24;
	const PERIOD_LABEL_MIN_FONT_PX = 6;

	const calendarService = new AcademicCalendarService();
	const screen = createTodayScreenController();

	const timetable = $derived(controller.currentTimetable);
	const periodTimes = $derived(timetable?.academicConfig.periodTimes ?? []);
	const todayIso = $derived(controller.clockTodayIso || screen.today);
	const academicWeek = $derived(
		timetable ? calendarService.calculateAcademicWeek(todayIso, timetable.academicConfig) : 1
	);
	const coursePaintByName = $derived.by(() => {
		const palette = controller.coursePalette;
		const courses = screen.courseEntries.map((entry) => entry.hit.course);
		return assignCourseDisplayColors(courses, palette);
	});
	const scopeSegments = $derived([
		{ value: 'active' as const, label: pt('screen.scope.active') },
		{ value: 'all' as const, label: pt('screen.scope.all') }
	]);
	const selectedScopeIndex = $derived(
		scopeSegments.findIndex((segment) => segment.value === screen.scope)
	);

	function pt(key: keyof (typeof TODAY_MESSAGES)['zh-cn'], params?: Record<string, unknown>) {
		return pluginText(controller, TODAY_PLUGIN_ID, TODAY_MESSAGES, key, params);
	}

	function formatHeaderDate(iso: string): string {
		const date = new Date(`${iso}T12:00:00`);
		return date.toLocaleDateString(appLocaleToBcp47(controller.currentLocale), {
			month: 'long',
			day: 'numeric',
			weekday: 'long'
		});
	}

	function resolvePaint(hit: (typeof screen.courseEntries)[number]['hit']) {
		const palette = controller.coursePalette;
		const assigned =
			coursePaintByName.get(normalizedCourseName(hit.course.name)) ??
			resolveCoursePaint(hit.course, palette);
		return assigned;
	}

	const courseEditorNavigation = $derived.by(() => {
		try {
			return controller.getPluginContext(pluginId).tryService(IHostNavigation);
		} catch {
			return undefined;
		}
	});

	function openCourseEditor(courseId: string) {
		courseEditorNavigation?.openCourseEditor(courseId);
	}

	onMount(() => {
		void screen.init(controller, pluginId);
		return () => screen.dispose();
	});
</script>

<div class="flex min-h-0 flex-1 flex-col overflow-y-auto">
	<header class="border-b border-outline/10 bg-surface px-4 pt-6 pb-4">
		<p class="text-headline-small text-on-surface">{formatHeaderDate(todayIso)}</p>
		{#if timetable}
			<div class="mt-1 flex items-center justify-between gap-3">
				<p class="text-body-medium text-on-surface-variant">
					{pt('screen.week', { week: academicWeek })}
				</p>
				{#if screen.courseEntries.length > 0}
					<p class="text-label-large shrink-0 text-on-surface-variant">
						{pt('screen.summary.count', { count: screen.courseEntries.length })}
					</p>
				{/if}
			</div>
		{/if}

		<div
			class="rounded-pill relative mt-4 flex w-full border border-border bg-surface p-1.5 shadow-xs"
		>
			{#if selectedScopeIndex >= 0}
				<div
					class="rounded-pill absolute top-1.5 bottom-1.5 bg-secondary-container shadow-xs {active
						? 'transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]'
						: ''}"
					style:left="calc(0.375rem + {selectedScopeIndex} * ((100% - 0.75rem) / 2))"
					style:width="calc((100% - 0.75rem) / 2)"
				></div>
			{/if}
			{#each scopeSegments as segment (segment.value)}
				<button
					type="button"
					class="text-label-large rounded-pill relative z-10 flex-1 cursor-pointer py-2 text-center transition-colors duration-200 {screen.scope ===
					segment.value
						? 'text-on-secondary-container'
						: 'text-on-surface-variant hover:text-on-surface'}"
					onclick={() => void screen.persistScope(segment.value)}
				>
					{segment.label}
				</button>
			{/each}
		</div>
	</header>

	<div class="flex flex-1 flex-col gap-4 p-4">
		{#if !timetable}
			<section
				class="flex flex-1 flex-col items-center justify-center rounded-2xl border border-outline/20 bg-surface px-6 py-16 text-center shadow-xs"
			>
				<div
					class="mb-4 flex size-16 items-center justify-center rounded-full bg-secondary-container text-on-secondary-container"
					aria-hidden="true"
				>
					<svg viewBox="0 0 24 24" class="size-8 fill-current">
						<path
							d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM5 8V6h14v2H5z"
						/>
					</svg>
				</div>
				<p class="text-title-medium text-on-surface">{pt('screen.empty.noTimetable')}</p>
			</section>
		{:else if screen.courseEntries.length === 0}
			<section
				class="flex flex-1 flex-col items-center justify-center rounded-2xl border border-outline/20 bg-surface px-6 py-16 text-center shadow-xs"
			>
				<div
					class="mb-4 flex size-16 items-center justify-center rounded-full bg-tertiary-container text-on-tertiary-container"
					aria-hidden="true"
				>
					<svg viewBox="0 0 24 24" class="size-8 fill-current">
						<path
							d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"
						/>
					</svg>
				</div>
				<p class="text-title-medium text-on-surface">{pt('screen.empty.noCourses')}</p>
				<p class="text-body-medium mt-2 text-on-surface-variant">
					{pt('screen.empty.noCoursesHint')}
				</p>
			</section>
		{:else}
			<section class="overflow-hidden rounded-2xl border border-outline/20 bg-surface shadow-xs">
				<ul class="divide-y divide-outline/10">
					{#each screen.courseEntries as entry (`${entry.hit.timetableId}-${entry.hit.course.id}`)}
						{@const paint = resolvePaint(entry.hit)}
						{@const timeRange = resolvePeriodTimeRange(
							periodTimes,
							entry.hit.course.startPeriod,
							entry.hit.course.endPeriod
						)}
						{@const periodLabel =
							entry.hit.course.startPeriod === entry.hit.course.endPeriod
								? pt('screen.course.periodSingle', {
										n: entry.hit.course.startPeriod
									})
								: pt('screen.course.periodRange', {
										start: entry.hit.course.startPeriod,
										end: entry.hit.course.endPeriod
									})}
						<li>
							{#snippet courseRowContent()}
								<div class="flex w-11 shrink-0 flex-col items-center self-stretch">
									{#if timeRange}
										<p class="text-label-medium text-on-surface tabular-nums">
											{timeRange.startTime}
										</p>
									{/if}
									<div class="flex min-h-0 w-full flex-1 flex-col items-center justify-center">
										<p
											class="text-headline-small w-full min-w-0 text-center font-bold whitespace-nowrap text-on-surface-variant"
											{@attach createFitWidthFontAttachment(() => ({
												lines: [periodLabel],
												maxFontPx: HEADLINE_SMALL_FONT_PX,
												minFontPx: PERIOD_LABEL_MIN_FONT_PX,
												fromParent: true
											}))}
										>
											{periodLabel}
										</p>
									</div>
									{#if timeRange}
										<p class="text-label-medium text-on-surface tabular-nums">
											{timeRange.endTime}
										</p>
									{/if}
								</div>

								<div
									class="w-1 shrink-0 self-stretch rounded-full"
									style:background-color={paint.background}
									aria-hidden="true"
								></div>

								<div class="min-w-0 flex-1">
									<div class="flex items-start justify-between gap-2">
										<p class="text-title-medium truncate text-on-surface">
											{entry.hit.course.name}
										</p>
										{#if entry.status === 'current'}
											<span
												class="text-label-small shrink-0 rounded-full bg-primary px-2 py-0.5 text-on-primary"
											>
												{pt('screen.status.current')}
											</span>
										{/if}
									</div>

									{#if (screen.scope === 'all' && entry.hit.timetableName) || entry.hit.course.location || entry.hit.course.teacher}
										<div class="text-body-small mt-1 flex flex-col gap-1 text-on-surface-variant">
											{#if screen.scope === 'all' && entry.hit.timetableName}
												<p>
													{pt('screen.course.timetable', { name: entry.hit.timetableName })}
												</p>
											{/if}

											{#if entry.hit.course.location}
												<p>{entry.hit.course.location}</p>
											{/if}

											{#if entry.hit.course.teacher}
												<p>{entry.hit.course.teacher}</p>
											{/if}
										</div>
									{/if}
								</div>
							{/snippet}

							{#if courseEditorNavigation}
								<button
									type="button"
									class="flex w-full gap-3 px-4 py-4 text-left transition-colors hover:bg-surface-container-low {entry.status ===
									'past'
										? 'opacity-60'
										: ''}"
									onclick={() => openCourseEditor(entry.hit.course.id)}
								>
									{@render courseRowContent()}
								</button>
							{:else}
								<div class="flex gap-3 px-4 py-4 {entry.status === 'past' ? 'opacity-60' : ''}">
									{@render courseRowContent()}
								</div>
							{/if}
						</li>
					{/each}
				</ul>
			</section>
		{/if}
	</div>
</div>
