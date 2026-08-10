<script lang="ts">
	import { DatePicker } from 'bits-ui';
	import type { DateValue } from '@internationalized/date';
	import { CalendarMonth, ChevronLeft, ChevronRight } from '$lib/icons';
	import {
		calendarDateToIso,
		formatDateDisplay,
		isoToCalendarDate
	} from '$lib/components/ui/date-field-utils';

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

	const displayValue = $derived(formatDateDisplay(value));
	const pickerValue = $derived(isoToCalendarDate(value));

	function handleValueChange(next: DateValue | undefined) {
		const iso = calendarDateToIso(next);
		value = iso;
		onValueChange?.(iso);
	}
</script>

<DatePicker.Root
	value={pickerValue}
	onValueChange={handleValueChange}
	locale="zh-CN"
	weekdayFormat="short"
	weekStartsOn={1}
	fixedWeeks
	readonly
	{disabled}
	{calendarLabel}
>
	<div class={['m3-form-field', className]}>
		<span id={labelId} class="m3-field-label">{label}</span>
		<DatePicker.Input aria-labelledby={labelId}>
			{#snippet child({ props })}
				<div {...props} id={fieldId} class="m3-form-field-input m3-date-field-input">
					<span
						class={[
							'm3-date-field-value m3-body-large truncate',
							displayValue ? 'text-on-surface' : 'text-on-surface-variant/60'
						]}
					>
						{displayValue || '选择日期'}
					</span>
					<DatePicker.Trigger>
						{#snippet child({ props: triggerProps })}
							<button
								{...triggerProps}
								type="button"
								class="m3-date-field-trigger"
								aria-label="打开日历"
								{disabled}
							>
								<CalendarMonth class="size-5" aria-hidden="true" />
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
					{/snippet}
				</DatePicker.Calendar>
			</DatePicker.Content>
		</DatePicker.Portal>
	</div>
</DatePicker.Root>
