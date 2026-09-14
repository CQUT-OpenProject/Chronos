<script lang="ts">
	interface Props {
		id?: string;
		type?: string;
		label: string;
		placeholder?: string;
		value?: string | number;
		disabled?: boolean;
		required?: boolean;
		description?: string;
		oninput?: (e: Event & { currentTarget: HTMLInputElement }) => void;
	}

	let {
		id,
		type = 'text',
		label,
		placeholder = '',
		value = $bindable(),
		disabled = false,
		required = false,
		description = '',
		oninput
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

	<input
		id={inputId}
		{type}
		{placeholder}
		{disabled}
		{required}
		value={value ?? ''}
		oninput={(e) => {
			value = e.currentTarget.value;
			oninput?.(e);
		}}
		class="ui-form-field-input"
	/>

	{#if description}
		<span class="text-body-small text-on-surface-variant">{description}</span>
	{/if}
</div>
