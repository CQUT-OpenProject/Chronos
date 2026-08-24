<script lang="ts">
	import { DatePicker } from 'bits-ui';
	import { getLocalTimeZone, today, type DateValue } from '@internationalized/date';
	import { CalendarMonth, ChevronLeft, ChevronRight } from '$lib/icons';
	import Button from '$lib/components/ui/Button.svelte';
	import {
		buildDateFieldTriggerLabel,
		calendarDateToIso,
		formatDateDisplay,
		isoToCalendarDate
	} from '$lib/components/ui/date-field-utils';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';

	let {
		label,
		value = $bindable(''),
		id,
		class: className = '',
		onValueChange,
		disabled = false,
		calendarLabel = label
	}: {
		label: string;
		value?: string;
		id?: string;
		class?: string;
		onValueChange?: (value: string) => void;
		disabled?: boolean;
		calendarLabel?: string;
	} = $props();

	const fallbackId = `date-field-${Math.random().toString(36).slice(2, 9)}`;
	const fieldId = $derived(id ?? fallbackId);
	const labelId = $derived(`${fieldId}-label`);
	const controller = getAppController();

	let open = $state(false);
	let draftIso = $state('');

	const displayValue = $derived(formatDateDisplay(value));
	const triggerAriaLabel = $derived(buildDateFieldTriggerLabel(label, open ? draftIso : value));
	const draftPickerValue = $derived(isoToCalendarDate(draftIso));

	function handleOpenChange(nextOpen: boolean) {
		if (nextOpen) {
			draftIso = value;
		}
	}

	function handleDraftChange(next: DateValue | undefined) {
		draftIso = calendarDateToIso(next);
	}

	function confirmSelection() {
		if (draftIso !== value) {
			value = draftIso;
			onValueChange?.(draftIso);
		}
		open = false;
	}

	function selectToday() {
		draftIso = calendarDateToIso(today(getLocalTimeZone()));
	}

	function clearDate() {
		draftIso = '';
	}
</script>

<DatePicker.Root
	bind:open
	onOpenChange={handleOpenChange}
	value={draftPickerValue}
	onValueChange={handleDraftChange}
	closeOnDateSelect={false}
	locale="zh-CN"
	weekdayFormat="short"
	weekStartsOn={1}
	fixedWeeks
	{disabled}
	{calendarLabel}
>
	<div class={['m3-form-field', className]}>
		<span id={labelId} class="m3-field-label">{label}</span>
		<DatePicker.Input aria-labelledby={labelId}>
			{#snippet child({ props })}
				<div {...props} id={fieldId}>
					<DatePicker.Trigger>
						{#snippet child({ props: triggerProps })}
							<button
								{...triggerProps}
								type="button"
								class="m3-form-field-input m3-date-field-input"
								aria-label={triggerAriaLabel}
								{disabled}
							>
								<span
									class={[
										'm3-date-field-value m3-body-large truncate text-left',
										displayValue ? 'text-on-surface' : 'text-on-surface-variant/60'
									]}
								>
									{displayValue || hostTextRead(controller, 'ui.date.placeholder')}
								</span>
								<span class="m3-date-field-trigger" aria-hidden="true">
									<CalendarMonth class="size-5" />
								</span>
							</button>
						{/snippet}
					</DatePicker.Trigger>
				</div>
			{/snippet}
		</DatePicker.Input>

		<DatePicker.Portal>
			<DatePicker.Content
				sideOffset={8}
				class="m3-date-picker-content z-[60] rounded-2xl border border-outline-variant/50 bg-surface-container-high p-4 text-on-surface shadow-xl outline-none"
			>
				<DatePicker.Calendar>
					{#snippet children({ months, weekdays })}
						<DatePicker.Header class="mb-3 flex items-center justify-between gap-2">
							<DatePicker.PrevButton
								class="inline-flex size-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-on-surface/5 active:bg-on-surface/10"
							>
								<ChevronLeft class="size-5" aria-hidden="true" />
							</DatePicker.PrevButton>
							<DatePicker.Heading class="m3-title-small text-on-surface" />
							<DatePicker.NextButton
								class="inline-flex size-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-on-surface/5 active:bg-on-surface/10"
							>
								<ChevronRight class="size-5" aria-hidden="true" />
							</DatePicker.NextButton>
						</DatePicker.Header>

						{#each months as month (month.value)}
							<DatePicker.Grid class="w-full border-collapse">
								<DatePicker.GridHead>
									<DatePicker.GridRow class="mb-1 flex w-full justify-between">
										{#each weekdays as day (day)}
											<DatePicker.HeadCell
												class="m3-label-small flex size-10 items-center justify-center text-on-surface-variant"
											>
												{day.slice(-1)}
											</DatePicker.HeadCell>
										{/each}
									</DatePicker.GridRow>
								</DatePicker.GridHead>
								<DatePicker.GridBody>
									{#each month.weeks as weekDates (weekDates)}
										<DatePicker.GridRow class="flex w-full">
											{#each weekDates as date (date)}
												<DatePicker.Cell {date} month={month.value} class="p-0 text-center">
													<DatePicker.Day
														class="m3-date-picker-day m3-body-medium inline-flex size-10 items-center justify-center rounded-full border border-transparent text-on-surface transition-colors hover:bg-on-surface/5 data-disabled:pointer-events-none data-disabled:text-on-surface/30 data-outside-month:text-on-surface-variant/50 data-selected:bg-brand data-selected:font-medium data-selected:text-on-primary data-unavailable:text-on-surface-variant data-unavailable:line-through"
													>
														{date.day}
													</DatePicker.Day>
												</DatePicker.Cell>
											{/each}
										</DatePicker.GridRow>
									{/each}
								</DatePicker.GridBody>
							</DatePicker.Grid>
						{/each}

						<div
							class="mt-3 flex items-center justify-between gap-2 border-t border-outline-variant/40 pt-3"
						>
							<div class="flex items-center gap-1">
								<Button variant="text" class="h-9 px-3" onclick={selectToday}>
									{hostTextRead(controller, 'ui.date.today')}
								</Button>
								<Button
									variant="text"
									class="h-9 px-3 text-on-surface-variant"
									disabled={!draftIso}
									onclick={clearDate}
								>
									{hostTextRead(controller, 'ui.date.clear')}
								</Button>
							</div>
							<Button class="h-9 px-4" onclick={confirmSelection}>
								{hostTextRead(controller, 'ui.date.confirm')}
							</Button>
						</div>
					{/snippet}
				</DatePicker.Calendar>
			</DatePicker.Content>
		</DatePicker.Portal>
	</div>
</DatePicker.Root>
