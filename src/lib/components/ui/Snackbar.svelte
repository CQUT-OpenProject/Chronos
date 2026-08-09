<script lang="ts">
	import { snackbarStore } from './snackbar-state.svelte';
</script>

{#if snackbarStore.open}
	<div class="pointer-events-none fixed inset-x-4 bottom-20 z-[70] flex justify-center">
		<div
			class="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl bg-inverse-surface px-4 py-3 text-sm text-inverse-on-surface shadow-lg transition-all duration-200"
		>
			<span class="flex-1 font-normal">{snackbarStore.message}</span>
			{#if snackbarStore.action}
				<button
					type="button"
					onclick={() => {
						snackbarStore.open = false;
						snackbarStore.action?.onClick();
					}}
					class="shrink-0 text-xs font-semibold text-inverse-primary hover:underline"
				>
					{snackbarStore.action.label}
				</button>
			{/if}
			<button
				type="button"
				onclick={() => (snackbarStore.open = false)}
				class="shrink-0 text-xs font-semibold text-inverse-on-surface/70 hover:underline"
			>
				关闭
			</button>
		</div>
	</div>
{/if}
