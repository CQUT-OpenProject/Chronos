<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { browser } from '$app/environment';
	import { trackEvent } from '$lib/client/analytics';
	import { snackbarKey } from '$lib/components/ui/snackbar-state.svelte';
	import { ensureEngineFullyReady } from '$lib/services/app-engine';
	import {
		createTransferState,
		shareImportErrorSnackbarKey
	} from '$lib/transfer/transfer-state.svelte';

	let status = $state<'loading' | 'error'>('loading');

	onMount(() => {
		if (!browser) return;

		void (async () => {
			try {
				const engine = await ensureEngineFullyReady();
				const transfer = createTransferState(engine);
				const result = await transfer.previewDeepLinkImport(window.location);

				if (!result.ok) {
					trackEvent('share_link_decode_fail');
					status = 'error';
					snackbarKey(shareImportErrorSnackbarKey(result.kind));
					return;
				}

				trackEvent('share_link_decode_success');
				window.history.replaceState({}, '', `${window.location.pathname}${window.location.search}`);
				goto(resolve('/transfer/import/confirm'));
			} catch {
				trackEvent('share_link_decode_fail');
				status = 'error';
				snackbarKey('share.error.parseFailed');
			}
		})();
	});
</script>

<div class="flex min-h-dvh flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
	{#if status === 'loading'}
		<p class="text-body-large text-on-surface">{hostT('share.loading')}</p>
	{:else}
		<p class="text-body-large text-on-surface-variant">{hostT('share.failed')}</p>
		<a href={resolve('/transfer/import')} class="text-label-large text-brand">
			{hostT('share.manualImport')}
		</a>
	{/if}
</div>
