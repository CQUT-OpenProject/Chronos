<script lang="ts">
	import { resolve } from '$app/paths';

	let {
		onCreateTimetable,
		onImport
	}: {
		onCreateTimetable: () => void | Promise<void>;
		onImport: () => void;
	} = $props();

	let creating = $state(false);

	async function handleCreate() {
		if (creating) return;
		creating = true;
		try {
			await onCreateTimetable();
		} finally {
			creating = false;
		}
	}
</script>

<div
	class="flex min-h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-4 px-6 text-center"
>
	<h2 class="text-xl font-semibold">还没有课表</h2>
	<p class="text-sm text-zinc-500">创建一个新课表，或从文件 / 在线导入。</p>
	<div class="flex flex-col gap-2 sm:flex-row">
		<button
			type="button"
			class="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-60"
			disabled={creating}
			onclick={handleCreate}
		>
			{creating ? '创建中…' : '创建课表'}
		</button>
		<a
			href={resolve('/transfer/import')}
			class="rounded-lg border border-zinc-300 px-4 py-2"
			onclick={onImport}
		>
			导入课表
		</a>
	</div>
</div>
