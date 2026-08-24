<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { browser } from '$app/environment';
	import { trackEvent } from '$lib/client/analytics';
	import { ImportMode } from '$lib/domain/import-mode';
	import { createSessionPreviewPersistence } from '$lib/client/preview-persistence';
	import { snackbarKey } from '$lib/components/ui/snackbar-state.svelte';
	import { ensureEngineReady, getAppController } from '$lib/services/app-engine';
	import { resolveDeepLinkImport } from '$lib/transfer/deep-link';
	import { hostText, hostTextRead } from '$lib/i18n/host-text';

	const controller = getAppController();
	let status = $state<'loading' | 'error'>('loading');

	onMount(() => {
		if (!browser) return;

		void (async () => {
			try {
				const engine = await ensureEngineReady();
				const tabs = engine.slots.get('import.source.tab');
				const match = resolveDeepLinkImport(tabs, window.location);

				if (!match) {
					throw new Error(hostText('share.error.noData'));
				}

				const ctx = engine.getPluginContextForSlot('import.source.tab', match.tab.id);
				const timetable = await match.tab.executeImport(match.inputs, ctx);
				if (!timetable?.courses?.length) {
					throw new Error(hostText('share.error.invalidData'));
				}

				trackEvent('share_link_decode_success');

				createSessionPreviewPersistence().save({
					preview: timetable,
					slotId: match.tab.id,
					importMode: ImportMode.AS_NEW
				});

				window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`);
				goto(resolve('/transfer/import/confirm'));
			} catch (err) {
				trackEvent('share_link_decode_fail');
				status = 'error';
				if (err instanceof Error) {
					if (err.message === hostText('share.error.noData')) {
						snackbarKey('share.error.noData');
					} else if (err.message === hostText('share.error.invalidData')) {
						snackbarKey('share.error.invalidData');
					} else {
						snackbarKey('share.error.parseFailed');
					}
				} else {
					snackbarKey('share.error.parseFailed');
				}
			}
		})();
	});
</script>

<div class="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
	{#if status === 'loading'}
		<p class="m3-body-large text-on-surface">{hostTextRead(controller, 'share.loading')}</p>
	{:else}
		<p class="m3-body-large text-on-surface-variant">{hostTextRead(controller, 'share.failed')}</p>
		<a href={resolve('/transfer/import')} class="m3-label-large text-brand">
			{hostTextRead(controller, 'share.manualImport')}
		</a>
	{/if}
</div>
