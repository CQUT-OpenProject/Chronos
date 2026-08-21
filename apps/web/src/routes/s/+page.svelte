<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { browser } from '$app/environment';
	import { trackEvent } from '$lib/client/analytics';
	import { ImportMode } from '$lib/domain/import-mode';
	import { createSessionPreviewPersistence } from '$lib/client/preview-persistence';
	import { snackbar } from '$lib/components/ui/snackbar-state.svelte';
	import { ensureEngineReady } from '$lib/services/app-engine';
	import { extractSharePayloadFromLocation } from '@chronos/plugin-codec-share';

	let status = $state<'loading' | 'error'>('loading');

	onMount(() => {
		if (!browser) return;

		void (async () => {
			const payload = extractSharePayloadFromLocation(window.location);

			if (!payload) {
				trackEvent('share_link_decode_fail');
				status = 'error';
				snackbar('链接中未找到课表数据');
				return;
			}

			try {
				const engine = await ensureEngineReady();
				const shareLinkSlot = engine.slots.getSlotItem('import.source.tab', 'share-link');
				if (!shareLinkSlot) {
					throw new Error('分享链接导入不可用');
				}
				const ctx = engine.getPluginContextForSlot('import.source.tab', 'share-link');
				const timetable = await shareLinkSlot.executeImport(
					{ content: payload, fileContent: payload },
					ctx
				);
				if (!timetable?.courses?.length) {
					throw new Error('分享链接中未找到有效课表数据');
				}

				trackEvent('share_link_decode_success');

				createSessionPreviewPersistence().save({
					preview: timetable,
					slotId: 'share-link',
					importMode: ImportMode.AS_NEW
				});

				window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`);
				goto(resolve('/transfer/import/confirm'));
			} catch (err) {
				trackEvent('share_link_decode_fail');
				status = 'error';
				const message = err instanceof Error ? err.message : '无法解析分享链接';
				snackbar(message);
			}
		})();
	});
</script>

<div class="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
	{#if status === 'loading'}
		<p class="m3-body-large text-on-surface">正在导入课表…</p>
	{:else}
		<p class="m3-body-large text-on-surface-variant">无法导入课表</p>
		<a href={resolve('/transfer/import')} class="m3-label-large text-brand">前往手动导入</a>
	{/if}
</div>
