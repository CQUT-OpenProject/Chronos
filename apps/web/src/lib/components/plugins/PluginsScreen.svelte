<script lang="ts">
	import { onMount } from 'svelte';
	import {
		getOfficialPluginService,
		getProfileBuiltinPlugins,
		getAppController
	} from '$lib/services/app-engine';
	import type { InstalledOfficialPluginRecord } from '$lib/services/official-plugins/official-plugin-service';
	import type { PluginManifest, ConfigSchema } from '@chronos/core';
	import { resolveLocaleMapText } from '@chronos/core';
	import SegmentedControl from '$lib/components/ui/SegmentedControl.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import IconButton from '$lib/components/ui/IconButton.svelte';
	import Switch from '$lib/components/ui/Switch.svelte';
	import Dialog from '$lib/components/ui/Dialog.svelte';
	import LoadingIndicator from '$lib/components/ui/LoadingIndicator.svelte';
	import ActionBottomBar from '$lib/components/ui/ActionBottomBar.svelte';
	import PluginConfigModal from './PluginConfigModal.svelte';
	import { snackbarKey } from '$lib/components/ui/snackbar-state.svelte';
	import { hostText, hostTextRead } from '$lib/i18n/host-text';
	import { resolveColorSchemeId } from '$lib/appearance/color-scheme';
	import { getPluginCategoryMeta } from '$lib/services/official-plugins/plugin-tags';
	import { DeleteFill, CheckCircleFill, TuneFill } from '$lib/icons';

	const BUILTIN_CATALOG_URL = '/official-plugins/catalog.json';

	const officialPlugins = getOfficialPluginService();
	const profileBuiltinPlugins = $derived(getProfileBuiltinPlugins());
	const appController = getAppController();
	const paletteMode = $derived(appController.userPreferences?.paletteMode ?? 'vibrant');
	const visualThemeId = $derived(appController.activeThemeId);
	const activeColorSchemeId = $derived(resolveColorSchemeId(paletteMode, visualThemeId));

	let activeTab = $state<'installed' | 'official'>('installed');

	let installedRecords = $state<InstalledOfficialPluginRecord[]>([]);
	let catalogManifests = $state<Array<{ url: string; manifest: PluginManifest }>>([]);
	let loadingCatalog = $state(false);
	let catalogError = $state<string | null>(null);
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

	let linkInstallDialogOpen = $state(false);
	let manifestUrlInput = $state('');

	function refreshInstalled() {
		installedRecords = [...officialPlugins.listInstalled()];
	}

	onMount(() => {
		void officialPlugins.init().then(() => {
			refreshInstalled();
		});

		const sub = officialPlugins.onChanged(() => {
			refreshInstalled();
		});

		return () => {
			sub.dispose();
		};
	});

	async function loadOfficialCatalog() {
		loadingCatalog = true;
		catalogError = null;
		try {
			const catalog = await officialPlugins.fetchCatalog(BUILTIN_CATALOG_URL);
			const entries = await Promise.all(
				catalog.manifests.map(async (url) => {
					const manifest = await officialPlugins.fetchManifest(url);
					return { url, manifest };
				})
			);
			catalogManifests = entries;
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			catalogError = msg;
		} finally {
			loadingCatalog = false;
		}
	}

	$effect(() => {
		if (activeTab === 'official') {
			void loadOfficialCatalog();
		}
	});

	const activeLocale = $derived(appController.currentLocale);

	const tabSegments = $derived.by(() => {
		void appController.currentLocale;
		void appController.slotVersion;
		return [
			{
				value: 'installed',
				label: hostText('plugins.tab.installed', {
					count: profileBuiltinPlugins.length + installedRecords.length
				})
			},
			{ value: 'official', label: hostText('plugins.tab.market') }
		];
	});

	function resolveManifestText(
		value: string | Record<string, string> | (() => string) | undefined
	): string {
		if (!value) return '';
		if (typeof value === 'function') return value();
		if (typeof value === 'string') return value;
		return resolveLocaleMapText(value, activeLocale);
	}

	function isInstalled(pluginId: string): boolean {
		return (
			profileBuiltinPlugins.some((p) => p.id === pluginId) ||
			installedRecords.some((r) => r.manifest.id === pluginId)
		);
	}

	function isThemePluginInUse(manifest: PluginManifest, enabled: boolean): boolean {
		// themeId 由构建期从 colors JSON 显式写入，宿主不猜测 id 前缀
		return Boolean(enabled && manifest.themeId && activeColorSchemeId === manifest.themeId);
	}

	async function handleInstall(manifest: PluginManifest, manifestUrl?: string) {
		operatingPluginId = manifest.id;
		try {
			await officialPlugins.install(manifest, manifestUrl);
			refreshInstalled();
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			snackbarKey('snackbar.install.failed', { message: msg });
		} finally {
			operatingPluginId = null;
		}
	}

	function promptLinkInstall() {
		manifestUrlInput = '';
		linkInstallDialogOpen = true;
	}

	async function confirmLinkInstall() {
		const url = manifestUrlInput.trim();
		if (!url) {
			snackbarKey('snackbar.manifestRequired');
			return;
		}
		linkInstallDialogOpen = false;
		operatingPluginId = 'url-install';
		try {
			await officialPlugins.installFromManifestUrl(url);
			refreshInstalled();
			activeTab = 'installed';
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			snackbarKey('snackbar.install.failed', { message: msg });
		} finally {
			operatingPluginId = null;
			manifestUrlInput = '';
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
			await officialPlugins.uninstall(targetId);
			refreshInstalled();
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			snackbarKey('snackbar.uninstall.failed', { message: msg });
		} finally {
			operatingPluginId = null;
		}
	}

	async function handleToggleEnabled(pluginId: string, enabled: boolean) {
		operatingPluginId = pluginId;
		try {
			if (enabled) {
				await officialPlugins.enable(pluginId);
			} else {
				await officialPlugins.disable(pluginId);
			}
			refreshInstalled();
		} catch (err: unknown) {
			const msg = err instanceof Error ? err.message : String(err);
			snackbarKey('snackbar.toggle.failed', { message: msg });
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
</script>

{#snippet linkImportFooter()}
	<Button variant="outlined" class="w-full" onclick={promptLinkInstall}>
		{hostTextRead(appController, 'plugins.link.open')}
	</Button>
{/snippet}

<div class="flex h-full min-h-0 flex-col text-on-surface">
	<div class="shrink-0 px-4 pt-3 pb-4">
		<SegmentedControl
			segments={tabSegments}
			value={activeTab}
			onValueChange={(val) => (activeTab = val as 'installed' | 'official')}
		/>
	</div>

	{#if activeTab === 'installed'}
		<div class="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
			<section class="m3-section">
				<div class="flex items-center justify-between px-1">
					<h2 class="m3-section-title">{hostTextRead(appController, 'plugins.builtin.heading')}</h2>
					<span class="m3-label-small text-on-surface-variant"
						>{hostTextRead(appController, 'plugins.builtin.count', {
							count: profileBuiltinPlugins.length
						})}</span
					>
				</div>

				<div class="m3-section-surface divide-y divide-border/40">
					{#each profileBuiltinPlugins as plugin (plugin.id)}
						{@const name = resolveManifestText(plugin.name)}
						{@const desc = resolveManifestText(plugin.description)}
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
										{hostTextRead(appController, 'plugins.action.settings')}
									</Button>
								{:else}
									<span class="m3-label-small text-[11px] text-on-surface-variant/80">
										{hostTextRead(appController, 'plugins.builtin.defaultEnabled')}
									</span>
								{/if}
							</div>
						</div>
					{/each}
				</div>
			</section>

			<section class="m3-section">
				<div class="flex items-center justify-between px-1">
					<h2 class="m3-section-title">
						{hostTextRead(appController, 'plugins.installed.heading')}
					</h2>
					<span class="m3-label-small text-on-surface-variant"
						>{hostTextRead(appController, 'plugins.builtin.count', {
							count: installedRecords.length
						})}</span
					>
				</div>

				{#if installedRecords.length === 0}
					<div
						class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-surface/40 px-4 py-8 text-center text-on-surface-variant"
					>
						<p class="m3-body-medium">{hostTextRead(appController, 'plugins.empty.installed')}</p>
						<Button variant="text" class="mt-1 text-xs" onclick={() => (activeTab = 'official')}>
							{hostTextRead(appController, 'plugins.empty.browse')}
						</Button>
					</div>
				{:else}
					<div class="m3-section-surface divide-y divide-border/40">
						{#each installedRecords as record (record.manifest.id)}
							{@const name = resolveManifestText(record.manifest.name)}
							{@const desc = resolveManifestText(record.manifest.description)}
							{@const meta = getPluginCategoryMeta(record.manifest.type)}
							{@const isBusy = operatingPluginId === record.manifest.id}
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
													{hostTextRead(appController, 'plugins.badge.inUse')}
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

								<div class="flex items-center justify-between gap-2">
									<div class="flex flex-wrap items-center gap-1">
										{#if record.manifest.author}
											<span class="m3-caption text-[10px] text-on-surface-variant/70">
												by {record.manifest.author}
											</span>
										{/if}
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
												{hostTextRead(appController, 'plugins.action.settings')}
											</Button>
										{/if}
										<IconButton
											variant="danger"
											size="sm"
											ariaLabel={hostTextRead(appController, 'plugins.uninstall.aria')}
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
		<div class="flex min-h-0 flex-1 flex-col">
			<div class="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 overflow-y-auto px-4 pb-4">
				<section class="m3-section">
					<div class="flex items-center gap-2 px-1">
						<h2 class="m3-section-title">
							{hostTextRead(appController, 'plugins.catalog.heading')}
						</h2>
						{#if catalogManifests.length > 0}
							<span class="m3-label-small text-on-surface-variant">
								{hostTextRead(appController, 'plugins.builtin.count', {
									count: catalogManifests.length
								})}
							</span>
						{/if}
					</div>

					{#if loadingCatalog}
						<div class="flex flex-col items-center justify-center py-12">
							<LoadingIndicator size="large" />
							<p class="m3-body-small mt-2 text-on-surface-variant">
								{hostTextRead(appController, 'plugins.catalog.loading')}
							</p>
						</div>
					{:else if catalogError}
						<div
							class="flex flex-col items-center justify-center rounded-2xl border border-error/30 bg-error-container/20 p-6 text-center"
						>
							<p class="m3-body-medium font-medium text-error">
								{hostTextRead(appController, 'plugins.catalog.error.title')}
							</p>
							<p class="m3-body-small mt-1 text-on-surface-variant">{catalogError}</p>
							<Button
								variant="outlined"
								class="mt-3 h-8 px-4 text-xs"
								onclick={loadOfficialCatalog}
							>
								{hostTextRead(appController, 'plugins.catalog.retry')}
							</Button>
						</div>
					{:else if catalogManifests.length === 0}
						<div
							class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-surface/40 px-4 py-12 text-center text-on-surface-variant"
						>
							<p class="m3-body-medium">{hostTextRead(appController, 'plugins.catalog.empty')}</p>
						</div>
					{:else}
						<div class="m3-section-surface divide-y divide-border/40">
							{#each catalogManifests as entry (entry.manifest.id)}
								{@const manifest = entry.manifest}
								{@const name = resolveManifestText(manifest.name)}
								{@const desc = resolveManifestText(manifest.description)}
								{@const meta = getPluginCategoryMeta(manifest.type)}
								{@const installed = isInstalled(manifest.id)}
								{@const isBusy = operatingPluginId === manifest.id}
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
											<p class="m3-body-small mt-0.5 line-clamp-1 text-on-surface-variant">
												{desc}
											</p>
										{/if}
										{#if manifest.author}
											<div class="mt-1 flex flex-wrap items-center gap-1">
												<span class="m3-caption text-[10px] text-on-surface-variant/70">
													by {manifest.author}
												</span>
											</div>
										{/if}
									</div>

									<div class="flex shrink-0 items-center gap-2">
										{#if installed}
											<span
												class="inline-flex items-center gap-1 rounded-full bg-primary-container/50 px-2.5 py-1 text-xs font-medium text-primary"
											>
												<CheckCircleFill class="size-3.5" />
												{hostTextRead(appController, 'plugins.badge.installed')}
											</span>
										{:else}
											<Button
												variant="filled"
												class="h-8 shrink-0 px-3.5 text-xs font-medium"
												disabled={isBusy}
												onclick={() => handleInstall(manifest, entry.url)}
											>
												{isBusy
													? hostTextRead(appController, 'plugins.action.installing')
													: hostTextRead(appController, 'plugins.action.install')}
											</Button>
										{/if}
									</div>
								</div>
							{/each}
						</div>
					{/if}
				</section>
			</div>
			<ActionBottomBar>
				{@render linkImportFooter()}
			</ActionBottomBar>
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
	title={hostTextRead(appController, 'plugins.uninstall.title')}
	description={hostTextRead(appController, 'plugins.uninstall.desc', {
		name: uninstallTarget.name || uninstallTarget.id
	})}
>
	{#snippet footer()}
		<Button variant="text" onclick={() => (uninstallDialogOpen = false)}>
			{hostTextRead(appController, 'common.cancel')}
		</Button>
		<Button variant="danger" onclick={confirmUninstall}>
			{hostTextRead(appController, 'common.uninstall')}
		</Button>
	{/snippet}
</Dialog>

<Dialog bind:open={linkInstallDialogOpen} title={hostTextRead(appController, 'plugins.link.title')}>
	<div class="flex flex-col gap-3 py-2">
		<input
			class="m3-body-medium w-full rounded-xl border border-border bg-surface px-3 py-2 text-on-surface outline-none focus:border-primary"
			type="url"
			placeholder={hostTextRead(appController, 'plugins.link.placeholder')}
			bind:value={manifestUrlInput}
		/>
	</div>
	{#snippet footer()}
		<Button variant="text" onclick={() => (linkInstallDialogOpen = false)}>
			{hostTextRead(appController, 'common.cancel')}
		</Button>
		<Button variant="filled" onclick={confirmLinkInstall}>
			{hostTextRead(appController, 'plugins.link.confirm')}
		</Button>
	{/snippet}
</Dialog>
