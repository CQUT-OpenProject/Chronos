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

	let focused = $state(false);
	const labelFloated = $derived(focused || value.length > 0);

	function handleFocus() {
		focused = true;
	}

	function handleBlur() {
		focused = false;
	}

	function handleInput(event: Event) {
		const target = event.currentTarget as HTMLInputElement | HTMLTextAreaElement;
		value = target.value;
		onValueChange?.(target.value);
	}
</script>

<div
	class={['m3-outlined-field', multiline && 'm3-outlined-field--multiline', className]}
	data-floated={labelFloated || undefined}
>
	<label class="m3-outlined-field-label" for={fieldId}>{label}</label>
	{#if multiline}
		<textarea
			id={fieldId}
			class="m3-outlined-field-input"
			{rows}
			bind:value
			onfocus={handleFocus}
			onblur={handleBlur}
			oninput={handleInput}
			{...props}></textarea>
	{:else}
		<input
			id={fieldId}
			class="m3-outlined-field-input"
			{type}
			bind:value
			onfocus={handleFocus}
			onblur={handleBlur}
			oninput={handleInput}
			{...props}
		/>
	{/if}
</div>
