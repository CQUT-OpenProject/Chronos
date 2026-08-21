<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getMarketplaceService,
		builtinPlugins,
		getAppController
	} from '$lib/services/app-engine';
	import type { InstalledPluginRecord } from '$lib/services/marketplace/marketplace-service';
	import type { PluginManifest, ConfigSchema } from '@chronos/core';
	import SegmentedControl from '$lib/components/ui/SegmentedControl.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import IconButton from '$lib/components/ui/IconButton.svelte';
	import Switch from '$lib/components/ui/Switch.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';
	import PluginConfigModal from './PluginConfigModal.svelte';
	import { snackbar } from '$lib/components/ui/snackbar-state.svelte';
	import { resolveColorSchemeId } from '$lib/appearance/color-scheme';
	import { getPluginCategoryMeta } from '$lib/services/marketplace/plugin-tags';
	import { DeleteFill, Refresh, CheckCircleFill, TuneFill } from '$lib/icons';

	const marketplace = getMarketplaceService();
	const appController = getAppController();
	const paletteMode = $derived(appController.userPreferences?.paletteMode ?? 'vibrant');
	const visualThemeId = $derived(appController.activeThemeId);
	const activeColorSchemeId = $derived(resolveColorSchemeId(paletteMode, visualThemeId));

	let activeTab = $state<'installed' | 'marketplace'>('installed');

	let installedRecords = $state<InstalledPluginRecord[]>([]);
	let availablePlugins = $state<PluginManifest[]>([]);
	let loadingRegistry = $state(false);
	let registryError = $state<string | null>(null);
	let operatingPluginId = $state<string | null>(null);

	let configModalOpen = $state(false);
	let configModalData = $state<{
		id: string;
		name: string;
		schema: ConfigSchema<Record<string, unknown>>;
	}>({
		id: '',
		name: '',
		schema: {}
	});

	let uninstallDialogOpen = $state(false);
	let uninstallTarget = $state<{ id: string; name: string }>({ id: '', name: '' });

	function refreshInstalled() {
		installedRecords = [...marketplace.listInstalled()];
	}

	onMount(() => {
		void marketplace.init().then(() => {
			refreshInstalled();
		});

		const sub = marketplace.onChanged(() => {
			refreshInstalled();
		});

		return () => {
			sub.dispose();
		};
	});

	async function loadMarketplaceRegistry() {
		loadingRegistry = true;
		registryError = null;
		try {
			const registry = await marketplace.fetchRegistry('/marketplace/registry.json');
			availablePlugins = registry.plugins || [];
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			registryError = msg;
		} finally {
			loadingRegistry = false;
		}
	}

	$effect(() => {
		if (activeTab === 'marketplace' && availablePlugins.length === 0 && !loadingRegistry) {
			void loadMarketplaceRegistry();
		}
	});

	function resolveLocalizedName(
		name: string | Record<string, string> | (() => string) | undefined
	): string {
		if (!name) return '';
		if (typeof name === 'function') return name();
		if (typeof name === 'string') return name;
		return name['zh-CN'] || name['zh-cn'] || name['en'] || Object.values(name)[0] || '';
	}

	function resolveLocalizedDesc(
		desc: string | Record<string, string> | (() => string) | undefined
	): string {
		if (!desc) return '';
		if (typeof desc === 'function') return desc();
		if (typeof desc === 'string') return desc;
		return desc['zh-CN'] || desc['zh-cn'] || desc['en'] || Object.values(desc)[0] || '';
	}

	function isInstalled(pluginId: string): boolean {
		return (
			builtinPlugins.some((p) => p.id === pluginId) ||
			installedRecords.some((r) => r.manifest.id === pluginId)
		);
	}

	function resolveThemeIdForManifest(manifest: PluginManifest): string | null {
		if (manifest.type !== 'theme') return null;
		if (manifest.id.startsWith('theme-')) {
			return manifest.id.slice('theme-'.length);
		}
		return manifest.id;
	}

	function isThemePluginInUse(manifest: PluginManifest, enabled: boolean): boolean {
		if (!enabled || manifest.type !== 'theme') return false;
		const themeId = resolveThemeIdForManifest(manifest);
		return themeId !== null && activeColorSchemeId === themeId;
	}

	async function handleInstall(manifest: PluginManifest) {
		operatingPluginId = manifest.id;
		try {
			await marketplace.install(manifest);
			refreshInstalled();
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			snackbar(`安装失败: ${msg}`);
		} finally {
			operatingPluginId = null;
		}
	}

	function promptUninstall(pluginId: string, pluginName: string) {
		uninstallTarget = { id: pluginId, name: pluginName };
		uninstallDialogOpen = true;
	}

	async function confirmUninstall() {
		const targetId = uninstallTarget.id;
		if (!targetId) return;
		uninstallDialogOpen = false;
		operatingPluginId = targetId;
		try {
			await marketplace.uninstall(targetId);
			refreshInstalled();
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			snackbar(`卸载失败: ${msg}`);
		} finally {
			operatingPluginId = null;
		}
	}

	async function handleToggleEnabled(pluginId: string, enabled: boolean) {
		operatingPluginId = pluginId;
		try {
			if (enabled) {
				await marketplace.enable(pluginId);
			} else {
				await marketplace.disable(pluginId);
			}
			refreshInstalled();
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			snackbar(`操作失败: ${msg}`);
		} finally {
			operatingPluginId = null;
		}
	}

	function handleOpenConfig(
		id: string,
		name: string,
		schema?: ConfigSchema<Record<string, unknown>>
	) {
		if (!schema) return;
		configModalData = {
			id,
			name,
			schema
		};
		configModalOpen = true;
	}

	function formatPermission(perm: string): string {
		switch (perm) {
			case 'network':
				return '网络';
			case 'storage':
				return '存储';
			case 'vault':
				return '凭据';
			case 'notifications':
				return '通知';
			default:
				return perm;
		}
	}
