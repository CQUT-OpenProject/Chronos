<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { browser } from '$app/environment';
	import { ImportMode } from '$lib/domain/import-mode';
	import { createSessionPreviewPersistence } from '$lib/client/preview-persistence';
	import { snackbar } from '$lib/components/ui/snackbar-state.svelte';
	import {
		decodeSharePayload,
		extractSharePayloadFromLocation
	} from '$lib/parsers/share-link/chronos-share-link-codec';

	let status = $state<'loading' | 'error'>('loading');

	onMount(() => {
		if (!browser) return;

		void (async () => {
			const payload = extractSharePayloadFromLocation(window.location);

			if (!payload) {
				status = 'error';
				snackbar('链接中未找到课表数据');
				return;
			}

			const result = await decodeSharePayload(payload);
			if (!result.ok) {
				status = 'error';
				snackbar(result.error.message);
				return;
			}

			createSessionPreviewPersistence().save({
				preview: result.value,
				previewSource: 'SHARE_LINK',
				importMode: ImportMode.AS_NEW,
				htmlImportTermStartDate: null,
				htmlImportCampusId: null
			});

			window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`);
			goto(resolve('/transfer/import/confirm'));
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
