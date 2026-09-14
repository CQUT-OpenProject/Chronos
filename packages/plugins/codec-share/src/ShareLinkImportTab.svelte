<script lang="ts">
	import { pluginText, previewAndNotify, type ImportTabComponentProps } from '@chronos/ui-kit';
	import { SHARE_CODEC_MESSAGES } from './messages';

	const SHARE_CODEC_PLUGIN_ID = 'codec-share';

	let { controller, transfer, onContinue }: ImportTabComponentProps = $props();

	let loading = $state(false);

	const title = $derived(
		pluginText(controller, SHARE_CODEC_PLUGIN_ID, SHARE_CODEC_MESSAGES, 'import.ui.title')
	);
	const subtitle = $derived(
		pluginText(controller, SHARE_CODEC_PLUGIN_ID, SHARE_CODEC_MESSAGES, 'import.ui.subtitle')
	);
	const loadingLabel = $derived(
		pluginText(controller, SHARE_CODEC_PLUGIN_ID, SHARE_CODEC_MESSAGES, 'import.ui.loading')
	);
	const clipboardLabel = $derived(
		pluginText(controller, SHARE_CODEC_PLUGIN_ID, SHARE_CODEC_MESSAGES, 'import.ui.clipboard')
	);

	async function handleClipboardPreview() {
		loading = true;
		try {
			const content = await navigator.clipboard.readText();
			const ok = await previewAndNotify(
				transfer,
				'share-link',
				{ content: content.trim() },
				controller
			);
			if (ok) onContinue();
		} catch (err) {
			const msg =
				err instanceof Error
					? err.message
					: pluginText(
							controller,
							SHARE_CODEC_PLUGIN_ID,
							SHARE_CODEC_MESSAGES,
							'import.ui.clipboardError'
						);
			controller?.notify(msg, 'error');
		} finally {
			loading = false;
		}
	}
</script>

<div class="ui-section-surface ui-section-surface--comfortable">
	<div class="flex flex-col gap-4">
		<div>
			<h2 class="text-title-medium text-on-surface">{title}</h2>
			<p class="text-body-small mt-0.5 text-on-surface-variant">{subtitle}</p>
		</div>
		<div class="flex w-full pt-1">
			<button
				type="button"
				class="ui-btn ui-btn-filled ui-btn-block"
				disabled={loading}
				onclick={handleClipboardPreview}
			>
				{loading ? loadingLabel : clipboardLabel}
			</button>
		</div>
	</div>
</div>
