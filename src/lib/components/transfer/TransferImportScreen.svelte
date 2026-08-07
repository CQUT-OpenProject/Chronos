<script lang="ts">
	import type { TransferStateController } from '$lib/transfer/transfer-state.svelte';
	import { canSaveCredentials, saveCredentialsLabel } from '$lib/transfer/transfer-state.svelte';
	import { Button, Card, Checkbox, TextFieldOutlined } from 'm3-svelte';

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

	async function handleClipboardPreview() {
		loading = true;
		try {
			const ok = await transfer.previewFromClipboard();
			if (ok) onContinue();
		} finally {
			loading = false;
		}
	}

	async function handleOnlinePreview() {
		loading = true;
		try {
			const ok = await transfer.previewOnline();
			if (ok) onContinue();
		} finally {
			loading = false;
		}
	}

	async function handleSavedCredentialPreview() {
		loading = true;
		try {
			const ok = await transfer.previewWithSavedCredential();
			if (ok) onContinue();
		} finally {
			loading = false;
		}
	}

	async function handleClearSavedCredential() {
		await transfer.clearSavedCredential();
	}

	async function handleFileChange(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		loading = true;
		try {
			const ok = await transfer.previewFromHtmlFile(file);
			if (ok) onContinue();
		} finally {
			loading = false;
			input.value = '';
		}
	}
</script>

<div class="m3-stack">
	<p class="m3-body-medium text-on-surface-variant">
		支持教务处在线导入、分享 JSON 与教务 HTML 文件。
	</p>

	<div class="flex w-full rounded-full border border-outline-variant bg-surface-variant/40 p-1">
		<button
			type="button"
			class="flex-1 cursor-pointer rounded-full px-3 py-1.5 text-center text-sm transition-colors {transferState.selectedSource ===
			'ONLINE'
				? 'bg-secondary-container font-semibold text-on-secondary-container shadow-xs'
				: 'text-on-surface-variant hover:text-on-surface'}"
			onclick={() => transfer.setSelectedSource('ONLINE')}
		>
			教务处
		</button>
		<button
			type="button"
			class="flex-1 cursor-pointer rounded-full px-3 py-1.5 text-center text-sm transition-colors {transferState.selectedSource ===
			'JSON'
				? 'bg-secondary-container font-semibold text-on-secondary-container shadow-xs'
				: 'text-on-surface-variant hover:text-on-surface'}"
			onclick={() => transfer.setSelectedSource('JSON')}
		>
			分享 JSON
		</button>
		<button
			type="button"
			class="flex-1 cursor-pointer rounded-full px-3 py-1.5 text-center text-sm transition-colors {transferState.selectedSource ===
			'HTML'
				? 'bg-secondary-container font-semibold text-on-secondary-container shadow-xs'
				: 'text-on-surface-variant hover:text-on-surface'}"
			onclick={() => transfer.setSelectedSource('HTML')}
		>
			HTML 文件
		</button>
	</div>

	{#if transferState.selectedSource === 'ONLINE'}
		<Card variant="outlined">
			<div class="panel">
				<h2 class="m3-title-medium">从教务处获取</h2>
				<TextFieldOutlined
					label="账号"
					inputmode="numeric"
					value={transferState.account}
					oninput={(event) => transfer.setAccount((event.currentTarget as HTMLInputElement).value)}
				/>
				<TextFieldOutlined
					label="密码"
					type="password"
					value={transferState.password}
					oninput={(event) => transfer.setPassword((event.currentTarget as HTMLInputElement).value)}
				/>
				<label class="checkbox-row m3-body-medium">
					<Checkbox>
						<input
							type="checkbox"
							checked={transferState.saveCredentials}
							disabled={!saveCheckboxEnabled}
							onchange={(event) =>
								transfer.setSaveCredentials((event.currentTarget as HTMLInputElement).checked)}
						/>
					</Checkbox>
					<span>{saveCheckboxLabel}</span>
				</label>
				<Button disabled={loading} onclick={handleOnlinePreview}>
					{loading ? '获取中…' : '从此账号导入课表'}
				</Button>
				{#if transferState.savedCredentialState.hasSavedCredential}
					<div class="saved-panel">
						<p class="m3-title-small">
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
							<Button variant="outlined" disabled={loading} onclick={handleSavedCredentialPreview}>
								{loading ? '获取中…' : '验证并预览'}
							</Button>
						{/if}
						<Button variant="text" disabled={loading} onclick={handleClearSavedCredential}>
							清除已保存凭据
						</Button>
					</div>
				{/if}
			</div>
		</Card>
	{:else if transferState.selectedSource === 'JSON'}
		<Card variant="outlined">
			<div class="panel">
				<h2 class="m3-title-medium">从分享内容获取</h2>
				<p class="m3-body-small text-on-surface-variant">
					复制 Android 或其他设备导出的课表 JSON 后点击下方按钮。
				</p>
				<Button disabled={loading} onclick={handleClipboardPreview}>
					{loading ? '读取中…' : '从剪贴板导入课表'}
				</Button>
			</div>
		</Card>
	{:else}
		<Card variant="outlined">
			<div class="panel">
				<h2 class="m3-title-medium">从文件导入课表</h2>
				<p class="m3-body-small text-on-surface-variant">选择教务系统导出的 HTML 课表文件。</p>
				<input
					bind:this={fileInput}
					type="file"
					accept=".html,.htm,text/html"
					class="hidden"
					onchange={handleFileChange}
				/>
				<Button variant="outlined" disabled={loading} onclick={() => fileInput?.click()}>
					{loading ? '解析中…' : '选择 HTML 文件'}
				</Button>
			</div>
		</Card>
	{/if}

	{#if transferState.preview}
		<Card variant="filled">
			<p class="m3-body-medium">
				当前预览：{transferState.preview.name}（{transferState.preview.courses.length} 门课程）
				<Button variant="text" size="s" onclick={() => transfer.clearPreview()}>清除</Button>
			</p>
		</Card>
	{/if}

	{#if transferState.statusMessage}
		<p class="m3-body-medium text-success">{transferState.statusMessage}</p>
	{/if}

	{#if transferState.errorMessage}
		<p class="m3-body-medium text-danger">{transferState.errorMessage}</p>
	{/if}
</div>

<style>
	.panel,
	.saved-panel {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.saved-panel {
		padding-top: 0.25rem;
		border-top: 1px solid var(--m3c-outline-variant);
	}

	.checkbox-row {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		color: var(--m3c-on-surface-variant);
	}

	h2,
	p {
		margin: 0;
	}
</style>
