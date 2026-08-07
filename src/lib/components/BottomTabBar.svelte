<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { getContext } from 'svelte';
	import type { TimetableScreenController } from '$lib/timetable/timetable-screen.svelte';
	import { CalendarMonth, CalendarMonthFill, Person, PersonFill } from '$lib/icons';

	const timetableScreen = getContext<TimetableScreenController>('timetableScreen');

	const tabs = [
		{ href: '/', label: '课表', Icon: CalendarMonth, IconFill: CalendarMonthFill },
		{ href: '/mine', label: '我的', Icon: Person, IconFill: PersonFill }
	] as const;

	let activeTabHref = $state<'/' | '/mine'>('/');

	$effect(() => {
		const pathname = page.url.pathname;
		if (pathname === '/mine') {
			activeTabHref = '/mine';
		} else if (pathname === '/') {
			activeTabHref = '/';
		}
	});

	function isActive(href: string) {
		return activeTabHref === href;
	}

	function vibrate() {
		navigator.vibrate?.(10);
	}

	function onTimetableTabClick(event: MouseEvent) {
		vibrate();
		timetableScreen.jumpToCurrentWeek();
		if (page.url.pathname === '/') {
			event.preventDefault();
		}
	}
</script>

<nav
	class="flex h-[calc(var(--spacing-tabbar)+var(--tabbar-safe))] items-center justify-around border-t border-outline-variant/40 bg-surface px-4 pb-[var(--tabbar-safe)]"
>
	{#each tabs as tab (tab.href)}
		{@const active = isActive(tab.href)}
		<a
			href={resolve(tab.href)}
			class="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 py-1"
			onclick={tab.href === '/' ? onTimetableTabClick : vibrate}
		>
			<span
				class="flex h-8 w-16 items-center justify-center rounded-full {active
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
				class="text-xs {active
					? 'font-semibold text-on-secondary-container'
					: 'font-medium text-on-surface-variant'}"
			>
				{tab.label}
			</span>
		</a>
	{/each}
</nav>
