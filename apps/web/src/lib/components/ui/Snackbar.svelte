<script lang="ts">
	import { snackbarStore } from './snackbar-state.svelte';
	import Button from './Button.svelte';
	import { getAppController } from '$lib/services/app-engine';
	import { hostTextRead } from '$lib/i18n/host-text';

	const controller = getAppController();
</script>

{#if snackbarStore.open}
	<div
		class="pointer-events-none fixed inset-x-4 bottom-20 z-[80] flex justify-center"
		role="status"
		aria-live={snackbarStore.priority}
	>
		<div
			class="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl bg-inverse-surface px-4 py-3 text-inverse-on-surface shadow-lg transition-all duration-200"
		>
			<span class="m3-body-medium flex-1">{snackbarStore.message}</span>
			{#if snackbarStore.action}
				<Button
					variant="text"
					tone="inverse"
					class="h-8 shrink-0 px-2"
					onclick={() => {
						snackbarStore.open = false;
						snackbarStore.action?.onClick();
					}}
				>
					{snackbarStore.action.label}
				</Button>
			{/if}
			<Button
				variant="text"
				tone="inverse"
				class="h-8 shrink-0 px-2 !text-inverse-on-surface/70"
				aria-label={hostTextRead(controller, 'snackbar.closeAria')}
				onclick={() => (snackbarStore.open = false)}
			>
				{hostTextRead(controller, 'snackbar.close')}
			</Button>
		</div>
	</div>
{/if}
