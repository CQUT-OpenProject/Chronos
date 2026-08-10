<script lang="ts">
	import type { TransferImportSource } from '$lib/client/preview-persistence';
	import { networkStatus } from '$lib/client/network-status.svelte';
	import type { TransferStateController } from '$lib/transfer/transfer-state.svelte';
	import { canSaveCredentials, saveCredentialsLabel } from '$lib/transfer/transfer-state.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Checkbox from '$lib/components/ui/Checkbox.svelte';
	import SegmentedControl from '$lib/components/ui/SegmentedControl.svelte';
	import TextField from '$lib/components/ui/TextField.svelte';
	import { snackbar } from '$lib/components/ui/snackbar-state.svelte';
	import { WifiOffFill } from '$lib/icons';

	const importSegments = [
		{ value: 'ONLINE', label: '知行理工' },
		{ value: 'SHARE_LINK', label: '分享链接' },
		{ value: 'HTML', label: 'HTML 文件' }
	] as const;

	let {
		transfer,
		onContinue
	}: {
		transfer: TransferStateController;
		onContinue: () => void;
	} = $props();

	const transferState = $derived(transfer.state);
	let fileInput: HTMLInputElement | undefined = $state();
	let loading = $state(false);

	const saveCheckboxEnabled = $derived(canSaveCredentials(transferState.savedCredentialState));
	const saveCheckboxLabel = $derived(saveCredentialsLabel(transferState.savedCredentialState));
	const onlineImportDisabled = $derived(loading || !networkStatus.isOnline);

	function notifyTransferMessages() {
		const { statusMessage, errorMessage } = transfer.state;
		if (errorMessage) snackbar(errorMessage);
		else if (statusMessage) snackbar(statusMessage);
	}

	async function handleClipboardPreview() {
		loading = true;
		try {
			const ok = await transfer.previewFromClipboard();
			if (ok) onContinue();
			else notifyTransferMessages();
		} finally {
			loading = false;
		}
	}

	async function handleOnlinePreview() {
		loading = true;
		try {
			const ok = await transfer.previewOnline();
			if (ok) onContinue();
			else notifyTransferMessages();
		} finally {
			loading = false;
		}
	}

	async function handleSavedCredentialPreview() {
		loading = true;
		try {
			const ok = await transfer.previewWithSavedCredential();
			if (ok) onContinue();
			else notifyTransferMessages();
		} finally {
			loading = false;
		}
	}

	async function handleClearSavedCredential() {
		await transfer.clearSavedCredential();
		notifyTransferMessages();
	}

	async function handleFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		loading = true;
		try {
			const ok = await transfer.previewFromHtmlFile(file);
			if (ok) onContinue();
			else notifyTransferMessages();
		} finally {
			loading = false;
			input.value = '';
		}
	}
</script>

