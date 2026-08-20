<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getAppEngine,
		getMarketplaceService,
		getAppController,
		builtinPlugins
	} from '$lib/services/app-engine';
	import SegmentedControl from '$lib/components/ui/SegmentedControl.svelte';
	import SearchField from '$lib/components/ui/SearchField.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Switch from '$lib/components/ui/Switch.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';
	import PluginConfigModal from './PluginConfigModal.svelte';
	import { snackbar } from '$lib/components/ui/snackbar-state.svelte';
	import { DeleteFill, Refresh, CodeFill, CheckCircleFill } from '$lib/icons';

	const engine = getAppEngine();
	const controller = getAppController();
	const marketplace = getMarketplaceService();

	let activeTab = $state<'installed' | 'marketplace'>('installed');
	let searchQuery = $state('');

	let installedRecords = $state<InstalledPluginRecord[]>([]);
	let availablePlugins = $state<PluginManifest[]>([]);
	let loadingRegistry = $state(false);
	let registryError = $state<string | null>(null);
	let operatingPluginId = $state<string | null>(null);

	// Config modal state
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

	function getInstalledRecord(pluginId: string): InstalledPluginRecord | undefined {
		return installedRecords.find((r) => r.manifest.id === pluginId);
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

	async function handleUninstall(pluginId: string) {
		operatingPluginId = pluginId;
		try {
			await marketplace.uninstall(pluginId);
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

	const filteredBuiltin = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		return builtinPlugins.filter((p) => {
			if (!q) return true;
			const name = resolveLocalizedName(p.name).toLowerCase();
			const desc = resolveLocalizedDesc(p.description).toLowerCase();
			return name.includes(q) || desc.includes(q) || p.id.toLowerCase().includes(q);
		});
	});

	const filteredInstalled = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		return installedRecords.filter((r) => {
			if (!q) return true;
			const name = resolveLocalizedName(r.manifest.name).toLowerCase();
			const desc = resolveLocalizedDesc(r.manifest.description).toLowerCase();
			return name.includes(q) || desc.includes(q) || r.manifest.id.toLowerCase().includes(q);
		});
	});

	const filteredAvailable = $derived.by(() => {
		const q = searchQuery.trim().toLowerCase();
		return availablePlugins.filter((p) => {
			if (!q) return true;
			const name = resolveLocalizedName(p.name).toLowerCase();
			const desc = resolveLocalizedDesc(p.description).toLowerCase();
			return name.includes(q) || desc.includes(q) || p.id.toLowerCase().includes(q);
		});
	});
</script>

