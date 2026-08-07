<script lang="ts">
	import { resolve } from '$app/paths';
	import { Button } from 'm3-svelte';
	import favicon from '$lib/assets/favicon.svg';

	let { onImport }: { onImport?: () => void } = $props();
</script>

<div
	class="flex min-h-[calc(100dvh-var(--spacing-tabbar)-var(--tabbar-safe))] flex-col items-center justify-center gap-3 px-6 py-8 text-center"
>
	<img src={favicon} alt="" class="h-[220px] w-[220px]" aria-hidden="true" />

	<p class="m3-label-large text-brand dark:text-soft-blue">Chronos</p>
	<h2 class="m3-headline-medium font-bold text-on-surface">还没有课程表</h2>

	<div class="mt-4">
		<Button variant="outlined" href={resolve('/transfer/import')} onclick={onImport}>
			导入课程表
		</Button>
	</div>
</div>
