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

	const instanceId = $props.id();
	const fieldId = $derived(id ?? instanceId);
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
	<div class={['ui-form-field', className]}>
		<span id={labelId} class="ui-field-label">{label}</span>
		<TimeField.Input
			id={fieldId}
			aria-labelledby={labelId}
			class="ui-form-field-input ui-time-field-input"
		>
			{#snippet children({ segments })}
				<div class="ui-time-field-segments min-w-0">
					{#each segments as { part, value: segmentValue }, index (part + index)}
						<TimeField.Segment
							{part}
							class={[
								'ui-time-field-segment text-body-large',
								part === 'literal' && 'ui-time-field-segment--literal'
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
