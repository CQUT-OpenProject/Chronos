<script lang="ts">
	import type { HTMLInputAttributes, HTMLTextareaAttributes } from 'svelte/elements';

	let {
		label,
		value = $bindable(''),
		multiline = false,
		rows = 3,
		id,
		type = 'text',
		class: className = '',
		onValueChange,
		...props
	}: {
		label: string;
		value?: string;
		multiline?: boolean;
		rows?: number;
		id?: string;
		type?: HTMLInputElement['type'];
		class?: string;
		onValueChange?: (value: string) => void;
	} & HTMLInputAttributes &
		HTMLTextareaAttributes = $props();

	const fallbackId = `text-field-${Math.random().toString(36).slice(2, 9)}`;
	const fieldId = $derived(id ?? fallbackId);

	function handleInput(event: Event) {
		const target = event.currentTarget as HTMLInputElement | HTMLTextAreaElement;
		value = target.value;
		onValueChange?.(target.value);
	}
</script>

<div class={['m3-form-field', multiline && 'm3-form-field--multiline', className]}>
	<label class="m3-field-label" for={fieldId}>{label}</label>
	{#if multiline}
		<textarea
			id={fieldId}
			class="m3-form-field-input"
			{rows}
			bind:value
			oninput={handleInput}
			{...props}></textarea>
	{:else}
		<input
			id={fieldId}
			class="m3-form-field-input"
			{type}
			bind:value
			oninput={handleInput}
			{...props}
		/>
	{/if}
</div>
