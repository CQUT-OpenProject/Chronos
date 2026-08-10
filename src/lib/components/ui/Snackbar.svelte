<script lang="ts">
	import { snackbarStore } from './snackbar-state.svelte';
</script>

{#if snackbarStore.open}
	<div class="pointer-events-none fixed inset-x-4 bottom-20 z-[80] flex justify-center">
		<div
			class="pointer-events-auto flex max-w-md items-center gap-3 rounded-2xl bg-inverse-surface px-4 py-3 text-inverse-on-surface shadow-lg transition-all duration-200"
		>
			<span class="m3-body-medium flex-1">{snackbarStore.message}</span>
			{#if snackbarStore.action}
				<button
					type="button"
					onclick={() => {
						snackbarStore.open = false;
						snackbarStore.action?.onClick();
					}}
					class="m3-label-large shrink-0 text-inverse-primary hover:underline"
				>
					{snackbarStore.action.label}
				</button>
			{/if}
			<button
				type="button"
				onclick={() => (snackbarStore.open = false)}
				class="m3-label-large shrink-0 text-inverse-on-surface/70 hover:underline"
			>
				关闭
			</button>
		</div>
	</div>
{/if}
