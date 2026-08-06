<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';

	let { children } = $props();

	const tabs = [
		{ href: '/', label: '课表' },
		{ href: '/mine', label: '我的' }
	] as const;

	function isActive(href: string) {
		return page.url.pathname === href;
	}
</script>

<div class="pb-16">
	{@render children()}
</div>

<nav class="fixed inset-x-0 bottom-0 flex border-t bg-white">
	{#each tabs as tab (tab.href)}
		<a
			href={resolve(tab.href)}
			class="flex-1 py-3 text-center {isActive(tab.href) ? 'font-semibold text-blue-600' : ''}"
		>
			{tab.label}
		</a>
	{/each}
</nav>
