<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { dismissSnackbar, snackbar } from '$lib/components/ui/snackbar-state.svelte';
	import {
		APP_VERSION,
		BUILD_TIME,
		COPYRIGHT_HOLDER,
		formatCopyrightYearRange,
		PROJECT_INTRO,
		PROJECT_LICENSE,
		SOURCE_CODE_URL
	} from '$lib/config/app-meta';
	import MineSection from '$lib/components/mine/MineSection.svelte';
	import MineRow from '$lib/components/mine/MineRow.svelte';
	import AppHero from '$lib/components/AppHero.svelte';
	import { CodeFill, GavelFill, InfoFill, OpenInNewFill, ScheduleFill } from '$lib/icons';

	let clickCount = $state(0);

	function formatBuildTime(value: string) {
		if (!value) return '-';
		return value.replace('T', ' ').replace(/\.\d+Z$/, 'Z');
	}

	function handleBuildTimeClick() {
		clickCount += 1;
		if (clickCount >= 10) {
			clickCount = 0;
			dismissSnackbar();
			void goto(resolve('/about/easter-egg'));
		} else if (clickCount >= 5) {
			const remaining = 10 - clickCount;
			snackbar(`再按 ${remaining} 次进入开发者页面`, undefined, 1500);
		}
	}
</script>

<div class="m3-stack">
	<AppHero title="Chronos" subtitle={PROJECT_INTRO} />

	<MineSection title="版本信息" accentColor="primary">
		<MineRow
			title="当前版本"
			supporting={APP_VERSION}
			href={resolve('/about/releases')}
			icon={InfoFill}
			iconTone="primary"
		/>
		<MineRow
			title="构建时间"
			supporting={formatBuildTime(BUILD_TIME)}
			icon={ScheduleFill}
			iconTone="secondary"
			onclick={handleBuildTimeClick}
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

	<footer class="copyright">
		<p class="m3-body-small text-on-surface-variant">
			© {formatCopyrightYearRange()}
			{COPYRIGHT_HOLDER} ·
			<a href={resolve('/open-source-licenses/project')} class="license-link">
				{PROJECT_LICENSE}
			</a>
		</p>
	</footer>
</div>

<style>
	.copyright {
		padding-top: 1.5rem;
		text-align: center;
	}

	.license-link {
		color: inherit;
		text-decoration: underline;
		text-underline-offset: 0.125rem;
	}

	.license-link:hover {
		opacity: 0.8;
	}
</style>
