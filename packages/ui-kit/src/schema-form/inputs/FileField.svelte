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
		onValueChange?: (val: unknown) => void;
	}

	let {
		id,
		label,
		accept = '',
		disabled = false,
		required = false,
		description = '',
		value = $bindable(),
		onFileSelect,
		onValueChange
	}: Props = $props();

	const instanceId = $props.id();
	const inputId = $derived(id || instanceId);
	let selectedFileName = $state<string>('');

	async function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		selectedFileName = file.name;
		const isImageOrBinary =
			accept.includes('image') ||
			accept.includes('.png') ||
			accept.includes('.jpg') ||
			accept.includes('.jpeg') ||
			accept.includes('.webp');

		if (isImageOrBinary) {
			const buffer = await file.arrayBuffer();
			const bytes = new Uint8Array(buffer);
			value = bytes;
			onFileSelect?.(file.name);
			onValueChange?.(bytes);
		} else {
			const text = await file.text();
			value = text;
			onFileSelect?.(text);
			onValueChange?.(text);
		}
	}
</script>

<div class="ui-form-field">
	<span class="ui-field-label">
		{label}
		{#if required}
			<span class="text-error">*</span>
		{/if}
	</span>

	<label class="ui-btn ui-btn-outlined w-full cursor-pointer">
		<span>{selectedFileName || description || 'Choose file'}</span>
		<input
			id={inputId}
			type="file"
			{accept}
			{disabled}
			{required}
			onchange={handleFileChange}
			class="sr-only"
		/>
	</label>
</div>
