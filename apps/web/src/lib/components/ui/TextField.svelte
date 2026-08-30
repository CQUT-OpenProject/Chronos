<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { HTMLInputAttributes, HTMLTextareaAttributes } from 'svelte/elements';
	import IconButton from '$lib/components/ui/IconButton.svelte';
	import { Visibility, VisibilityOff } from '$lib/icons';

	let {
		label,
		value = $bindable(''),
		multiline = false,
		rows = 3,
		id,
		type = 'text',
		class: className = '',
		maxlength,
		showPasswordToggle,
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
		maxlength?: number;
		showPasswordToggle?: boolean;
		onValueChange?: (value: string) => void;
	} & HTMLInputAttributes &
		HTMLTextareaAttributes = $props();

	const instanceId = $props.id();
	const fieldId = $derived(id ?? instanceId);
	let passwordVisible = $state(false);
	const charCount = $derived(value.length);
	const showCounter = $derived(maxlength !== undefined);
	const counterAtLimit = $derived(showCounter && charCount >= maxlength!);
	const passwordToggleEnabled = $derived(showPasswordToggle ?? type === 'password');
	const inputType = $derived(
		type === 'password' && passwordToggleEnabled && passwordVisible ? 'text' : type
	);
	const passwordAriaLabel = $derived(
		passwordVisible ? hostT('ui.password.hide') : hostT('ui.password.show')
	);

	function handleInput(event: Event) {
		const target = event.currentTarget as HTMLInputElement | HTMLTextAreaElement;
		onValueChange?.(target.value);
	}

	function togglePasswordVisibility() {
		passwordVisible = !passwordVisible;
	}
</script>

<div class={['ui-form-field', multiline && 'ui-form-field--multiline', className]}>
	<label class="ui-field-label" for={fieldId}>{label}</label>
	{#if multiline}
		<textarea
			id={fieldId}
			class="ui-form-field-input"
			{rows}
			{maxlength}
			enterkeyhint="enter"
			bind:value
			oninput={handleInput}
			{...props}></textarea>
	{:else if passwordToggleEnabled}
		<div class="ui-form-field-input-row">
			<input
				id={fieldId}
				class="ui-form-field-input"
				type={inputType}
				{maxlength}
				bind:value
				oninput={handleInput}
				{...props}
			/>
			<IconButton
				size="sm"
				ariaLabel={passwordAriaLabel}
				class="!size-8 text-on-surface-variant"
				onclick={togglePasswordVisibility}
			>
				{#if passwordVisible}
					<VisibilityOff class="size-5" aria-hidden="true" />
				{:else}
					<Visibility class="size-5" aria-hidden="true" />
				{/if}
			</IconButton>
		</div>
	{:else}
		<input
			id={fieldId}
			class="ui-form-field-input"
			{type}
			{maxlength}
			bind:value
			oninput={handleInput}
			{...props}
		/>
	{/if}
	{#if showCounter}
		<span
			class={['ui-form-field-counter', counterAtLimit && 'ui-form-field-counter--limit']}
			aria-live="polite"
		>
			{charCount}/{maxlength}
		</span>
	{/if}
</div>
