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
		...props
	}: {
		label: string;
		value?: string;
		multiline?: boolean;
		rows?: number;
		id?: string;
		type?: HTMLInputElement['type'];
		class?: string;
	} & HTMLInputAttributes &
		HTMLTextareaAttributes = $props();

	const inputClass = 'm3-field-input';
</script>

<label class={['block space-y-1', className]} for={id}>
	<span class="m3-field-label">{label}</span>
	{#if multiline}
		<textarea {id} class={inputClass} {rows} bind:value {...props}></textarea>
	{:else}
		<input {id} class={inputClass} {type} bind:value {...props} />
	{/if}
</label>