</script>

<div class="mx-auto flex w-full max-w-lg flex-col gap-4 px-4 pt-1 pb-6 text-on-surface">
	<SegmentedControl
		segments={[
			{
				value: 'installed',
				label: `已安装 (${builtinPlugins.length + installedRecords.length})`
			},
			{ value: 'marketplace', label: '插件市场' }
		]}
		value={activeTab}
		onValueChange={(val) => (activeTab = val as 'installed' | 'marketplace')}
	/>

	{#if activeTab === 'installed'}
		<div class="flex flex-col gap-5">
			<!-- 内置插件 -->
			<section class="m3-section">
				<div class="flex items-center justify-between px-1">
					<h2 class="m3-section-title">Chronos 内置插件</h2>
					<span class="m3-label-small text-on-surface-variant">{builtinPlugins.length} 个</span>
				</div>

				<div class="m3-section-surface divide-y divide-border/40">
					{#each builtinPlugins as plugin (plugin.id)}
						{@const name = resolveLocalizedName(plugin.name)}
						{@const desc = resolveLocalizedDesc(plugin.description)}
						{@const meta = getPluginCategoryMeta(plugin.category)}
						<div
							class="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-surface-variant/30"
						>
							<div class="flex min-w-0 flex-1 flex-col justify-center">
								<div class="flex flex-wrap items-center gap-1.5">
									<span class="m3-body-medium line-clamp-1 font-medium text-on-surface">
										{name}
									</span>
									{#if plugin.version}
										<span class="m3-label-small font-mono text-[10px] text-on-surface-variant">
											v{plugin.version}
										</span>
									{/if}
									<span
										class="m3-label-small py-0.2 rounded-full px-1.5 text-[10px] font-medium {meta.badgeClass}"
									>
										{meta.label}
									</span>
								</div>
								{#if desc}
									<p class="m3-body-small mt-0.5 line-clamp-1 text-on-surface-variant">{desc}</p>
								{/if}
							</div>
							<div class="flex shrink-0 items-center gap-1.5">
								{#if plugin.configSchema}
									<Button
										variant="outlined"
										class="h-7.5 px-2.5 text-xs font-normal"
										onclick={() => handleOpenConfig(plugin.id, name, plugin.configSchema)}
									>
										<TuneFill class="mr-1 size-3.5" />
										设置
									</Button>
								{:else}
									<span class="m3-label-small text-[11px] text-on-surface-variant/80">
										默认启用
									</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</section>

			<!-- 已安装插件 -->
			<section class="m3-section">
				<div class="flex items-center justify-between px-1">
					<h2 class="m3-section-title">已安装插件</h2>
					<span class="m3-label-small text-on-surface-variant">{installedRecords.length} 个</span>
				</div>

				{#if installedRecords.length === 0}
					<div
						class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-surface/40 px-4 py-8 text-center text-on-surface-variant"
					>
						<p class="m3-body-medium">暂无安装的第三方插件</p>
						<Button variant="text" class="mt-1 text-xs" onclick={() => (activeTab = 'marketplace')}>
							前往插件市场浏览
						</Button>
					</div>
				{:else}
					<div class="m3-section-surface divide-y divide-border/40">
						{#each installedRecords as record (record.manifest.id)}
							{@const name = resolveLocalizedName(record.manifest.name)}
							{@const desc = resolveLocalizedDesc(record.manifest.description)}
							{@const meta = getPluginCategoryMeta(record.manifest.type)}
							{@const isBusy = operatingPluginId === record.manifest.id}
							{@const permissions =
								record.manifest.permissions || record.manifest.capabilities || []}
							<div
								class="flex flex-col gap-2 p-3 transition-colors hover:bg-surface-variant/30"
								class:opacity-60={!record.enabled}
							>
								<div class="flex items-start justify-between gap-3">
									<div class="flex min-w-0 flex-1 flex-col justify-center">
										<div class="flex flex-wrap items-center gap-1.5">
											<span class="m3-body-medium line-clamp-1 font-medium text-on-surface">
												{name}
											</span>
											{#if record.manifest.version}
												<span class="m3-label-small font-mono text-[10px] text-on-surface-variant">
													v{record.manifest.version}
												</span>
											{/if}
											<span
												class="m3-label-small py-0.2 rounded-full px-1.5 text-[10px] font-medium {meta.badgeClass}"
											>
												{meta.label}
											</span>
											{#if isThemePluginInUse(record.manifest, record.enabled)}
												<span
													class="m3-label-small py-0.2 rounded-full bg-primary-container/80 px-1.5 text-[10px] font-medium text-on-primary-container"
												>
													使用中
												</span>
											{/if}
										</div>
										{#if desc}
											<p class="m3-body-small mt-0.5 line-clamp-1 text-on-surface-variant">
												{desc}
											</p>
										{/if}
									</div>
									<div class="flex shrink-0 items-center gap-2">
										<Switch
											checked={record.enabled}
											disabled={isBusy}
											onCheckedChange={(checked) =>
												handleToggleEnabled(record.manifest.id, checked === true)}
										/>
									</div>
								</div>

								<!-- 权限标签与操作按钮行 -->
								<div class="flex items-center justify-between gap-2">
									<div class="flex flex-wrap items-center gap-1">
										{#if record.manifest.author}
											<span class="m3-caption text-[10px] text-on-surface-variant/70">
												by {record.manifest.author}
											</span>
										{/if}
										{#each permissions as perm (perm)}
											<span
												class="m3-caption py-0.2 rounded bg-surface-container-high px-1.5 text-[10px] text-on-surface-variant"
											>
												{formatPermission(perm)}
											</span>
										{/each}
									</div>

									<div class="flex items-center gap-1">
										{#if record.manifest.configSchema}
											<Button
												variant="outlined"
												class="h-6.5 px-2 text-[11px] font-normal"
												disabled={isBusy || !record.enabled}
												onclick={() =>
													handleOpenConfig(record.manifest.id, name, record.manifest.configSchema)}
											>
												<TuneFill class="mr-0.5 size-3" />
												设置
											</Button>
										{/if}
										<IconButton
											variant="danger"
											size="sm"
											ariaLabel="卸载插件"
											disabled={isBusy}
											onclick={() => promptUninstall(record.manifest.id, name)}
										>
											<DeleteFill class="size-4" />
										</IconButton>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</section>
		</div>
	{:else}
		<div class="flex flex-col gap-3">
			<div class="flex items-center justify-between px-1">
				<div class="flex items-center gap-2">
					<h2 class="m3-section-title">社区与在线插件</h2>
					{#if availablePlugins.length > 0}
						<span class="m3-label-small text-on-surface-variant">
							{availablePlugins.length} 个
						</span>
					{/if}
				</div>
				<Button
					variant="text"
					class="h-8 px-2 text-xs"
					disabled={loadingRegistry}
					onclick={loadMarketplaceRegistry}
				>
					<Refresh class="mr-1 size-3.5" />
					刷新
				</Button>
			</div>

			{#if loadingRegistry}
				<div class="flex flex-col items-center justify-center py-12">
					<LoadingIndicator size="large" />
					<p class="m3-body-small mt-2 text-on-surface-variant">正在加载插件市场清单…</p>
				</div>
			{:else if registryError}
				<div
					class="flex flex-col items-center justify-center rounded-2xl border border-error/30 bg-error-container/20 p-6 text-center"
				>
					<p class="m3-body-medium font-medium text-error">无法加载插件市场清单</p>
					<p class="m3-body-small mt-1 text-on-surface-variant">{registryError}</p>
					<Button
						variant="outlined"
						class="mt-3 h-8 px-4 text-xs"
						onclick={loadMarketplaceRegistry}
					>
						重试
					</Button>
				</div>
			{:else if availablePlugins.length === 0}
				<div
					class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-surface/40 px-4 py-12 text-center text-on-surface-variant"
				>
					<p class="m3-body-medium">暂无可用插件</p>
				</div>
			{:else}
				<div class="m3-section-surface divide-y divide-border/40">
					{#each availablePlugins as manifest (manifest.id)}
						{@const name = resolveLocalizedName(manifest.name)}
						{@const desc = resolveLocalizedDesc(manifest.description)}
						{@const meta = getPluginCategoryMeta(manifest.type)}
						{@const installed = isInstalled(manifest.id)}
						{@const isBusy = operatingPluginId === manifest.id}
						{@const permissions = manifest.permissions || manifest.capabilities || []}
						<div
							class="flex items-center justify-between gap-3 p-3 transition-colors hover:bg-surface-variant/30"
						>
							<div class="flex min-w-0 flex-1 flex-col justify-center">
								<div class="flex flex-wrap items-center gap-1.5">
									<span class="m3-body-medium line-clamp-1 font-medium text-on-surface">
										{name}
									</span>
									{#if manifest.version}
										<span class="m3-label-small font-mono text-[10px] text-on-surface-variant">
											v{manifest.version}
										</span>
									{/if}
									<span
										class="m3-label-small py-0.2 rounded-full px-1.5 text-[10px] font-medium {meta.badgeClass}"
									>
										{meta.label}
									</span>
								</div>
								{#if desc}
									<p class="m3-body-small mt-0.5 line-clamp-1 text-on-surface-variant">{desc}</p>
								{/if}
								{#if permissions.length > 0 || manifest.author}
									<div class="mt-1 flex flex-wrap items-center gap-1">
										{#if manifest.author}
											<span class="m3-caption text-[10px] text-on-surface-variant/70">
												by {manifest.author}
											</span>
										{/if}
										{#each permissions as perm (perm)}
											<span
												class="m3-caption py-0.2 rounded bg-surface-container-high px-1.5 text-[10px] text-on-surface-variant"
											>
												{formatPermission(perm)}
											</span>
										{/each}
									</div>
								{/if}
							</div>

							<div class="flex shrink-0 items-center gap-2">
								{#if installed}
									<span
										class="inline-flex items-center gap-1 rounded-full bg-primary-container/50 px-2.5 py-1 text-xs font-medium text-primary"
									>
										<CheckCircleFill class="size-3.5" />
										已安装
									</span>
								{:else}
									<Button
										variant="filled"
										class="h-8 shrink-0 px-3.5 text-xs font-medium"
										disabled={isBusy}
										onclick={() => handleInstall(manifest)}
									>
										{isBusy ? '安装中…' : '安装'}
									</Button>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>

<PluginConfigModal
	bind:open={configModalOpen}
	pluginId={configModalData.id}
	pluginName={configModalData.name}
	schema={configModalData.schema}
/>

<Dialog
	bind:open={uninstallDialogOpen}
	title="卸载插件？"
	description="确定卸载「{uninstallTarget.name ||
		uninstallTarget.id}」吗？卸载后相关功能与本地配置将被移除。"
>
	{#snippet footer()}
		<Button variant="text" onclick={() => (uninstallDialogOpen = false)}>取消</Button>
		<Button variant="danger" onclick={confirmUninstall}>卸载</Button>
	{/snippet}
</Dialog>