<div class="mx-auto flex w-full max-w-lg flex-col gap-4 p-4 text-on-surface">
	<div class="flex flex-col gap-3">
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

		<SearchField
			bind:value={searchQuery}
			placeholder="搜索插件名称或描述..."
			ariaLabel="搜索插件"
		/>
	</div>

	{#if activeTab === 'installed'}
		<!-- Installed Tab -->
		<div class="flex flex-col gap-3">
			<h2 class="m3-title-small font-medium text-on-surface-variant">内置官方插件</h2>

			{#each filteredBuiltin as plugin (plugin.id)}
				{@const name = resolveLocalizedName(plugin.name)}
				{@const desc = resolveLocalizedDesc(plugin.description)}
				<Card variant="outlined">
					<div class="flex flex-col gap-2 p-3">
						<div class="flex items-start justify-between gap-2">
							<div class="flex items-center gap-2">
								<div
									class="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary"
								>
									<CodeFill class="size-5" />
								</div>
								<div>
									<div class="flex items-center gap-1.5">
										<h3 class="m3-title-medium font-medium">{name}</h3>
										<span
											class="rounded-md bg-secondary-container px-1.5 py-0.5 text-xs text-on-secondary-container"
										>
											内置
										</span>
									</div>
									<p class="m3-body-small text-on-surface-variant">v{plugin.version} · 核心模块</p>
								</div>
							</div>

							{#if plugin.configSchema}
								<Button
									variant="outlined"
									class="text-xs"
									onclick={() => handleOpenConfig(plugin.id, name, plugin.configSchema)}
								>
									设置
								</Button>
							{/if}
						</div>

						{#if desc}
							<p class="m3-body-small text-on-surface-variant">{desc}</p>
						{/if}
					</div>
				</Card>
			{/each}

			<h2 class="m3-title-small mt-2 font-medium text-on-surface-variant">第三方已安装插件</h2>

			{#if filteredInstalled.length === 0}
				<div
					class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-outline/30 py-8 text-center text-on-surface-variant"
				>
					<p class="m3-body-medium">暂无安装的第三方插件</p>
					<Button variant="text" class="mt-1" onclick={() => (activeTab = 'marketplace')}>
						前往插件市场浏览
					</Button>
				</div>
			{:else}
				{#each filteredInstalled as record (record.manifest.id)}
					{@const name = resolveLocalizedName(record.manifest.name)}
					{@const desc = resolveLocalizedDesc(record.manifest.description)}
					{@const isBusy = operatingPluginId === record.manifest.id}
					<Card variant="outlined">
						<div class="flex flex-col gap-2 p-3">
							<div class="flex items-start justify-between gap-2">
								<div class="flex items-center gap-2">
									<div
										class="flex size-9 items-center justify-center rounded-xl bg-tertiary/10 text-tertiary"
									>
										<CodeFill class="size-5" />
									</div>
									<div>
										<h3 class="m3-title-medium font-medium">{name}</h3>
										<p class="m3-body-small text-on-surface-variant">
											v{record.manifest.version} · {record.manifest.author}
										</p>
									</div>
								</div>

								<div class="flex items-center gap-2">
									<Switch
										checked={record.enabled}
										disabled={isBusy}
										onCheckedChange={(checked) =>
											handleToggleEnabled(record.manifest.id, checked === true)}
									/>
								</div>
							</div>

							{#if desc}
								<p class="m3-body-small text-on-surface-variant">{desc}</p>
							{/if}

							<!-- Capability / Permission Badges -->
							{#if (record.manifest.permissions || record.manifest.capabilities)?.length}
								<div class="flex flex-wrap gap-1 pt-1">
									{#each record.manifest.permissions || record.manifest.capabilities || [] as perm (perm)}
										<span
											class="rounded bg-surface-container-high px-1.5 py-0.5 text-[11px] text-on-surface-variant"
										>
											{perm === 'network'
												? '网络访问'
												: perm === 'storage'
													? '独立存储'
													: perm === 'vault'
														? '凭据保管'
														: perm}
										</span>
									{/each}
									{#if record.manifest.allowedDomains?.length}
										<span
											class="rounded bg-surface-container-high px-1.5 py-0.5 text-[11px] text-on-surface-variant"
										>
											白名单: {record.manifest.allowedDomains.join(', ')}
										</span>
									{/if}
								</div>
							{/if}

							<div
								class="flex items-center justify-end gap-2 border-t border-outline-variant/40 pt-2"
							>
								{#if record.manifest.configSchema}
									<Button
										variant="outlined"
										class="text-xs"
										disabled={isBusy || !record.enabled}
										onclick={() =>
											handleOpenConfig(record.manifest.id, name, record.manifest.configSchema)}
									>
										设置
									</Button>
								{/if}
								<Button
									variant="text"
									class="text-xs text-error"
									disabled={isBusy}
									onclick={() => handleUninstall(record.manifest.id)}
								>
									<DeleteFill class="size-4" />
									卸载
								</Button>
							</div>
						</div>
					</Card>
				{/each}
			{/if}
		</div>
	{:else}
		<!-- Marketplace Tab -->
		<div class="flex flex-col gap-3">
			<div class="flex items-center justify-between">
				<h2 class="m3-title-small font-medium text-on-surface-variant">社区与在线插件</h2>
				<Button
					variant="text"
					class="text-xs"
					disabled={loadingRegistry}
					onclick={loadMarketplaceRegistry}
				>
					<Refresh class="size-4" />
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
					<p class="m3-body-medium text-error">无法加载插件市场清单</p>
					<p class="m3-body-small mt-1 text-on-surface-variant">{registryError}</p>
					<Button variant="outlined" class="mt-3 text-xs" onclick={loadMarketplaceRegistry}>
						重试
					</Button>
				</div>
			{:else if filteredAvailable.length === 0}
				<div
					class="flex flex-col items-center justify-center py-12 text-center text-on-surface-variant"
				>
					<p class="m3-body-medium">未找到相关插件</p>
				</div>
			{:else}
				{#each filteredAvailable as manifest (manifest.id)}
					{@const name = resolveLocalizedName(manifest.name)}
					{@const desc = resolveLocalizedDesc(manifest.description)}
					{@const installed = isInstalled(manifest.id)}
					{@const isBusy = operatingPluginId === manifest.id}
					<Card variant="outlined">
						<div class="flex flex-col gap-2 p-3">
							<div class="flex items-start justify-between gap-2">
								<div class="flex items-center gap-2">
									<div
										class="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary"
									>
										<CodeFill class="size-5" />
									</div>
									<div>
										<h3 class="m3-title-medium font-medium">{name}</h3>
										<p class="m3-body-small text-on-surface-variant">
											v{manifest.version} · {manifest.author}
										</p>
									</div>
								</div>

								{#if installed}
									<div class="flex items-center gap-1 text-xs font-medium text-primary">
										<CheckCircleFill class="size-4" />
										已安装
									</div>
								{:else}
									<Button
										variant="filled"
										class="text-xs"
										disabled={isBusy}
										onclick={() => handleInstall(manifest)}
									>
										{isBusy ? '安装中…' : '安装'}
									</Button>
								{/if}
							</div>

							{#if desc}
								<p class="m3-body-small text-on-surface-variant">{desc}</p>
							{/if}

							<!-- Capability / Permission Badges -->
							{#if (manifest.permissions || manifest.capabilities)?.length}
								<div class="flex flex-wrap gap-1 pt-1">
									{#each manifest.permissions || manifest.capabilities || [] as perm (perm)}
										<span
											class="rounded bg-surface-container-high px-1.5 py-0.5 text-[11px] text-on-surface-variant"
										>
											{perm === 'network'
												? '网络访问'
												: perm === 'storage'
													? '独立存储'
													: perm === 'vault'
														? '凭据保管'
														: perm}
										</span>
									{/each}
									{#if manifest.allowedDomains?.length}
										<span
											class="rounded bg-surface-container-high px-1.5 py-0.5 text-[11px] text-on-surface-variant"
										>
											域名: {manifest.allowedDomains.join(', ')}
										</span>
									{/if}
								</div>
							{/if}
						</div>
					</Card>
				{/each}
			{/if}
		</div>
	{/if}
</div>

<!-- Plugin Config Dialog -->
<PluginConfigModal
	bind:open={configModalOpen}
	pluginId={configModalData.id}
	pluginName={configModalData.name}
	schema={configModalData.schema}
/>
