<script lang="ts">
	import { TimeField, type TimeValue } from 'bits-ui';
	import { ScheduleFill } from '$lib/icons';
	import { parseTimeString, timeToString } from '$lib/components/ui/time-field-utils';

	let {
		label,
		value = $bindable(''),
		id,
		class: className = '',
		onValueChange,
		disabled = false
	}: {
		label: string;
		value?: string;
		id?: string;
		class?: string;
		onValueChange?: (value: string) => void;
		disabled?: boolean;
	} = $props();

	const fallbackId = `time-field-${Math.random().toString(36).slice(2, 9)}`;
	const fieldId = $derived(id ?? fallbackId);
	const labelId = $derived(`${fieldId}-label`);

	const pickerValue = $derived(parseTimeString(value));

	function handleValueChange(next: TimeValue | undefined) {
		const nextValue = timeToString(next);
		value = nextValue;
		onValueChange?.(nextValue);
	}
</script>

<TimeField.Root
	value={pickerValue}
	onValueChange={handleValueChange}
	locale="zh-CN"
	hourCycle={24}
	granularity="minute"
	{disabled}
>
	<div class={['m3-form-field', className]}>
		<span id={labelId} class="m3-field-label">{label}</span>
		<TimeField.Input
			id={fieldId}
			aria-labelledby={labelId}
			class="m3-form-field-input m3-time-field-input"
		>
			{#snippet children({ segments })}
				<div class="m3-time-field-segments min-w-0">
					{#each segments as { part, value: segmentValue }, index (part + index)}
						<TimeField.Segment
							{part}
							class={[
								'm3-time-field-segment m3-body-large',
								part === 'literal' && 'm3-time-field-segment--literal'
							]}
						>
							{segmentValue}
						</TimeField.Segment>
					{/each}
				</div>
				<ScheduleFill class="size-5 shrink-0 text-on-surface-variant" aria-hidden="true" />
			{/snippet}
		</TimeField.Input>
	</div>
</TimeField.Root>
