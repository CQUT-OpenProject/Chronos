<script lang="ts">
	import { onDestroy, untrack } from 'svelte';
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import {
		applyScrollingDotTrackVisual,
		calculateExpandedDotPitchPx,
		calculateExpandedDots,
		calculateExpandedTooltipOffsetX,
		calculateScrollingDotTrack,
		scrollingDotTrackNeedsStructureUpdate
	} from '$lib/timetable/capsule-indicator';
	import { createCapsuleIndicatorGesture } from '$lib/timetable/capsule-indicator-gesture.svelte';
	import type { CapsulePagerPreview } from '$lib/timetable/capsule-pager-preview';
	import { createTransitionStateScheduler } from '$lib/timetable/capsule-indicator-transition';
	import { trackEvent } from '$lib/client/analytics';
	import { haptic } from '$lib/haptic/haptic';

	const STATE_TRANSITION_MS = 200;
	const GLASS_LINGER_MS = 400;
	const GLASS_FADE_MS = 250;

	interface Props {
		screen: TimetableScreenController;
		pagerPreview?: CapsulePagerPreview;
		class?: string;
	}

	let { screen, pagerPreview, class: className = '' }: Props = $props();

	const screenState = $derived(screen.state);
	const startWeek = $derived(screenState.startWeek);
	const endWeek = $derived(screenState.endWeek);
	const displayedWeek = $derived(screenState.displayedWeek);
	const academicWeek = $derived(screenState.academicWeek);
	const hasMultipleWeeks = $derived(startWeek < endWeek);
	const totalWeeks = $derived(Math.max(1, endWeek - startWeek + 1));

	const gesture = createCapsuleIndicatorGesture({
		getStartWeek: () => startWeek,
		getEndWeek: () => endWeek,
		getDisplayedWeek: () => displayedWeek,
		onWeekChange: (week) => screen.setDisplayedWeek(week),
		onScrubCommit: (week) => trackEvent('timetable_week_scrub', { week, trigger: 'scrub' })
	});

	const transitionState = createTransitionStateScheduler();

	let glassLingerActive = $state(false);

	function triggerGlassLinger() {
		glassLingerActive = true;
		transitionState.scheduleTransitionState('glassLinger', GLASS_LINGER_MS, () => {
			glassLingerActive = false;
		});
	}

	function cancelGlassLinger() {
		transitionState.cancel('glassLinger');
		glassLingerActive = false;
	}

	const isExpanded = $derived(gesture.isScrubbing);
	let pagerPreviewActive = $state(false);
	const hasGlass = $derived(isExpanded || pagerPreviewActive || glassLingerActive);
	const indicatorWeek = $derived(gesture.isScrubbing ? gesture.scrubWeek : displayedWeek);
	const ariaWeek = $derived(gesture.isScrubbing ? Math.round(gesture.scrubWeek) : displayedWeek);
	const isInterpolating = $derived(pagerPreviewActive);

	let compactViewportEl = $state<HTMLDivElement | null>(null);

	function onPagerPreviewWeek(week: number | null) {
		if (week === null) {
			if (!pagerPreviewActive) return;
			pagerPreviewActive = false;
			return;
		}

		const becameActive = !pagerPreviewActive;
		pagerPreviewActive = true;

		const track = calculateScrollingDotTrack({
			startWeek,
			endWeek,
			scrollWeek: week,
			previousWindowStart: compactTrack.windowStart,
			currentAcademicWeek: academicWeek
		});

		if (becameActive || scrollingDotTrackNeedsStructureUpdate(compactTrack, track)) {
			compactTrack = track;
			return;
		}

		if (compactViewportEl) {
			applyScrollingDotTrackVisual(track, compactViewportEl);
		}
	}

	let isInitialized = false;
	let prevDisplayedWeek = 0;
	let prevIsExpanded = false;
	let prevPagerPreviewActive = false;

	$effect(() => {
		const currExpanded = isExpanded;
		const currPreviewActive = pagerPreviewActive;
		const currDisplayed = displayedWeek;

		if (!isInitialized) {
			isInitialized = true;
			prevDisplayedWeek = currDisplayed;
			prevIsExpanded = currExpanded;
			prevPagerPreviewActive = currPreviewActive;
			return;
		}

		const wasExpanded = prevIsExpanded;
		const wasPreview = prevPagerPreviewActive;
		const displayedChanged = currDisplayed !== prevDisplayedWeek;

		prevIsExpanded = currExpanded;
		prevPagerPreviewActive = currPreviewActive;
		prevDisplayedWeek = currDisplayed;

		if (currExpanded || currPreviewActive) {
			cancelGlassLinger();
			return;
		}

		if ((wasExpanded && !currExpanded) || (wasPreview && !currPreviewActive) || displayedChanged) {
			triggerGlassLinger();
		}
	});

	$effect(() => {
		if (!pagerPreview) return;
		pagerPreview.attach({ onPagerPreviewWeek });
		return () => pagerPreview.detach();
	});

	let prevTimetableId = $state<string | undefined>(undefined);
	$effect(() => {
		const id = screenState.currentTimetable?.id;
		if (id === prevTimetableId) return;
		prevTimetableId = id;
		pagerPreview?.clearPreview();
	});

	let showExpandedTrack = $state(false);

	$effect(() => {
		if (isExpanded) {
			transitionState.cancel('expandedTrack');
			showExpandedTrack = true;
		} else if (showExpandedTrack && !transitionState.hasPending('expandedTrack')) {
			transitionState.scheduleTransitionState('expandedTrack', STATE_TRANSITION_MS, () => {
				showExpandedTrack = false;
			});
		}
	});

	const isCollapsing = $derived(!isExpanded && showExpandedTrack);
	const isTooltipSlotOpen = $derived(isExpanded || isCollapsing);

	let isTooltipEntering = $state(false);
	let tooltipTrackingActive = $state(false);
	let tooltipTrackTimer: ReturnType<typeof setTimeout> | null = null;

	$effect(() => {
		if (!isExpanded) {
			isTooltipEntering = false;
			return;
		}

		isTooltipEntering = true;
		let enterFrame = 0;
		let enterFrame2 = 0;
		enterFrame = requestAnimationFrame(() => {
			enterFrame2 = requestAnimationFrame(() => {
				isTooltipEntering = false;
			});
		});

		return () => {
			cancelAnimationFrame(enterFrame);
			cancelAnimationFrame(enterFrame2);
		};
	});

	$effect(() => {
		if (tooltipTrackTimer) {
			clearTimeout(tooltipTrackTimer);
			tooltipTrackTimer = null;
		}

		if (!isExpanded) {
			tooltipTrackingActive = false;
			return;
		}

		tooltipTrackingActive = false;
		tooltipTrackTimer = setTimeout(() => {
			tooltipTrackingActive = true;
			tooltipTrackTimer = null;
		}, STATE_TRANSITION_MS);
	});

	onDestroy(() => {
		if (tooltipTrackTimer) clearTimeout(tooltipTrackTimer);
		transitionState.cancelAll();
		gesture.destroy();
	});

	let compactTrack = $state.raw(
		untrack(() =>
			calculateScrollingDotTrack({
				startWeek,
				endWeek,
				scrollWeek: displayedWeek,
				currentAcademicWeek: academicWeek
			})
		)
	);

	$effect.pre(() => {
		if (pagerPreviewActive || isExpanded) return;
		compactTrack = calculateScrollingDotTrack({
			startWeek,
			endWeek,
			scrollWeek: displayedWeek,
			currentAcademicWeek: academicWeek,
			// The previous viewport is history, not a dependency of its own update.
			previousWindowStart: untrack(() => compactTrack.windowStart)
		});
	});

	const expandedDots = $derived(
		calculateExpandedDots({
			startWeek,
			endWeek,
			currentWeek: indicatorWeek,
			currentAcademicWeek: academicWeek
		})
	);

	const expandedDotStyle = $derived.by(() => {
		if (totalWeeks > 20) {
			return { base: 3.5, gap: 0.25 };
		}
		if (totalWeeks > 14) {
			return { base: 4.5, gap: 0.375 };
		}
		return { base: 5.5, gap: 0.5 };
	});
	const expandedWidth = $derived(
		`calc(${totalWeeks * expandedDotStyle.base}px + ${(totalWeeks - 1) * expandedDotStyle.gap}rem + 1.5rem + 2px)`
	);
	const expandedDotPitchPx = $derived(
		calculateExpandedDotPitchPx(expandedDotStyle.base, expandedDotStyle.gap)
	);
	const tooltipOffsetX = $derived(
		calculateExpandedTooltipOffsetX(gesture.scrubWeek, startWeek, totalWeeks, expandedDotPitchPx)
	);

	function changeWeekByKeyboard(week: number, feedback: () => void) {
		feedback();
		screen.setDisplayedWeek(week);
		trackEvent('timetable_week_scrub', { week, trigger: 'keyboard' });
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') {
			e.preventDefault();
			if (displayedWeek > startWeek) {
				changeWeekByKeyboard(displayedWeek - 1, () => haptic.light());
			}
		} else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') {
			e.preventDefault();
			if (displayedWeek < endWeek) {
				changeWeekByKeyboard(displayedWeek + 1, () => haptic.light());
			}
		} else if (e.key === 'Home') {
			e.preventDefault();
			if (displayedWeek !== startWeek) {
				changeWeekByKeyboard(startWeek, () => haptic.medium());
			}
		} else if (e.key === 'End') {
			e.preventDefault();
			if (displayedWeek !== endWeek) {
				changeWeekByKeyboard(endWeek, () => haptic.medium());
			}
		}
	}

	const tooltipWeekLabel = $derived(
		hostT('timetable.week.label', {
			week: ariaWeek,
			today: ''
		})
	);
