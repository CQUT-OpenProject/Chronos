<script lang="ts">
	import Button from './Button.svelte';
	import type { EdgeBarAction } from '@chronos/ui-kit';
	import { resolveShellIcon } from '$lib/shell/resolve-shell-icon';

	let {
		actions,
		orientation
	}: {
		actions: readonly EdgeBarAction[];
		orientation: 'horizontal' | 'vertical';
	} = $props();
</script>

{#snippet actionIcon(icon: EdgeBarAction['icon'])}
	{#if typeof icon === 'string'}
		{@const resolved = resolveShellIcon(icon)}
		{#if resolved?.kind === 'component'}
			{@const Icon = resolved.component}
			<Icon class="size-6" aria-hidden="true" />
		{/if}
	{:else}
		{@const Icon = icon}
		<Icon class="size-6" aria-hidden="true" />
	{/if}
{/snippet}

<div class:vertical={orientation === 'vertical'} class="edge-actions flex w-full gap-2">
	{#each actions as action (action.id)}
		{#if orientation === 'vertical'}
			<button
				type="button"
				disabled={action.disabled}
				aria-label={action.label}
				title={action.label}
				class="edge-action-icon-button {action.variant === 'danger' ? 'danger' : ''}"
				onclick={() => void action.onClick()}
			>
				<span
					class="edge-action-icon-shell {action.variant === 'danger'
						? 'danger'
						: action.variant === 'outlined'
							? 'outlined'
							: 'filled'}"
				>
					{@render actionIcon(action.icon)}
				</span>
			</button>
		{:else}
			<Button
				variant={action.variant ?? 'filled'}
				disabled={action.disabled}
				aria-label={action.label}
				title={action.label}
				class="min-w-0 flex-1"
				onclick={() => void action.onClick()}
			>
				{#if action.showIconInPortrait}
					{@render actionIcon(action.icon)}
				{/if}
				{action.label}
			</Button>
		{/if}
	{/each}
</div>

<style>
	.edge-actions.vertical {
		flex-direction: column;
		align-items: center;
		gap: 0.125rem;
	}

	.edge-action-icon-button {
		display: flex;
		width: 3.5rem;
		height: 3rem;
		align-items: center;
		justify-content: center;
		border: 0;
		background: transparent;
		color: var(--color-on-surface-variant);
		cursor: pointer;
	}

	.edge-action-icon-button:hover {
		color: var(--color-on-surface);
	}

	.edge-action-icon-button.danger {
		color: var(--color-error);
	}

	.edge-action-icon-button:disabled {
		opacity: 0.4;
		cursor: default;
	}

	.edge-action-icon-button:focus-visible {
		outline: 2px solid var(--color-primary);
		outline-offset: -2px;
		border-radius: 0.75rem;
	}

	.edge-action-icon-shell {
		display: flex;
		width: 3rem;
		height: 2rem;
		align-items: center;
		justify-content: center;
		border-radius: 9999px;
	}

	.edge-action-icon-shell.filled {
		background: var(--color-primary-container);
		color: var(--color-on-primary-container);
	}

	.edge-action-icon-shell.danger {
		background: var(--color-error-container);
		color: var(--color-on-error-container);
	}
</style>
