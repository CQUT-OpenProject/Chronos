<script lang="ts">
	import { onMount } from 'svelte';

	const SNOOZE_KEY = 'chronos:pwa-install-snooze';
	const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

	let deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);
	let visible = $state(false);

	onMount(() => {
		if (isStandalone()) return;

		const snoozedUntil = Number(localStorage.getItem(SNOOZE_KEY) ?? '0');
		if (Date.now() < snoozedUntil) return;

		const onBeforeInstall = (event: Event) => {
			event.preventDefault();
			deferredPrompt = event as BeforeInstallPromptEvent;
			visible = true;
		};

		window.addEventListener('beforeinstallprompt', onBeforeInstall);
		return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
	});

	function isStandalone() {
		return (
			window.matchMedia('(display-mode: standalone)').matches ||
			// @ts-expect-error iOS Safari
			window.navigator.standalone === true
		);
	}

	async function install() {
		if (!deferredPrompt) return;
		await deferredPrompt.prompt();
		const choice = await deferredPrompt.userChoice;
		if (choice.outcome === 'accepted') {
			visible = false;
			deferredPrompt = null;
		}
	}

	function dismiss() {
		localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
		visible = false;
		deferredPrompt = null;
	}
</script>

{#if visible}
	<div
		class="fixed inset-x-4 bottom-20 z-50 rounded-xl border border-border bg-white p-4 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
	>
		<p class="text-sm font-medium">安装 Chronos</p>
		<p class="mt-1 text-sm text-zinc-500">添加到主屏幕，离线查看课表。</p>
		<div class="mt-3 flex gap-2">
			<button
				type="button"
				class="rounded-lg bg-brand px-3 py-2 text-sm text-white"
				onclick={install}
			>
				安装
			</button>
			<button
				type="button"
				class="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-600"
				onclick={dismiss}
			>
				稍后
			</button>
		</div>
	</div>
{/if}
