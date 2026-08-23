<script lang="ts">
	import type { ReactiveChronosController } from '@chronos/ui-kit';
	import { decodeQrFromBlob } from './qr/qr-decode';
	import { qrPluginText } from './plugin-text';

	interface Props {
		controller?: ReactiveChronosController;
		transfer: {
			state: {
				errorMessage: string | null;
			};
			previewWithSlot(tabId: string, inputs: Record<string, unknown>): Promise<boolean>;
		};
		onContinue: () => void;
	}

	let { controller, transfer, onContinue }: Props = $props();

	let loading = $state(false);
	let fileInputRef = $state<HTMLInputElement | null>(null);
	let isDragging = $state(false);

	const title = $derived(qrPluginText(controller, 'import.ui.title'));
	const subtitle = $derived(qrPluginText(controller, 'import.ui.subtitle'));
	const dropLabel = $derived(qrPluginText(controller, 'import.ui.dropLabel'));
	const formats = $derived(qrPluginText(controller, 'import.ui.formats'));
	const selectLabel = $derived(qrPluginText(controller, 'import.ui.select'));
	const scanningLabel = $derived(qrPluginText(controller, 'import.ui.scanning'));
	const dropAria = $derived(qrPluginText(controller, 'import.ui.dropAria'));

	function notifyTransferMessages() {
		const { errorMessage } = transfer.state;
		if (errorMessage) {
			alert(errorMessage);
		}
	}

	async function processImageBlob(blob: Blob) {
		loading = true;
		try {
			const text = await decodeQrFromBlob(blob, (key) => qrPluginText(controller, key));
			const ok = await transfer.previewWithSlot('qrcode', {
				content: text
			});
			if (ok) onContinue();
			else notifyTransferMessages();
		} catch (err) {
			const msg =
				err instanceof Error ? err.message : qrPluginText(controller, 'import.error.decodeFailed');
			alert(msg);
		} finally {
			loading = false;
		}
	}

	async function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		await processImageBlob(file);
		target.value = '';
	}

	async function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		const file = event.dataTransfer?.files?.[0];
		if (!file) return;
		await processImageBlob(file);
	}
</script>

<div class="rounded-2xl border border-outline/30 bg-surface p-4 shadow-xs">
	<div class="flex flex-col gap-4">
		<div>
			<h2 class="m3-title-medium text-on-surface">{title}</h2>
			<p class="m3-body-small mt-0.5 text-on-surface-variant">{subtitle}</p>
		</div>

		<input
			bind:this={fileInputRef}
			type="file"
			accept="image/*,.svg"
			class="hidden"
			onchange={handleFileChange}
		/>

		<div
			class="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-6 text-center transition-colors {isDragging
				? 'border-primary bg-primary/5'
				: 'border-outline/40 bg-surface-variant/20'}"
			ondragover={(e) => {
				e.preventDefault();
				isDragging = true;
			}}
			ondragleave={() => (isDragging = false)}
			ondrop={handleDrop}
			role="region"
			aria-label={dropAria}
		>
			<svg
				class="size-10 text-on-surface-variant/80"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="1.5"
			>
				<rect x="3" y="3" width="7" height="7" rx="1.5"></rect>
				<rect x="14" y="3" width="7" height="7" rx="1.5"></rect>
				<rect x="3" y="14" width="7" height="7" rx="1.5"></rect>
				<path d="M14 14h3v3h-3z"></path>
				<path d="M20 14v3h-3"></path>
				<path d="M14 20h7"></path>
			</svg>
			<div class="flex flex-col gap-1">
				<span class="m3-body-medium font-medium text-on-surface">{dropLabel}</span>
				<span class="m3-body-small text-on-surface-variant">{formats}</span>
			</div>
			<button
				type="button"
				class="m3-label-large mt-1 rounded-full bg-primary px-6 py-2.5 font-medium text-on-primary disabled:opacity-50"
				disabled={loading}
				onclick={() => fileInputRef?.click()}
			>
				{loading ? scanningLabel : selectLabel}
			</button>
		</div>
	</div>
</div>
