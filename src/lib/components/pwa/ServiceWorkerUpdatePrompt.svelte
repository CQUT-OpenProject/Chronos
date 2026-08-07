<script lang="ts">
	import { onMount } from 'svelte';
	import { registerSW } from 'virtual:pwa-register';

	let needRefresh = $state(false);
	let updateServiceWorker = $state<(() => Promise<void>) | null>(null);

	onMount(() => {
		updateServiceWorker = registerSW({
			immediate: true,
			onNeedRefresh() {
				needRefresh = true;
			}
		});
	});

	async function refresh() {
		if (!updateServiceWorker) return;
		await updateServiceWorker();
		needRefresh = false;
	}
</script>

{#if needRefresh}
	<div
		class="fixed inset-x-4 bottom-4 z-50 flex items-center justify-between gap-3 rounded-xl border border-border bg-white p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
	>
		<p class="text-sm">新版本可用</p>
		<button
			type="button"
			class="rounded-lg bg-brand px-3 py-2 text-sm text-white"
			onclick={refresh}
		>
			刷新
		</button>
	</div>
{/if}
