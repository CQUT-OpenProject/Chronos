<script lang="ts">
	import { DatePicker } from 'bits-ui';
	import { getLocalTimeZone, today, type DateValue } from '@internationalized/date';
	import {
		buildDateFieldTriggerLabel,
		calendarDateToIso,
		DEFAULT_DATE_FIELD_LABELS,
		formatDateDisplay,
		isoToCalendarDate,
		resolvePickerMonthIso,
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
		variant = 'field',
		locale = 'zh-CN'
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
		/** BCP-47 locale for the calendar heading and weekdays. */
		locale?: string;
	} = $props();

	const instanceId = $props.id();
	const fieldId = $derived(id ?? instanceId);
	const labelId = $derived(`${fieldId}-label`);
	const isSection = $derived(variant === 'section');

	let open = $state(false);
	let draftIso = $state('');
	let placeholder = $state<DateValue | undefined>(undefined);

	const safeValue = $derived(typeof value === 'string' ? value : '');
	const displayValue = $derived(formatDateDisplay(safeValue));
	const triggerAriaLabel = $derived(
		buildDateFieldTriggerLabel(label, open ? draftIso : safeValue, labels)
	);
	const draftPickerValue = $derived(isoToCalendarDate(draftIso));

	function handleOpenChange(nextOpen: boolean) {
		if (nextOpen) {
			draftIso = safeValue;
			placeholder = isoToCalendarDate(
				resolvePickerMonthIso(safeValue, today(getLocalTimeZone()).toString())
			);
		}
	}

	function handleDraftChange(next: DateValue | undefined) {
		draftIso = calendarDateToIso(next);
	}

	function confirmSelection() {
		if (required && !draftIso) return;
		if (draftIso !== safeValue) {
			value = draftIso;
			onValueChange?.(draftIso);
		}
		open = false;
	}

	function selectToday() {
		const next = today(getLocalTimeZone());
		draftIso = calendarDateToIso(next);
		placeholder = next;
	}

	function clearDate() {
		if (required) return;
		draftIso = '';
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
		bind:placeholder
		closeOnDateSelect={false}
		{locale}
		weekdayFormat="narrow"
		weekStartsOn={1}
		fixedWeeks
		{disabled}
		{calendarLabel}
	>
		<div class={isSection ? 'ui-form-field' : ['ui-form-field', className]}>
			{#if !isSection}
				<button
					type="button"
					id={labelId}
					class="ui-field-label cursor-pointer border-0 bg-transparent p-0 text-left"
					onclick={() => (open = true)}
				>
					{label}
					{#if required}
						<span class="ml-0.5 text-error">*</span>
					{/if}
				</button>
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
					<div
						aria-hidden="true"
						class="date-picker-overlay fixed inset-0 z-[70] bg-black/50"
					></div>
				{/if}
				<DatePicker.ContentStatic
					class="ui-date-picker-content fixed top-1/2 left-1/2 z-[70] w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-outline-variant/50 bg-surface-container-high p-4 text-on-surface shadow-xl outline-none"
				>
					<DatePicker.Calendar class="flex w-full flex-col">
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
								<DatePicker.Grid class="w-full">
									{#snippet child({ props })}
										<div {...props} class="w-full">
											<DatePicker.GridHead>
												{#snippet child({ props: headProps })}
													<div {...headProps}>
														<DatePicker.GridRow>
															{#snippet child({ props: rowProps })}
																<div {...rowProps} role="row" class="mb-1 grid grid-cols-7">
																	{#each weekdays as day}
																		<DatePicker.HeadCell>
																			{#snippet child({ props: cellProps })}
																				<div
																					{...cellProps}
																					role="columnheader"
																					class="text-label-small flex h-10 w-full items-center justify-center text-on-surface-variant"
																				>
																					{day}
																				</div>
																			{/snippet}
																		</DatePicker.HeadCell>
																	{/each}
																</div>
															{/snippet}
														</DatePicker.GridRow>
													</div>
												{/snippet}
											</DatePicker.GridHead>
											<DatePicker.GridBody>
												{#snippet child({ props: bodyProps })}
													<div {...bodyProps}>
														{#each month.weeks as weekDates (weekDates)}
															<DatePicker.GridRow>
																{#snippet child({ props: rowProps })}
																	<div {...rowProps} role="row" class="grid grid-cols-7">
																		{#each weekDates as date (date)}
																			<DatePicker.Cell {date} month={month.value}>
																				{#snippet child({ props: cellProps })}
																					<div
																						{...cellProps}
																						class="flex h-10 w-full items-center justify-center p-0"
																					>
																						<DatePicker.Day
																							class="m3-date-picker-day text-body-medium inline-flex size-10 items-center justify-center rounded-full border border-transparent text-on-surface transition-colors hover:bg-on-surface/5 data-disabled:pointer-events-none data-disabled:text-on-surface/30 data-outside-month:text-on-surface-variant/50 data-selected:bg-brand data-selected:font-medium data-selected:text-on-primary data-unavailable:text-on-surface-variant data-unavailable:line-through"
																						>
																							{date.day}
																						</DatePicker.Day>
																					</div>
																				{/snippet}
																			</DatePicker.Cell>
																		{/each}
																	</div>
																{/snippet}
															</DatePicker.GridRow>
														{/each}
													</div>
												{/snippet}
											</DatePicker.GridBody>
										</div>
									{/snippet}
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
										disabled={required || !draftIso}
										onclick={clearDate}
									>
										{labels.clear}
									</button>
								</div>
								<button
									type="button"
									class="text-label-large h-9 rounded-full bg-brand px-4 text-on-primary hover:shadow-xs active:opacity-90 disabled:opacity-40"
									disabled={required && !draftIso}
									onclick={confirmSelection}
								>
									{labels.confirm}
								</button>
							</div>
						{/snippet}
					</DatePicker.Calendar>
				</DatePicker.ContentStatic>
			</DatePicker.Portal>
		</div>
	</DatePicker.Root>
</div>
