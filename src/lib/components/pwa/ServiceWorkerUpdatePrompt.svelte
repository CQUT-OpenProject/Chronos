<script lang="ts">
	import { onMount } from 'svelte';
	import { registerSW } from 'virtual:pwa-register';
	import { Snackbar, snackbar } from 'm3-svelte';

	let updateServiceWorker = $state<(() => Promise<void>) | null>(null);

	onMount(() => {
		updateServiceWorker = registerSW({
			immediate: true,
			onNeedRefresh() {
				snackbar(
					'新版本可用，点击刷新即可更新',
					{
						刷新: () => {
							void updateServiceWorker?.();
						}
					},
					true,
					-1
				);
			}
		});
	});
</script>

<div style="--m3v-bottom-offset: calc(var(--spacing-tabbar) + var(--tabbar-safe) - 0.5rem)">
	<Snackbar closeTitle="关闭" />
</div>
