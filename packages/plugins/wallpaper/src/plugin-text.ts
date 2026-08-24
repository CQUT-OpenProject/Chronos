import type { ReactiveChronosController } from '@chronos/ui-kit';
import { WALLPAPER_MESSAGES } from './messages';
import { WALLPAPER_PLUGIN_ID } from './storage';

export function wallpaperPluginText(
	controller: ReactiveChronosController | undefined,
	key: keyof (typeof WALLPAPER_MESSAGES)['zh-cn']
): string {
	const fallback =
		WALLPAPER_MESSAGES['zh-cn'][key] ??
		WALLPAPER_MESSAGES.en[key as keyof (typeof WALLPAPER_MESSAGES)['en']];
	if (!controller) return fallback;
	void controller.slotVersion;
	const resolved = controller.translatePlugin(WALLPAPER_PLUGIN_ID, key);
	return resolved === key ? fallback : resolved;
}
