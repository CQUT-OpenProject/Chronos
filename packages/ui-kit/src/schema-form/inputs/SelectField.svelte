<script lang="ts">
	interface SelectOption {
		label: string;
		value: string | number;
	}

	interface Props {
		id?: string;
		label: string;
		options?: SelectOption[];
		value?: string | number;
		disabled?: boolean;
		required?: boolean;
		description?: string;
		onchange?: (e: Event & { currentTarget: HTMLSelectElement }) => void;
	}

	let {
		id,
		label,
		options = [],
		value = $bindable(),
		disabled = false,
		required = false,
		description = '',
		onchange
	}: Props = $props();

	const instanceId = $props.id();
	const inputId = $derived(id || instanceId);
</script>

<div class="ui-form-field">
	<label class="ui-field-label" for={inputId}>
		{label}
		{#if required}
			<span class="text-error">*</span>
		{/if}
	</label>

	<select
		id={inputId}
		{disabled}
		{required}
		value={value ?? options[0]?.value ?? ''}
		onchange={(e) => {
			value = e.currentTarget.value;
			onchange?.(e);
		}}
		class="ui-form-field-input"
	>
		{#each options as opt (opt.value)}
			<option value={opt.value}>{opt.label}</option>
		{/each}
	</select>

	{#if description}
		<span class="text-body-small text-on-surface-variant">{description}</span>
	{/if}
</div>