<div class="mx-auto flex w-full max-w-lg flex-col gap-5 py-1">
	<p class="m3-body-medium text-on-surface-variant">
		支持知行理工在线导入、分享链接与教务系统导出的 HTML 文件。
	</p>

	<SegmentedControl
		segments={[...importSegments]}
		value={transferState.selectedSource}
		onValueChange={(value) => transfer.setSelectedSource(value as TransferImportSource)}
	/>

	<div class="w-full">
		{#if transferState.selectedSource === 'ONLINE'}
			<Card variant="outlined">
				<div class="flex flex-col gap-4 p-2">
					{#if !networkStatus.isOnline}
						<div
							class="flex items-start gap-2 rounded-xl bg-surface-variant/60 px-3 py-2.5 text-on-surface-variant"
						>
							<WifiOffFill class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
							<p class="m3-body-small">
								在线导入需要网络连接。可改用「分享链接」或「HTML 文件」导入课表。
							</p>
						</div>
					{/if}
					<div>
						<h2 class="m3-title-medium text-on-surface">从知行理工获取</h2>
						<p class="m3-body-small mt-0.5 text-on-surface-variant">
							请输入您在知行理工的学号与密码在线抓取课表。
						</p>
					</div>

					<div class="flex flex-col gap-3.5 pt-1">
						<TextField
							id="import-account"
							label="账号"
							type="text"
							inputmode="numeric"
							value={transferState.account}
							onValueChange={(value) => transfer.setAccount(value)}
						/>
						<TextField
							id="import-password"
							label="密码"
							type="password"
							value={transferState.password}
							onValueChange={(value) => transfer.setPassword(value)}
						/>
						<label
							class="m3-body-medium flex cursor-pointer items-center gap-2 pt-1 text-on-surface-variant"
						>
							<Checkbox
								checked={transferState.saveCredentials}
								disabled={!saveCheckboxEnabled}
								onCheckedChange={(checked) => transfer.setSaveCredentials(checked)}
							/>
							<span>{saveCheckboxLabel}</span>
						</label>
					</div>

					<div class="flex w-full pt-1">
						<Button
							variant="filled"
							class="w-full"
							disabled={onlineImportDisabled}
							onclick={handleOnlinePreview}
						>
							{loading ? '获取中…' : '从此账号导入课表'}
						</Button>
					</div>

					{#if transferState.savedCredentialState.hasSavedCredential}
						<div class="flex flex-col gap-3 border-t border-outline-variant/60 pt-4">
							<p class="m3-title-small text-on-surface">
								已保存账号：{transferState.savedCredentialState.account ?? '未知'}
							</p>
							{#if transferState.savedCredentialState.protectionAvailable}
								<p class="m3-body-small text-on-surface-variant">每次使用前都会触发设备验证。</p>
							{:else}
								<p class="m3-body-small text-on-surface-variant">
									仅保存了账号，预览时仍需输入密码。
								</p>
							{/if}
							{#if transferState.savedCredentialState.protectionAvailable}
								<div class="flex w-full">
									<Button
										variant="outlined"
										class="w-full"
										disabled={onlineImportDisabled}
										onclick={handleSavedCredentialPreview}
									>
										{loading ? '获取中…' : '验证并预览'}
									</Button>
								</div>
							{/if}
							<div class="flex w-full">
								<Button
									variant="text"
									class="w-full"
									disabled={loading}
									onclick={handleClearSavedCredential}
								>
									清除已保存凭据
								</Button>
							</div>
						</div>
					{/if}
				</div>
			</Card>
		{:else if transferState.selectedSource === 'SHARE_LINK'}
			<Card variant="outlined">
				<div class="flex flex-col gap-4 p-2">
					<div>
						<h2 class="m3-title-medium text-on-surface">从分享链接导入</h2>
						<p class="m3-body-small mt-0.5 text-on-surface-variant">
							复制课表分享链接后点击下方按钮
						</p>
					</div>
					<div class="flex w-full pt-1">
						<Button
							variant="filled"
							class="w-full"
							disabled={loading}
							onclick={handleClipboardPreview}
						>
							{loading ? '读取中…' : '从剪贴板导入课表'}
						</Button>
					</div>
				</div>
			</Card>
		{:else}
			<Card variant="outlined">
				<div class="flex flex-col gap-4 p-2">
					<div>
						<h2 class="m3-title-medium text-on-surface">从文件导入课表</h2>
						<p class="m3-body-small mt-0.5 text-on-surface-variant">
							选择教务系统导出的 HTML 课表文件。
						</p>
					</div>
					<input
						bind:this={fileInput}
						type="file"
						accept=".html,.htm,text/html"
						class="hidden"
						onchange={handleFileChange}
					/>
					<div class="flex w-full pt-1">
						<Button
							variant="outlined"
							class="w-full"
							disabled={loading}
							onclick={() => fileInput?.click()}
						>
							{loading ? '解析中…' : '选择 HTML 文件'}
						</Button>
					</div>
				</div>
			</Card>
		{/if}
	</div>
</div>
