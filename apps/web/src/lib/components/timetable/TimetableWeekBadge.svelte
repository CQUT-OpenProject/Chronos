<script lang="ts">
	import { dayOfWeekFromIso } from '@chronos/core';
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { timetableDayLabel } from '$lib/timetable/day-labels';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';

	let { screen }: { screen: TimetableScreenController } = $props();

	const week = $derived(screen.state.displayedWeek);
	const isCurrentWeek = $derived(week === screen.state.academicWeek);
	const day = $derived(dayOfWeekFromIso(screen.state.today));
	const dayLabel = $derived(isCurrentWeek ? timetableDayLabel(day) : '');
	const accessibleLabel = $derived(
		hostT('timetable.week.label', { week, today: dayLabel ? ` ${dayLabel}` : '' })
	);
</script>

<div class="week-badge" role="img" aria-label={accessibleLabel}>
	<div class="week-number" aria-hidden="true">
		<span class="week-affix">{hostT('timetable.week.compactLead')}</span>
		<span class="week-value">{week}</span>
		<span class="week-affix">{hostT('timetable.week.compactTail')}</span>
	</div>
	{#if isCurrentWeek && dayLabel}
		<span class="weekday" aria-hidden="true">{dayLabel}</span>
	{/if}
</div>

<style>
	.week-badge {
		display: flex;
		width: 100%;
		min-height: 4.5rem;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
		gap: 0.125rem;
		padding-top: 1rem;
		color: var(--color-on-surface);
		font-variant-numeric: tabular-nums;
	}

	.week-number {
		display: flex;
		align-items: baseline;
		gap: 0.125rem;
	}

	.week-value {
		font-size: 1.5rem;
		line-height: 1.5rem;
		font-weight: 700;
		letter-spacing: -0.04em;
	}

	.week-affix,
	.weekday {
		font-size: 0.625rem;
		font-weight: 600;
		white-space: nowrap;
	}

	.weekday {
		border-top: 1px solid var(--color-outline-variant);
		padding-top: 0.125rem;
	}
</style>
