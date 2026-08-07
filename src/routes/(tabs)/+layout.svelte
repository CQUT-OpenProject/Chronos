<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { CalendarMonth, CalendarMonthFill, Person, PersonFill } from '$lib/icons';

	let { children } = $props();

	const tabs = [
		{ href: '/', label: '课表', Icon: CalendarMonth, IconFill: CalendarMonthFill },
		{ href: '/mine', label: '我的', Icon: Person, IconFill: PersonFill }
	] as const;

	function isActive(href: string) {
		return page.url.pathname === href;
	}

	function vibrate() {
		navigator.vibrate?.(10);
	}
</script>

<div class="pb-[calc(5rem+var(--tabbar-safe))]">
	{@render children()}
</div>

<nav
	class="fixed inset-x-0 bottom-0 flex h-[calc(5rem+var(--tabbar-safe))] items-center justify-around border-t border-outline-variant/40 bg-surface px-4 pb-[var(--tabbar-safe)]"
>
	{#each tabs as tab (tab.href)}
		{@const active = isActive(tab.href)}
		<a
			href={resolve(tab.href)}
			class="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 py-1"
			onclick={vibrate}
		>
			<span
				class="flex h-8 w-16 items-center justify-center rounded-full transition-colors {active
					? 'bg-secondary-container text-on-secondary-container'
					: 'bg-transparent text-on-surface-variant'}"
			>
				{#if active}
					<tab.IconFill class="size-6" />
				{:else}
					<tab.Icon class="size-6" />
				{/if}
			</span>
			<span
				class="text-xs transition-colors {active
					? 'font-semibold text-on-secondary-container'
					: 'font-medium text-on-surface-variant'}"
			>
				{tab.label}
			</span>
		</a>
	{/each}
</nav>
