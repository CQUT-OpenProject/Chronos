<script lang="ts">
	import { dismissSnackbar, snackbarStore } from './snackbar-state.svelte';
	import Button from './Button.svelte';

	let snackbarEl = $state<HTMLElement | null>(null);

	function handleOutsideInteraction(target: EventTarget | null) {
		if (!snackbarStore.open || !snackbarStore.canDismissOutside) return;
		if (target instanceof Node && snackbarEl && !snackbarEl.contains(target)) {
			dismissSnackbar();
		}
	}

	function handleWindowPointerDown(event: PointerEvent) {
		if (event.button !== 0) return;
		handleOutsideInteraction(event.target);
	}

	function handleWindowClick(event: MouseEvent) {
		if (event.button !== 0) return;
		handleOutsideInteraction(event.target);
	}

	function handleWindowKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape' && snackbarStore.open && snackbarStore.canDismissOutside) {
			dismissSnackbar();
		}
	}
</script>

<svelte:window
	onpointerdown={handleWindowPointerDown}
	onclick={handleWindowClick}
	onkeydown={handleWindowKeyDown}
/>

{#if snackbarStore.open}
	<div
		class="pointer-events-none fixed inset-x-4 bottom-[calc(var(--bottom-bar-height)+0.75rem)] z-[80] flex justify-center"
		role="status"
		aria-live={snackbarStore.priority}
	>
		<div
			bind:this={snackbarEl}
			class="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl bg-inverse-surface px-4 py-3 text-inverse-on-surface shadow-lg transition-all duration-200"
		>
			<span class="text-body-medium flex-1">{snackbarStore.message}</span>
			{#if snackbarStore.action}
				<Button
					variant="text"
					tone="inverse"
					class="h-8 shrink-0 px-2"
					onclick={() => {
						dismissSnackbar();
						snackbarStore.action?.onClick();
					}}
				>
					{snackbarStore.action.label}
				</Button>
			{/if}
		</div>
	</div>
{/if}
