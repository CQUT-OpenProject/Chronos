<script lang="ts">
	import type { ReactiveChronosController } from '@chronos/ui-kit';
	import { appLocaleToBcp47, pluginText } from '@chronos/ui-kit';
	import {
		filterHolidaysInTermRange,
		formatCompactDate,
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
	const groupedHolidays = $derived(groupByMonth(termHolidays));
	const hasSyncedBefore = $derived(Boolean(holidayCalendar?.syncedAt));

	function pt(key: keyof (typeof HOLIDAY_MESSAGES)['zh-cn']) {
		return pluginText(controller, HOLIDAY_PLUGIN_ID, HOLIDAY_MESSAGES, key);
	}

	function groupByMonth(
		holidays: CalendarHoliday[]
	): Array<{ key: string; items: CalendarHoliday[] }> {
		const groups = new Map<string, CalendarHoliday[]>();
		for (const holiday of holidays) {
			const key = holiday.date.slice(0, 7);
			const bucket = groups.get(key) ?? [];
			bucket.push(holiday);
			groups.set(key, bucket);
		}
		return [...groups.entries()].map(([key, items]) => ({ key, items }));
	}

	function formatHolidayRow(holiday: CalendarHoliday, locale: string): string {
		const date = new Date(`${holiday.date}T12:00:00`);
		const dateLabel = formatCompactDate(holiday.date);
		const weekday = date.toLocaleDateString(locale, {
			weekday: 'short'
		});
		return pt('screen.list.row')
			.replace('{date}', dateLabel)
			.replace('{label}', holiday.label)
			.replace('{weekday}', weekday);
	}

	function formatSyncedAt(syncedAt?: number): string {
		if (!syncedAt) return pt('screen.sync.never');
		const date = new Date(syncedAt);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		const hour = String(date.getHours()).padStart(2, '0');
		const minute = String(date.getMinutes()).padStart(2, '0');
		const compactDate = formatCompactDate(`${year}-${month}-${day}`);
		return pt('screen.sync.last').replace('{time}', `${compactDate} ${hour}:${minute}`);
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
		<p class="text-body-medium text-on-surface-variant">{pt('screen.intro.body')}</p>
		<button
			type="button"
			class="text-label-large mt-4 w-full rounded-full bg-primary px-4 py-3 text-on-primary disabled:opacity-50"
			disabled={syncing || !timetable}
			onclick={onSync}
		>
			{syncing
				? pt('screen.sync.syncing')
				: hasSyncedBefore
					? pt('screen.sync.resync')
					: pt('screen.sync.action')}
		</button>
		<div class="mt-3 flex items-center justify-between gap-3">
			<a
				class="text-body-small shrink-0 text-primary"
				href="https://github.com/NateScarlet/holiday-cn"
				target="_blank"
				rel="noreferrer"
			>
				{pt('screen.intro.source')}
			</a>
			<p class="text-body-small text-right text-on-surface-variant">
				{formatSyncedAt(holidayCalendar?.syncedAt)}
			</p>
		</div>
	</section>

	<section class="rounded-2xl border border-outline/20 bg-surface p-4 shadow-xs">
		<h3 class="text-title-small text-on-surface">{pt('screen.list.heading')}</h3>

		{#if termHolidays.length === 0}
			<p class="text-body-medium py-6 text-center text-on-surface-variant">
				{holidayCalendar?.holidays.length ? pt('screen.list.empty') : pt('screen.list.emptyHint')}
			</p>
		{:else}
			<div class="mt-3 flex flex-col gap-4">
				{#each groupedHolidays as group (group.key)}
					<ul class="divide-y divide-outline/10">
						{#each group.items as holiday (holiday.date)}
							<li class="py-3">
								<span class="text-body-medium text-on-surface"
									>{formatHolidayRow(holiday, controller.currentLocale)}</span
								>
							</li>
						{/each}
					</ul>
				{/each}
			</div>
		{/if}
	</section>

	{#if errorMessage}
		<p class="text-body-small text-error">{errorMessage}</p>
	{/if}
</div>
