<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import type { Pathname } from '$app/types';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { getContext } from 'svelte';
	import { ArrowBack } from '$lib/icons';
	import IconButton from '$lib/components/ui/IconButton.svelte';
	import TopAppBar from '$lib/components/TopAppBar.svelte';
	import { haptic } from '$lib/haptic/haptic';
	import type { ShellTabController } from '$lib/shell/shell-tab.svelte';

	let {
		title,
		backHref = '/' as Pathname,
		backShellTab,
		actions,
		flush = false,
		children
	}: {
		title: string;
		backHref?: Pathname;
		backShellTab?: string;
		actions?: import('svelte').Snippet;
		flush?: boolean;
		children?: import('svelte').Snippet;
	} = $props();

	const shellTab = getContext<ShellTabController>('shellTab');

	function handleBack(event: MouseEvent) {
		haptic.light();
		if (!backShellTab) return;
		event.preventDefault();
		shellTab.setActiveTab(backShellTab);
		void goto(resolve('/'));
	}
</script>

<div class="secondary-page relative z-[60] flex h-dvh flex-col overflow-hidden bg-canvas">
	<TopAppBar {title} {actions} class="shrink-0">
		{#snippet leading()}
			<IconButton
				href={backShellTab ? undefined : resolve(backHref)}
				ariaLabel={hostT('ui.nav.back')}
				onclick={handleBack}
			>
				<ArrowBack class="size-6 text-on-surface" />
			</IconButton>
		{/snippet}
	</TopAppBar>
	<main
		class="min-h-0 w-full flex-1 {flush
			? 'flex flex-col overflow-hidden'
			: 'mx-auto max-w-lg overflow-y-auto p-4'}"
	>
		{@render children?.()}
	</main>
</div>
