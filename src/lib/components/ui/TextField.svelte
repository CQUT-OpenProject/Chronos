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

	const inputClass =
		'w-full rounded-lg border border-outline px-3 py-2 text-sm outline-none focus:border-brand dark:border-outline-variant dark:bg-surface-variant';
</script>

<label class={['block space-y-1', className]} for={id}>
	<span class="text-sm text-on-surface-variant">{label}</span>
	{#if multiline}
		<textarea {id} class={inputClass} {rows} bind:value {...props}></textarea>
	{:else}
		<input {id} class={inputClass} {type} bind:value {...props} />
	{/if}
</label>
