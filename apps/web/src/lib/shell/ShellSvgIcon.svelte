<script lang="ts">
	interface Props {
		markup: string;
		class?: string;
		rotation?: number;
		opacity?: number;
	}

	let { markup, class: className = '', rotation, opacity }: Props = $props();

	const wrapperStyle = $derived.by(() => {
		const parts: string[] = [];
		if (rotation !== undefined) parts.push(`rotate(${rotation}deg)`);
		if (parts.length === 0) return undefined;
		return `transform:${parts.join(' ')};transform-origin:center`;
	});
</script>

<span class="inline-flex {className}" style={wrapperStyle} style:opacity aria-hidden="true">
	{@html markup}
</span>

<style>
	span :global(svg) {
		width: 100%;
		height: 100%;
	}
</style>
