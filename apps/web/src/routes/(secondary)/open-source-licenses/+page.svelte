<script lang="ts">
	import { hostT } from '$lib/i18n/host-i18n.svelte';
	import { resolve } from '$app/paths';
	import SecondaryPageShell from '$lib/components/SecondaryPageShell.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import { getAppController } from '$lib/services/app-engine';

	import { DescriptionFill, FolderZipFill } from '$lib/icons';

	const controller = getAppController();
</script>

<SecondaryPageShell title={hostT('route.licenses')} backHref="/about">
	<MineSection title={hostT('about.licenses.index.heading')}>
		<MineRow
			title={hostT('about.licenses.index.project')}
			href={resolve('/open-source-licenses/project')}
			icon={DescriptionFill}
			iconTone="tertiary"
		/>
		<MineRow
			title={hostT('about.licenses.index.thirdParty')}
			href={resolve('/open-source-licenses/third-party')}
			icon={FolderZipFill}
			iconTone="tertiary"
		/>
	</MineSection>
</SecondaryPageShell>
