<script lang="ts">
	import type { ReactiveChronosController } from '@chronos/ui-kit';
	import { decodeQrFromBlob } from './qr/qr-decode';

	interface Props {
		controller?: ReactiveChronosController;
		transfer: {
			state: {
				errorMessage: string | null;
				statusMessage: string | null;
			};
			previewWithSlot(tabId: string, inputs: Record<string, unknown>): Promise<boolean>;
		};
		onContinue: () => void;
	}

	let { transfer, onContinue }: Props = $props();

	let loading = $state(false);
	let fileInputRef = $state<HTMLInputElement | null>(null);
	let isDragging = $state(false);

	function notifyTransferMessages() {
		const { errorMessage } = transfer.state;
		if (errorMessage) {
			alert(errorMessage);
		}
	}

	async function processImageBlob(blob: Blob) {
		loading = true;
		try {
			const text = await decodeQrFromBlob(blob);
			const ok = await transfer.previewWithSlot('qrcode', {
				content: text
			});
			if (ok) onContinue();
			else notifyTransferMessages();
		} catch (err) {
			const msg = err instanceof Error ? err.message : '二维码识别失败';
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
			<h2 class="m3-title-medium text-on-surface">从二维码导入</h2>
			<p class="m3-body-small mt-0.5 text-on-surface-variant">选择或拖入他人分享的课表二维码图片</p>
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
			aria-label="二维码图片上传区域"
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
				<span class="m3-body-medium font-medium text-on-surface">点击选择二维码图片</span>
				<span class="m3-body-small text-on-surface-variant">支持 PNG、JPEG、WebP 或 SVG 格式</span>
			</div>
			<button
				type="button"
				class="m3-label-large mt-1 rounded-full bg-primary px-6 py-2.5 font-medium text-on-primary disabled:opacity-50"
				disabled={loading}
				onclick={() => fileInputRef?.click()}
			>
				{loading ? '识别中…' : '选择图片'}
			</button>
		</div>
	</div>
</div>
