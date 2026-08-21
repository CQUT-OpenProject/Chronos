<script lang="ts">
	import type { ConfigSchema, LocalizedText, SchemaField } from '@chronos/core';
	import TextField from './inputs/TextField.svelte';
	import Checkbox from './inputs/Checkbox.svelte';
	import SelectField from './inputs/SelectField.svelte';
	import FileField from './inputs/FileField.svelte';

	interface Props {
		schema: ConfigSchema<Record<string, unknown>>;
		value?: Record<string, unknown>;
		disabled?: boolean;
		onValueChange?: (value: Record<string, unknown>) => void;
	}

	let { schema, value = $bindable(), disabled = false, onValueChange }: Props = $props();

	function resolveText(text: LocalizedText | undefined): string {
		if (!text) return '';
		return typeof text === 'function' ? text() : text;
	}

	const entries = $derived(Object.entries(schema) as Array<[string, SchemaField<unknown>]>);
	const resolvedValue = $derived(value ?? {});

	function updateField(key: string, nextValue: unknown) {
		const next = {
			...resolvedValue,
			[key]: nextValue
		};
		value = next;
		onValueChange?.(next);
	}
</script>

<div class="flex flex-col gap-4">
	{#each entries as [key, field] (key)}
		{#if !field.hidden}
			{#if field.type === 'string'}
				<TextField
					id="field-{key}"
					label={resolveText(field.title)}
					placeholder={resolveText(field.placeholder)}
					description={resolveText(field.description)}
					required={field.required}
					{disabled}
					value={resolvedValue[key] as string}
					oninput={(e) => updateField(key, e.currentTarget.value)}
				/>
			{:else if field.type === 'password'}
				<TextField
					id="field-{key}"
					type="password"
					label={resolveText(field.title)}
					placeholder={resolveText(field.placeholder)}
					description={resolveText(field.description)}
					required={field.required}
					{disabled}
					value={resolvedValue[key] as string}
					oninput={(e) => updateField(key, e.currentTarget.value)}
				/>
			{:else if field.type === 'number'}
				<TextField
					id="field-{key}"
					type="number"
					label={resolveText(field.title)}
					placeholder={resolveText(field.placeholder)}
					description={resolveText(field.description)}
					required={field.required}
					{disabled}
					value={resolvedValue[key] as number}
					oninput={(e) => updateField(key, Number(e.currentTarget.value))}
				/>
			{:else if field.type === 'boolean'}
				<Checkbox
					id="field-{key}"
					label={resolveText(field.title)}
					description={resolveText(field.description)}
					{disabled}
					checked={Boolean(resolvedValue[key])}
					onchange={(e) => updateField(key, e.currentTarget.checked)}
				/>
			{:else if field.type === 'select'}
				<SelectField
					id="field-{key}"
					label={resolveText(field.title)}
					description={resolveText(field.description)}
					required={field.required}
					options={(field.options || []).map((opt) => ({
						label: resolveText(opt.label),
						value: opt.value
					}))}
					{disabled}
					value={resolvedValue[key] as string | number}
					onchange={(e) => updateField(key, e.currentTarget.value)}
				/>
			{:else if field.type === 'file'}
				<FileField
					id="field-{key}"
					label={resolveText(field.title)}
					accept={field.accept}
					description={resolveText(field.description)}
					required={field.required}
					{disabled}
					value={resolvedValue[key]}
					onValueChange={(val) => updateField(key, val)}
				/>
			{:else if field.type === 'date'}
				<TextField
					id="field-{key}"
					type="date"
					label={resolveText(field.title)}
					placeholder={resolveText(field.placeholder)}
					description={resolveText(field.description)}
					required={field.required}
					{disabled}
					value={resolvedValue[key] as string}
					oninput={(e) => updateField(key, e.currentTarget.value)}
				/>
			{/if}
		{/if}
	{/each}
</div>
