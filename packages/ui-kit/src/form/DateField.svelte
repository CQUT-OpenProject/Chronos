<script lang="ts">
	import { DatePicker } from 'bits-ui';
	import { getLocalTimeZone, today, type DateValue } from '@internationalized/date';
	import {
		buildDateFieldTriggerLabel,
		calendarDateToIso,
		DEFAULT_DATE_FIELD_LABELS,
		formatDateDisplay,
		isoToCalendarDate,
		type DateFieldLabels
	} from './date-field-utils';

	let {
		label,
		value = $bindable(''),
		id,
		class: className = '',
		onValueChange,
		disabled = false,
		calendarLabel = label,
		labels = DEFAULT_DATE_FIELD_LABELS,
		required = false,
		description,
		variant = 'field'
	}: {
		label: string;
		value?: string;
		id?: string;
		class?: string;
		onValueChange?: (value: string) => void;
		disabled?: boolean;
		calendarLabel?: string;
		labels?: DateFieldLabels;
		required?: boolean;
		description?: string;
		variant?: 'field' | 'section';
	} = $props();

	const instanceId = $props.id();
	const fieldId = $derived(id ?? instanceId);
	const labelId = $derived(`${fieldId}-label`);
	const isSection = $derived(variant === 'section');

	let open = $state(false);
	let draftIso = $state('');

	const displayValue = $derived(formatDateDisplay(value));
	const triggerAriaLabel = $derived(
		buildDateFieldTriggerLabel(label, open ? draftIso : value, labels)
	);
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

	function dismissPicker() {
		open = false;
	}
</script>

<div class={isSection ? ['flex flex-col gap-3', className] : undefined}>
	{#if isSection}
		<div class="px-1">
			<h3 id={labelId} class="text-title-medium text-on-surface">
				{label}
				{#if required}
					<span class="ml-0.5 text-error">*</span>
				{/if}
			</h3>
			{#if description}
				<p class="text-body-small mt-1 text-on-surface-variant">{description}</p>
			{/if}
		</div>
	{/if}

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
		<div class={isSection ? 'ui-form-field' : ['ui-form-field', className]}>
			{#if !isSection}
				<span id={labelId} class="ui-field-label">
					{label}
					{#if required}
						<span class="ml-0.5 text-error">*</span>
					{/if}
				</span>
			{/if}
			<DatePicker.Input aria-labelledby={labelId}>
				{#snippet child({ props })}
					<div {...props} id={fieldId}>
						<DatePicker.Trigger>
							{#snippet child({ props: triggerProps })}
								<button
									{...triggerProps}
									type="button"
									class="ui-form-field-input ui-date-field-input"
									aria-label={triggerAriaLabel}
									{disabled}
								>
									<span
										class={[
											'ui-date-field-value text-body-large truncate text-left',
											displayValue ? 'text-on-surface' : 'text-on-surface-variant/60'
										]}
									>
										{displayValue || labels.placeholder}
									</span>
									<span class="ui-date-field-trigger" aria-hidden="true">
										<svg class="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
											<path
												d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 16H5V10h14v10Zm0-12H5V6h14v2Z"
											/>
										</svg>
									</span>
								</button>
							{/snippet}
						</DatePicker.Trigger>
					</div>
				{/snippet}
			</DatePicker.Input>

			<DatePicker.Portal>
				{#if open}
					<button
						type="button"
						tabindex="-1"
						class="date-picker-overlay fixed inset-0 z-[70] bg-black/50 backdrop-blur-xs"
						aria-label="关闭"
						onclick={dismissPicker}
					></button>
				{/if}
				<DatePicker.Content
					sideOffset={8}
					class="ui-date-picker-content z-[70] rounded-2xl border border-outline-variant/50 bg-surface-container-high p-4 text-on-surface shadow-xl outline-none"
				>
					<DatePicker.Calendar>
						{#snippet children({ months, weekdays })}
							<DatePicker.Header class="mb-3 flex items-center justify-between gap-2">
								<DatePicker.PrevButton
									class="inline-flex size-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-on-surface/5 active:bg-on-surface/10"
								>
									<svg class="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
										<path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
									</svg>
								</DatePicker.PrevButton>
								<DatePicker.Heading class="text-title-small text-on-surface" />
								<DatePicker.NextButton
									class="inline-flex size-10 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-on-surface/5 active:bg-on-surface/10"
								>
									<svg class="size-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
										<path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
									</svg>
								</DatePicker.NextButton>
							</DatePicker.Header>

							{#each months as month (month.value)}
								<DatePicker.Grid class="w-full border-collapse">
									<DatePicker.GridHead>
										<DatePicker.GridRow class="mb-1 flex w-full justify-between">
											{#each weekdays as day (day)}
												<DatePicker.HeadCell
													class="text-label-small flex size-10 items-center justify-center text-on-surface-variant"
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
															class="m3-date-picker-day text-body-medium inline-flex size-10 items-center justify-center rounded-full border border-transparent text-on-surface transition-colors hover:bg-on-surface/5 data-disabled:pointer-events-none data-disabled:text-on-surface/30 data-outside-month:text-on-surface-variant/50 data-selected:bg-brand data-selected:font-medium data-selected:text-on-primary data-unavailable:text-on-surface-variant data-unavailable:line-through"
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
									<button
										type="button"
										class="text-label-large h-9 rounded-full px-3 text-brand hover:bg-brand/10 active:bg-brand/20"
										onclick={selectToday}
									>
										{labels.today}
									</button>
									<button
										type="button"
										class="text-label-large h-9 rounded-full px-3 text-on-surface-variant hover:bg-on-surface/5 disabled:opacity-40"
										disabled={!draftIso}
										onclick={clearDate}
									>
										{labels.clear}
									</button>
								</div>
								<button
									type="button"
									class="text-label-large h-9 rounded-full bg-brand px-4 text-on-primary hover:shadow-xs active:opacity-90"
									onclick={confirmSelection}
								>
									{labels.confirm}
								</button>
							</div>
						{/snippet}
					</DatePicker.Calendar>
				</DatePicker.Content>
			</DatePicker.Portal>
		</div>
	</DatePicker.Root>
</div>
