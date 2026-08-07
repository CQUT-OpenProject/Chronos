<script lang="ts">
	import { resolve } from '$app/paths';
	import SecondaryPageShell from '$lib/components/mine/SecondaryPageShell.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import { Description, FolderZip } from '$lib/icons';
</script>

<SecondaryPageShell title="开源许可" backHref="/about">
	<MineSection title="许可证" accentColor="tertiary">
		<MineRow
			title="本项目许可证"
			href={resolve('/open-source-licenses/project')}
			icon={Description}
			iconTone="tertiary"
		/>
		<MineRow
			title="第三方依赖许可证"
			href={resolve('/open-source-licenses/third-party')}
			icon={FolderZip}
			iconTone="tertiary"
		/>
	</MineSection>
</SecondaryPageShell>
