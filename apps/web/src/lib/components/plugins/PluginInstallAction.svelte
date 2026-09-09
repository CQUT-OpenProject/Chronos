<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { PluginManifest } from '@chronos/core';
	import type { PluginInstallTask } from '$lib/services/official-plugins/install-queue';
	import Button from '$lib/components/ui/Button.svelte';
	import { CheckCircleFill, Close, Refresh } from '$lib/icons';

	let {
		manifest,
		installed = false,
		task,
		onInstall,
		onCancel,
		onRetry
	}: {
		manifest: PluginManifest;
		installed?: boolean;
		task?: PluginInstallTask;
		onInstall: () => void;
		onCancel: () => void;
		onRetry: () => void;
	} = $props();

	// Circular progress parameters: r=11, circumference = 2 * pi * 11 ≈ 69.115
	const CIRCLE_RADIUS = 11;
	const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

	const percent = $derived(task?.progress.percent ?? 0);
	const strokeOffset = $derived(CIRCUMFERENCE * (1 - Math.max(0, Math.min(100, percent)) / 100));

	const stageText = $derived.by(() => {
		if (!task) return '';
		if (task.status === 'downloading') {
			return `${percent}%`;
		}
		if (task.status === 'verifying') {
			return hostT('plugins.status.verifying');
		}
		if (task.status === 'installing') {
			return hostT('plugins.status.installing');
		}
		return '';
	});
</script>

<div class="flex items-center justify-end">
	{#if task?.status === 'downloading' || task?.status === 'verifying' || task?.status === 'installing'}
		<div class="flex items-center gap-2">
			<span class="text-caption font-mono text-[11px] font-medium text-primary">
				{stageText}
			</span>
			<button
				type="button"
				role="progressbar"
				aria-valuenow={percent}
				aria-valuemin="0"
				aria-valuemax="100"
				aria-label={hostT('plugins.action.cancel')}
				title={hostT('plugins.action.cancel')}
				class="group relative flex size-8 cursor-pointer items-center justify-center rounded-full transition-transform active:scale-95"
				onclick={onCancel}
			>
				<svg class="size-8 -rotate-90" viewBox="0 0 28 28">
					<!-- Background track -->
					<circle
						cx="14"
						cy="14"
						r={CIRCLE_RADIUS}
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						class="text-surface-variant/80"
					/>
					<!-- Active progress arc -->
					<circle
						cx="14"
						cy="14"
						r={CIRCLE_RADIUS}
						fill="none"
						stroke="currentColor"
						stroke-width="2.5"
						stroke-linecap="round"
						stroke-dasharray={CIRCUMFERENCE}
						stroke-dashoffset={strokeOffset}
						class="text-primary transition-[stroke-dashoffset] duration-200"
					/>
				</svg>
				<!-- Stop square in center -->
				<span
					class="absolute size-2.5 rounded-[2px] bg-primary transition-transform group-hover:scale-110"
				></span>
			</button>
		</div>
	{:else if task?.status === 'queued'}
		<div class="flex items-center gap-1.5">
			<span class="text-caption text-[11px] font-medium text-on-surface-variant">
				{hostT('plugins.status.queued')}
			</span>
			<button
				type="button"
				class="flex size-7.5 cursor-pointer items-center justify-center rounded-full border border-border/80 text-on-surface-variant transition-all hover:bg-surface-variant/60 active:scale-95"
				title={hostT('plugins.action.cancel')}
				aria-label={hostT('plugins.action.cancel')}
				onclick={onCancel}
			>
				<Close class="size-3.5" />
			</button>
		</div>
	{:else if task?.status === 'failed'}
		<div class="flex items-center gap-1.5">
			<span class="text-caption text-[10px] text-error" title={task.error}>
				{hostT('plugins.status.failed')}
			</span>
			<Button
				variant="outlined"
				class="h-7.5 border-error/50 px-2.5 text-xs text-error hover:bg-error/10 active:bg-error/20"
				onclick={onRetry}
			>
				<Refresh class="mr-1 size-3" />
				{hostT('plugins.action.retry')}
			</Button>
		</div>
	{:else if installed}
		<span
			class="inline-flex items-center gap-1 rounded-full bg-primary-container/50 px-2.5 py-1 text-xs font-medium text-primary"
		>
			<CheckCircleFill class="size-3.5" />
			{hostT('plugins.badge.installed')}
		</span>
	{:else}
		<Button variant="filled" class="h-8 shrink-0 px-3.5 text-xs font-medium" onclick={onInstall}>
			{hostT('plugins.action.install')}
		</Button>
	{/if}
</div>
