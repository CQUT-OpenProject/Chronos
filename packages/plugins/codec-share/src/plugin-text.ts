import type { ReactiveChronosController } from '@chronos/ui-kit';
import { SHARE_CODEC_MESSAGES } from './messages';

const SHARE_CODEC_PLUGIN_ID = 'codec-share';

export function sharePluginText(
	controller: ReactiveChronosController | undefined,
	key: keyof (typeof SHARE_CODEC_MESSAGES)['zh-cn']
): string {
	const fallback =
		SHARE_CODEC_MESSAGES['zh-cn'][key] ??
		SHARE_CODEC_MESSAGES.en[key as keyof (typeof SHARE_CODEC_MESSAGES)['en']];
	if (!controller) return fallback;
	void controller.slotVersion;
	const resolved = controller.translatePlugin(SHARE_CODEC_PLUGIN_ID, key);
	return resolved === key ? fallback : resolved;
}
