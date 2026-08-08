<script lang="ts">
	import { resolve } from '$app/paths';
	import favicon from '$lib/assets/favicon.svg';

	let { onImport }: { onImport?: () => void } = $props();
</script>

<div
	class="flex min-h-[calc(100dvh-var(--spacing-tabbar)-var(--tabbar-safe))] flex-col items-center justify-center gap-3 px-6 py-8 text-center"
>
	<img src={favicon} alt="" class="h-[220px] w-[220px]" aria-hidden="true" />

	<p class="m3-label-large font-semibold text-brand dark:text-soft-blue">Chronos</p>
	<h2 class="m3-headline-medium font-bold text-on-surface">还没有课程表</h2>

	<div class="mt-4">
		<a
			href={resolve('/transfer/import')}
			onclick={onImport}
			class="inline-flex h-10 items-center justify-center rounded-full border border-outline px-6 text-sm font-medium text-brand transition-colors hover:bg-brand/10 active:bg-brand/20"
		>
			导入课程表
		</a>
	</div>
</div>
