import { CORE_SHELL_MESSAGE_KEYS, HOST_MESSAGES } from '$lib/i18n/host-messages';

function pickShellMessages(locale: 'zh-cn' | 'en') {
	const entries = CORE_SHELL_MESSAGE_KEYS.map((key) => [key, HOST_MESSAGES[locale][key]]);
	return Object.fromEntries(entries);
}

export const CORE_SHELL_MESSAGES = {
	'zh-cn': pickShellMessages('zh-cn'),
	en: pickShellMessages('en')
} as const;
