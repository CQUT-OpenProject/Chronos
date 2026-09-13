import { describe, expect, it, vi } from 'vite-plus/test';
import { pluginAnalyticsEventName, trackPluginAnalytics } from '../src/analytics/plugin-analytics';
import { IAnalyticsService, type ServiceIdentifier } from '../src/types/services';
import type { ChronosContext } from '../src/types/context';

describe('pluginAnalyticsEventName', () => {
	it('formats plugin-scoped event names', () => {
		expect(pluginAnalyticsEventName('tool-wallpaper', 'pick')).toBe('plugin.tool-wallpaper.pick');
	});
});

describe('trackPluginAnalytics', () => {
	it('no-ops when analytics port is not injected', () => {
		const ctx: Pick<ChronosContext, 'tryService'> = {
			tryService: () => undefined
		};

		expect(() => trackPluginAnalytics(ctx, 'tool-wallpaper', 'pick')).not.toThrow();
	});

	it('tracks namespaced events with default plugin properties', () => {
		const track = vi.fn();
		const ctx: Pick<ChronosContext, 'tryService'> = {
			tryService: <T>(identifier: ServiceIdentifier<T>) =>
				identifier === IAnalyticsService ? ({ track } as T) : undefined
		};

		trackPluginAnalytics(ctx, 'tool-wallpaper', 'crop_confirm', { success: true });

		expect(track).toHaveBeenCalledWith('plugin.tool-wallpaper.crop_confirm', {
			source: 'plugin',
			plugin_id: 'tool-wallpaper',
			success: true
		});
	});

	it('does not let caller properties override plugin defaults', () => {
		const track = vi.fn();
		const ctx: Pick<ChronosContext, 'tryService'> = {
			tryService: <T>(identifier: ServiceIdentifier<T>) =>
				identifier === IAnalyticsService ? ({ track } as T) : undefined
		};

		trackPluginAnalytics(ctx, 'tool-wallpaper', 'clear', {
			source: 'override',
			plugin_id: 'other-plugin'
		});

		expect(track).toHaveBeenCalledWith('plugin.tool-wallpaper.clear', {
			source: 'plugin',
			plugin_id: 'tool-wallpaper'
		});
	});
});
