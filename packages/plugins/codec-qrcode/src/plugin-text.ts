import type { ReactiveChronosController } from '@chronos/ui-kit';
import { QR_CODEC_MESSAGES } from './messages';

const QR_CODEC_PLUGIN_ID = 'tool-qrcode';

export function qrPluginText(
	controller: ReactiveChronosController | undefined,
	key: keyof (typeof QR_CODEC_MESSAGES)['zh-cn']
): string {
	const fallback =
		QR_CODEC_MESSAGES['zh-cn'][key] ??
		QR_CODEC_MESSAGES.en[key as keyof (typeof QR_CODEC_MESSAGES)['en']];
	if (!controller) return fallback;
	void controller.slotVersion;
	const resolved = controller.translatePlugin(QR_CODEC_PLUGIN_ID, key);
	return resolved === key ? fallback : resolved;
}
