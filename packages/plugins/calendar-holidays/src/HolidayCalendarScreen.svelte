<script lang="ts">
	import type { ReactiveChronosController } from '@chronos/ui-kit';
	import { pluginText } from '@chronos/ui-kit';
	import {
		filterHolidaysInTermRange,
		inferYearsFromAcademicConfig,
		type CalendarHoliday
	} from '@chronos/core';
	import { HOLIDAY_MESSAGES } from './messages';
	import { HOLIDAY_PLUGIN_ID } from './constants';
	import { syncHolidayCalendarFromHolidayCn } from './holiday-sync';

	interface Props {
		controller: ReactiveChronosController;
		pluginId: string;
	}

	let { controller, pluginId }: Props = $props();

	let syncing = $state(false);
	let errorMessage = $state<string | null>(null);

	const timetable = $derived(controller.currentTimetable);
	const holidayCalendar = $derived(timetable?.academicConfig.holidayCalendar);
	const termHolidays = $derived(
		timetable && holidayCalendar
			? filterHolidaysInTermRange(holidayCalendar.holidays, timetable.academicConfig)
			: []
	);
	const syncYears = $derived(
		timetable ? inferYearsFromAcademicConfig(timetable.academicConfig).join('、') : ''
	);
	const groupedHolidays = $derived(groupByMonth(termHolidays));
	const hasSyncedBefore = $derived(Boolean(holidayCalendar?.syncedAt));

	function pt(key: keyof (typeof HOLIDAY_MESSAGES)['zh-cn']) {
		return pluginText(controller, HOLIDAY_PLUGIN_ID, HOLIDAY_MESSAGES, key);
	}

	function groupByMonth(
		holidays: CalendarHoliday[]
	): Array<{ month: string; items: CalendarHoliday[] }> {
		const groups = new Map<string, CalendarHoliday[]>();
		for (const holiday of holidays) {
			const month = `${Number(holiday.date.slice(5, 7))}月`;
			const bucket = groups.get(month) ?? [];
			bucket.push(holiday);
			groups.set(month, bucket);
		}
		return [...groups.entries()].map(([month, items]) => ({ month, items }));
	}

	function formatHolidayRow(holiday: CalendarHoliday): string {
		const month = Number(holiday.date.slice(5, 7));
		const day = Number(holiday.date.slice(8, 10));
		const weekday = new Date(`${holiday.date}T12:00:00`).toLocaleDateString('zh-CN', {
			weekday: 'short'
		});
		return `${month}月${day}日 · ${holiday.label} · ${weekday}`;
	}

	function formatSyncedAt(syncedAt?: number): string {
		if (!syncedAt) return pt('screen.sync.never');
		const date = new Date(syncedAt);
		return pt('screen.sync.last').replace(
			'{time}',
			date.toLocaleString(undefined, {
				month: 'numeric',
				day: 'numeric',
				hour: '2-digit',
				minute: '2-digit'
			})
		);
	}

	async function onSync() {
		if (!timetable) {
			errorMessage = pt('screen.error.noTimetable');
			return;
		}
		syncing = true;
		errorMessage = null;
		try {
			const ctx = controller.getPluginContext(pluginId);
			await syncHolidayCalendarFromHolidayCn(ctx, { force: true });
			ctx.actions.notify(pt('screen.notify.synced'), 'info');
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : pt('screen.error.syncFailed');
		} finally {
			syncing = false;
		}
	}
</script>

<div class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
	<section class="rounded-2xl border border-outline/20 bg-surface p-4 shadow-xs">
		<h2 class="m3-title-medium text-on-surface">{pt('screen.intro.title')}</h2>
		<p class="m3-body-medium mt-2 text-on-surface-variant">{pt('screen.intro.body')}</p>
		<a
			class="m3-body-small mt-2 inline-block text-primary"
			href="https://github.com/NateScarlet/holiday-cn"
			target="_blank"
			rel="noreferrer"
		>
			{pt('screen.intro.source')}
		</a>
	</section>

	<section class="rounded-2xl border border-outline/20 bg-surface p-4 shadow-xs">
		<h3 class="m3-title-small text-on-surface">{pt('screen.sync.title')}</h3>
		{#if syncYears}
			<p class="m3-body-small mt-1 text-on-surface-variant">
				{pt('screen.sync.years').replace('{years}', syncYears)}
			</p>
		{/if}
		<p class="m3-body-small mt-2 text-on-surface-variant">
			{formatSyncedAt(holidayCalendar?.syncedAt)}
		</p>
		<button
			type="button"
			class="m3-label-large mt-4 w-full rounded-full bg-primary px-4 py-3 text-on-primary disabled:opacity-50"
			disabled={syncing || !timetable}
			onclick={onSync}
		>
			{syncing
				? pt('screen.sync.syncing')
				: hasSyncedBefore
					? pt('screen.sync.resync')
					: pt('screen.sync.action')}
		</button>
	</section>

	<section class="rounded-2xl border border-outline/20 bg-surface p-4 shadow-xs">
		<h3 class="m3-title-small text-on-surface">{pt('screen.list.heading')}</h3>

		{#if termHolidays.length === 0}
			<p class="m3-body-medium py-6 text-center text-on-surface-variant">
				{holidayCalendar?.holidays.length ? pt('screen.list.empty') : pt('screen.list.emptyHint')}
			</p>
		{:else}
			{#each groupedHolidays as group (group.month)}
				<div class="mt-3 mb-3">
					<p class="m3-label-large mb-1 text-on-surface-variant">{group.month}</p>
					<ul class="divide-y divide-outline/10">
						{#each group.items as holiday (holiday.date)}
							<li class="py-3">
								<span class="m3-body-medium text-on-surface">{formatHolidayRow(holiday)}</span>
							</li>
						{/each}
					</ul>
				</div>
			{/each}
		{/if}
	</section>

	{#if errorMessage}
		<p class="m3-body-small text-error">{errorMessage}</p>
	{/if}
</div>
