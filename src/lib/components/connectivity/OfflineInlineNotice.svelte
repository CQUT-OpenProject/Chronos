<script lang="ts">
	import { WifiOffFill } from '$lib/icons';
	import { offlineCopy } from '$lib/platform/offline-copy';

	let { message = offlineCopy.onlineImportBlocked }: { message?: string } = $props();
</script>

<div
	class="flex items-start gap-2 rounded-xl bg-surface-variant/60 px-3 py-2.5 text-on-surface-variant"
>
	<WifiOffFill class="mt-0.5 size-4 shrink-0" aria-hidden="true" />
	<p class="m3-body-small">{message}</p>
</div>
