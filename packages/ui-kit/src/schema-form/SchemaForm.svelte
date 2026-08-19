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
	}

	let { schema, value = $bindable({}), disabled = false }: Props = $props();

	function resolveText(text: LocalizedText | undefined): string {
		if (!text) return '';
		return typeof text === 'function' ? text() : text;
	}

	const entries = $derived(Object.entries(schema) as Array<[string, SchemaField<unknown>]>);
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
					bind:value={value[key] as string}
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
					bind:value={value[key] as string}
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
					bind:value={value[key] as number}
				/>
			{:else if field.type === 'boolean'}
				<Checkbox
					id="field-{key}"
					label={resolveText(field.title)}
					description={resolveText(field.description)}
					{disabled}
					bind:checked={value[key] as boolean}
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
					bind:value={value[key] as string | number}
				/>
			{:else if field.type === 'file'}
				<FileField
					id="field-{key}"
					label={resolveText(field.title)}
					accept={field.accept}
					description={resolveText(field.description)}
					required={field.required}
					{disabled}
					bind:value={value[key]}
				/>
			{/if}
		{/if}
	{/each}
</div>
