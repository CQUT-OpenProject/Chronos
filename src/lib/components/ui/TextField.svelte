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

	const inputClass = 'm3-field-input';

	function handleInput(event: Event) {
		const target = event.currentTarget as HTMLInputElement | HTMLTextAreaElement;
		value = target.value;
		onValueChange?.(target.value);
	}
</script>

<label class={['block space-y-1', className]} for={id}>
	<span class="m3-field-label">{label}</span>
	{#if multiline}
		<textarea {id} class={inputClass} {rows} bind:value oninput={handleInput} {...props}></textarea>
	{:else}
		<input {id} class={inputClass} {type} bind:value oninput={handleInput} {...props} />
	{/if}
</label>
