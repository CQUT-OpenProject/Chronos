import type { ReactiveChronosController } from '@chronos/ui-kit';
import { SOURCE_CQUT_MESSAGES } from './messages';

export const SOURCE_CQUT_PLUGIN_ID = 'source-cqut';

export function cqutPluginText(
	controller: ReactiveChronosController | undefined,
	key: keyof (typeof SOURCE_CQUT_MESSAGES)['zh-cn']
): string {
	const fallback =
		SOURCE_CQUT_MESSAGES['zh-cn'][key] ??
		SOURCE_CQUT_MESSAGES.en[key as keyof (typeof SOURCE_CQUT_MESSAGES)['en']];
	if (!controller) return fallback;
	void controller.slotVersion;
	const resolved = controller.translatePlugin(SOURCE_CQUT_PLUGIN_ID, key);
	return resolved === key ? fallback : resolved;
}