</script>

{#snippet compactIndicator()}
	<div class="dots-track-viewport" bind:this={compactViewportEl} aria-hidden="true">
		<div
			class="dots-track dots-track--compact flex items-center justify-center gap-1.5"
			style:--track-offset={compactTrack.trackOffset}
		>
			{#each compactTrack.dots as dot (dot.week)}
				<span
					data-week={dot.week}
					class={[
						'indicator-dot aspect-square rounded-full bg-on-surface',
						isInterpolating && 'indicator-dot--interpolating'
					]}
					style:opacity={dot.opacity}
					style:width="5.5px"
					style:height="5.5px"
				></span>
			{/each}
		</div>
	</div>
{/snippet}

{#snippet expandedIndicator()}
	<div
		class="dots-track flex items-center justify-center"
		style:gap={`${expandedDotStyle.gap}rem`}
		aria-hidden="true"
	>
		{#each expandedDots as dot (dot.week)}
			<span
				class="indicator-dot aspect-square rounded-full bg-on-surface"
				style:opacity={dot.opacity}
				style:width={`${expandedDotStyle.base}px`}
				style:height={`${expandedDotStyle.base}px`}
			></span>
		{/each}
	</div>
{/snippet}

<svelte:window
	onpointermove={gesture.isActive ? gesture.onPointerMove : undefined}
	onpointerup={gesture.isActive ? gesture.onPointerUp : undefined}
	onpointercancel={gesture.isActive ? gesture.onPointerCancel : undefined}
	oncontextmenu={gesture.isActive ? (e) => e.preventDefault() : undefined}
/>

{#if hasMultipleWeeks}
	<div
		class={[
			'capsule-indicator-wrapper absolute bottom-2.5 left-1/2 z-20 flex -translate-x-1/2 touch-none flex-col items-center select-none sm:bottom-3',
			className
		]}
		style:--indicator-transition-duration={`${STATE_TRANSITION_MS}ms`}
		style:--indicator-glass-fade-duration={`${GLASS_FADE_MS}ms`}
	>
		<div
			class={[
				'floating-tooltip pointer-events-none',
				isTooltipSlotOpen && 'floating-tooltip--slot',
				isTooltipEntering && 'floating-tooltip--entering',
				isExpanded && !isTooltipEntering && 'floating-tooltip--visible',
				isExpanded && tooltipTrackingActive && 'floating-tooltip--tracking',
				isCollapsing && 'floating-tooltip--exiting'
			]}
			style:--tooltip-x={`${tooltipOffsetX}px`}
			role="status"
			aria-live="polite"
		>
			{tooltipWeekLabel}
		</div>

		<div
			id="week-indicator"
			bind:this={gesture.containerEl}
			role="slider"
			tabindex="0"
			aria-label={hostT('timetable.week.indicatorAria')}
			aria-valuemin={startWeek}
			aria-valuemax={endWeek}
			aria-valuenow={ariaWeek}
			aria-valuetext={tooltipWeekLabel}
			class={[
				'capsule-indicator inline-flex h-6.5 cursor-pointer items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:outline-none sm:h-7',
				isExpanded && 'capsule-indicator--expanded',
				hasGlass && 'capsule-indicator--glass'
			]}
			style:--expanded-width={expandedWidth}
			onpointerdown={gesture.onPointerDown}
			onlostpointercapture={gesture.onPointerCancel}
			oncontextmenu={(e) => e.preventDefault()}
			onkeydown={onKeydown}
		>
			{#if isExpanded}
				{@render expandedIndicator()}
			{:else if isCollapsing}
				<div class="dots-track-shell">
					{@render compactIndicator()}
					<div class="dots-track-overlay dots-track-overlay--fading">
						{@render expandedIndicator()}
					</div>
				</div>
			{:else}
				{@render compactIndicator()}
			{/if}
		</div>
	</div>
{/if}

<style>
	.capsule-indicator-wrapper {
		--indicator-easing: cubic-bezier(0.2, 0, 0, 1);
	}

	.capsule-indicator {
		--dot-pitch: 11.5px;
		contain: layout style paint;
		overflow: hidden;
		width: calc(4 * var(--dot-pitch) - 6px + 1.25rem + 2px);
		max-width: min(320px, calc(100vw - 2.5rem));
		padding-inline: 0.625rem;
		background-color: transparent;
		backdrop-filter: blur(0px) saturate(1);
		-webkit-backdrop-filter: blur(0px) saturate(1);
		border: 1px solid transparent;
		box-shadow: 0 2px 8px -2px rgb(0 0 0 / 0);
		transition:
			width var(--indicator-transition-duration) var(--indicator-easing),
			padding var(--indicator-transition-duration) var(--indicator-easing),
			background-color var(--indicator-glass-fade-duration) var(--indicator-easing),
			border-color var(--indicator-glass-fade-duration) var(--indicator-easing),
			box-shadow var(--indicator-glass-fade-duration) var(--indicator-easing),
			backdrop-filter var(--indicator-glass-fade-duration) var(--indicator-easing),
			-webkit-backdrop-filter var(--indicator-glass-fade-duration) var(--indicator-easing);
	}

	.capsule-indicator--glass {
		background-color: color-mix(
			in srgb,
			var(--color-surface-container-high, #e5e8f0) 28%,
			transparent
		);
		backdrop-filter: blur(16px) saturate(1.3);
		-webkit-backdrop-filter: blur(16px) saturate(1.3);
		border-color: color-mix(in srgb, var(--color-outline-variant, #aeb2bb) 26%, transparent);
		box-shadow: 0 2px 8px -2px rgb(0 0 0 / 0.1);
		transition:
			width var(--indicator-transition-duration) var(--indicator-easing),
			padding var(--indicator-transition-duration) var(--indicator-easing),
			background-color var(--indicator-transition-duration) var(--indicator-easing),
			border-color var(--indicator-transition-duration) var(--indicator-easing),
			box-shadow var(--indicator-transition-duration) var(--indicator-easing),
			backdrop-filter var(--indicator-transition-duration) var(--indicator-easing),
			-webkit-backdrop-filter var(--indicator-transition-duration) var(--indicator-easing);
	}

	.capsule-indicator--expanded {
		width: var(--expanded-width);
		padding-inline: 0.75rem;
	}

	.dots-track-shell {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
	}

	.dots-track-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: none;
	}

	.dots-track-overlay--fading {
		animation: dots-overlay-fade var(--indicator-transition-duration) var(--indicator-easing)
			forwards;
	}

	@keyframes dots-overlay-fade {
		from {
			opacity: 1;
		}
		to {
			opacity: 0;
		}
	}

	.dots-track {
		opacity: 0.8;
		transition: opacity var(--indicator-glass-fade-duration) var(--indicator-easing);
	}

	.capsule-indicator--glass .dots-track {
		opacity: 1;
		transition: opacity var(--indicator-transition-duration) var(--indicator-easing);
	}

	.dots-track-viewport {
		width: calc(4 * 11.5px - 6px);
		overflow: hidden;
		flex-shrink: 0;
	}

	.dots-track--compact {
		width: max-content;
		transform: translateX(calc(var(--track-offset, 0) * var(--dot-pitch)));
	}

	.floating-tooltip {
		--tooltip-y: -6px;
		border-radius: 9999px;
		background-color: color-mix(in srgb, var(--color-inverse-surface, #2f3033) 70%, transparent);
		backdrop-filter: blur(16px) saturate(1.3);
		-webkit-backdrop-filter: blur(16px) saturate(1.3);
		padding: 0.25rem 0.75rem;
		font-size: 0.75rem;
		line-height: 1rem;
		font-weight: 600;
		white-space: nowrap;
		color: var(--color-inverse-on-surface, #f1f0f4);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		max-height: 0;
		margin-bottom: 0;
		opacity: 0;
		overflow: hidden;
		transform: translateX(0) translateY(var(--tooltip-y));
		transition:
			opacity var(--indicator-transition-duration) var(--indicator-easing),
			transform var(--indicator-transition-duration) var(--indicator-easing);
	}

	.floating-tooltip--slot {
		max-height: 2rem;
		margin-bottom: 1.5rem;
	}

	.floating-tooltip--entering,
	.floating-tooltip--exiting {
		opacity: 0;
		transform: translateX(0) translateY(var(--tooltip-y));
	}

	.floating-tooltip--visible {
		opacity: 1;
		transform: translateX(var(--tooltip-x, 0px)) translateY(var(--tooltip-y));
	}

	.floating-tooltip--visible.floating-tooltip--tracking {
		transition-property: opacity;
	}

	.indicator-dot {
		flex-shrink: 0;
		border-radius: 9999px;
		transition: opacity 160ms cubic-bezier(0.4, 0, 0.2, 1);
	}

	/* 滑动中禁用 opacity 过渡，由 JS 按小数周插值；勿恢复 active 双色背景，会在取整边界突变。 */
	.indicator-dot--interpolating {
		transition: none;
	}

	@media (prefers-reduced-motion: reduce) {
		.capsule-indicator,
		.capsule-indicator--glass,
		.dots-track,
		.indicator-dot,
		.floating-tooltip,
		.dots-track-overlay--fading {
			transition-duration: 1ms !important;
			animation-duration: 1ms !important;
		}
	}

	:root.reduce-motion .capsule-indicator,
	:root.reduce-motion .capsule-indicator--glass,
	:root.reduce-motion .dots-track,
	:root.reduce-motion .indicator-dot,
	:root.reduce-motion .floating-tooltip,
	:root.reduce-motion .dots-track-overlay--fading {
		transition-duration: 1ms !important;
		animation-duration: 1ms !important;
	}
</style>
