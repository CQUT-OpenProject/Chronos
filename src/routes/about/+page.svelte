<script lang="ts">
	import { resolve } from '$app/paths';
	import { APP_VERSION, BUILD_TIME, PROJECT_INTRO, SOURCE_CODE_URL } from '$lib/config/app-meta';
	import SecondaryPageShell from '$lib/components/mine/SecondaryPageShell.svelte';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import { Code, Gavel, Info, OpenInNew } from '$lib/icons';
	import favicon from '$lib/assets/favicon.svg';

	function formatBuildTime(value: string) {
		if (!value) return '-';
		return value.replace('T', ' ').replace(/\.\d+Z$/, 'Z');
	}
</script>

<SecondaryPageShell title="关于" backHref="/mine">
	<div class="m3-stack">
		<div class="hero">
			<img src={favicon} alt="Chronos" class="logo" />
			<p class="m3-headline-small font-semibold">Chronos</p>
			<p class="m3-body-medium text-on-surface-variant">{PROJECT_INTRO}</p>
		</div>

		<MineSection title="版本信息" accentColor="primary">
			<MineRow
				title="当前版本"
				supporting={APP_VERSION}
				href={resolve('/about/version-release')}
				icon={Info}
				iconTone="primary"
			/>
			<MineRow
				title="构建时间"
				supporting={formatBuildTime(BUILD_TIME)}
				icon={Info}
				iconTone="secondary"
			/>
		</MineSection>

		<MineSection title="项目与反馈" accentColor="tertiary">
			<MineRow
				title="开源许可"
				href={resolve('/open-source-licenses')}
				icon={Gavel}
				iconTone="tertiary"
			/>
			<a href={SOURCE_CODE_URL} target="_blank" rel="noreferrer" class="m3-mine-row">
				<span class="m3-leading-icon tone-neutral">
					<Code />
				</span>
				<div class="m3-mine-row-content">
					<span class="m3-body-large m3-mine-row-title">项目源代码</span>
				</div>
				<OpenInNew class="m3-mine-row-arrow" />
			</a>
		</MineSection>
	</div>
</SecondaryPageShell>

<style>
	.hero {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 0;
		text-align: center;
	}

	.logo {
		width: 5.75rem;
		height: 5.75rem;
		border-radius: 9999px;
	}
</style>
