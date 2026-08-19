<script lang="ts">
	interface Props {
		id?: string;
		label: string;
		accept?: string;
		disabled?: boolean;
		required?: boolean;
		description?: string;
		value?: unknown;
		onFileSelect?: (content: string) => void;
	}

	let {
		id,
		label,
		accept = '',
		disabled = false,
		required = false,
		description = '',
		value = $bindable(),
		onFileSelect
	}: Props = $props();

	const fallbackId = `input-file-${Math.random().toString(36).slice(2, 9)}`;
	const inputId = $derived(id || fallbackId);
	let selectedFileName = $state<string>('');

	async function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		selectedFileName = file.name;
		const text = await file.text();
		value = text;
		onFileSelect?.(text);
	}
</script>

<div class="flex flex-col gap-1.5 text-left">
	<label for={inputId} class="text-sm font-medium text-on-surface">
		{label}
		{#if required}
			<span class="ml-0.5 text-error">*</span>
		{/if}
	</label>

	<div class="relative flex items-center">
		<input
			id={inputId}
			type="file"
			{accept}
			{disabled}
			{required}
			onchange={handleFileChange}
			class="w-full rounded-xl border border-outline/30 bg-surface-container px-3.5 py-2 text-sm text-on-surface file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-1 file:text-xs file:font-medium file:text-on-primary hover:file:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
		/>
	</div>

	{#if selectedFileName}
		<span class="text-xs text-primary">已选择: {selectedFileName}</span>
	{:else if description}
		<span class="text-xs text-on-surface-variant">{description}</span>
	{/if}
</div>
