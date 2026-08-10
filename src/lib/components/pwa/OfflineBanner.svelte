<script lang="ts">
	import { networkStatus } from '$lib/client/network-status.svelte';
	import { WifiOffFill } from '$lib/icons';

	const isOffline = $derived(!networkStatus.isOnline);
</script>

{#if isOffline}
	<div
		class="fixed inset-x-0 top-0 z-[75] border-b border-outline-variant/60 bg-surface-container-high px-4 pt-[calc(env(safe-area-inset-top)+0.5rem)] pb-2.5"
		role="status"
		aria-live="polite"
	>
		<div class="mx-auto flex w-full max-w-lg items-start gap-2.5">
			<WifiOffFill class="mt-0.5 size-5 shrink-0 text-on-surface-variant" aria-hidden="true" />
			<div class="min-w-0 flex-1">
				<p class="m3-label-large font-semibold text-on-surface">当前处于离线状态</p>
				<p class="m3-body-small mt-0.5 text-on-surface-variant">
					课表数据可正常查看，在线导入等功能暂不可用
				</p>
			</div>
		</div>
	</div>
{/if}
