<script lang="ts">
	import { resolve } from '$app/paths';
	import { APP_VERSION, BUILD_TIME, PROJECT_INTRO, SOURCE_CODE_URL } from '$lib/config/app-meta';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import { CodeFill, GavelFill, InfoFill, OpenInNewFill, ScheduleFill } from '$lib/icons';
	import chronosIcon from '$lib/assets/chronos-icon.svg';

	function formatBuildTime(value: string) {
		if (!value) return '-';
		return value.replace('T', ' ').replace(/\.\d+Z$/, 'Z');
	}
</script>

<div class="m3-stack">
	<div class="hero">
		<img src={chronosIcon} alt="Chronos" class="logo" />
		<p class="m3-headline-small font-semibold">Chronos</p>
		<p class="m3-body-medium text-on-surface-variant">{PROJECT_INTRO}</p>
	</div>

	<MineSection title="版本信息" accentColor="primary">
		<MineRow
			title="当前版本"
			supporting={APP_VERSION}
			href={resolve('/about/version-release')}
			icon={InfoFill}
			iconTone="primary"
		/>
		<MineRow
			title="构建时间"
			supporting={formatBuildTime(BUILD_TIME)}
			icon={ScheduleFill}
			iconTone="secondary"
		/>
	</MineSection>

	<MineSection title="项目与反馈" accentColor="tertiary">
		<MineRow
			title="开源许可"
			href={resolve('/open-source-licenses')}
			icon={GavelFill}
			iconTone="tertiary"
		/>
		<MineRow
			title="项目源代码"
			href={SOURCE_CODE_URL}
			target="_blank"
			rel="noreferrer"
			icon={CodeFill}
			iconTone="neutral"
		>
			{#snippet trailing()}
				<OpenInNewFill class="text-on-surface-variant" style="width:1.125rem;height:1.125rem" />
			{/snippet}
		</MineRow>
	</MineSection>
</div>

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
		width: 4.5rem;
		height: 4.5rem;
		border-radius: 1.125rem;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
	}
</style>
