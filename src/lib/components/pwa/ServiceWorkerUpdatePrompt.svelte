<script lang="ts">
	import { onMount } from 'svelte';
	import { registerSW } from 'virtual:pwa-register';
	import { snackbar } from '$lib/components/ui/snackbar-state.svelte';

	let updateServiceWorker = $state<(() => Promise<void>) | null>(null);

	onMount(() => {
		updateServiceWorker = registerSW({
			immediate: true,
			onNeedRefresh() {
				snackbar('新版本可用，点击刷新即可更新', {
					label: '刷新',
					onClick: () => {
						void updateServiceWorker?.();
					}
				});
			}
		});
	});
</script>
