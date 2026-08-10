<script lang="ts">
	import { Dialog } from 'bits-ui';
	import type { Snippet } from 'svelte';

	let {
		open = $bindable(false),
		title = '',
		description = '',
		children,
		footer
	}: {
		open?: boolean;
		title?: string;
		description?: string;
		children?: Snippet;
		footer?: Snippet;
	} = $props();
</script>

<Dialog.Root bind:open>
	<Dialog.Portal>
		<Dialog.Overlay
			class="fixed inset-0 z-[70] bg-black/50 backdrop-blur-xs transition-opacity duration-200"
		/>
		<Dialog.Content
			class="fixed top-1/2 left-1/2 z-[70] flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-4 rounded-[28px] border border-outline-variant/50 bg-surface-container-high p-6 text-on-surface shadow-xl transition-all duration-200 outline-none"
		>
			{#if title}
				<Dialog.Title class="m3-headline-small font-medium text-on-surface">
					{title}
				</Dialog.Title>
			{/if}
			{#if description}
				<Dialog.Description class="m3-body-medium text-on-surface-variant">
					{description}
				</Dialog.Description>
			{/if}

			{#if children}
				<div class="flex flex-col gap-3">
					{@render children()}
				</div>
			{/if}

			{#if footer}
				<div class="mt-2 flex items-center justify-end gap-2">
					{@render footer()}
				</div>
			{/if}
		</Dialog.Content>
	</Dialog.Portal>
</Dialog.Root>
