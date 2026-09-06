import { isPwaStandalone } from './pwa-standalone';

export interface PwaEnvironmentFlags {
	isStandalone: boolean;
	isIOS: boolean;
	isMacSafari: boolean;
}

export interface PwaEnvironmentInput {
	userAgent: string;
	platform?: string;
	brands?: { brand: string }[];
	maxTouchPoints: number;
	hasTouchStart: boolean;
}

/** Detects PWA install UI environment flags from navigator signals. */
export function detectPwaEnvironment(
	input: PwaEnvironmentInput,
	standalone = isPwaStandalone()
): PwaEnvironmentFlags {
	const { userAgent: ua, platform = '', brands, maxTouchPoints, hasTouchStart } = input;

	const hasChromiumBrands = brands?.some((b) =>
		/Chrome|Chromium|Microsoft Edge|Brave/.test(b.brand)
	);
	const isChromium =
		Boolean(hasChromiumBrands) ||
		(/Chrome|Chromium|Edg|OPR|Brave/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua));

	const isAndroid = platform === 'Android' || /Android/.test(ua);
	const isWindows = platform === 'Windows' || /Windows/.test(ua);

	const isRealIOS = platform === 'iOS' || /iPhone|iPod|iPad/.test(ua);
	const isMacUA = platform === 'macOS' || /Macintosh/.test(ua);
	const hasTouch = maxTouchPoints > 0 || hasTouchStart;
	const isIPadOS = isMacUA && hasTouch && !isChromium && !isAndroid && !isWindows;

	const isIOS = (isRealIOS || isIPadOS) && !isChromium && !isAndroid && !isWindows;

	const isMac = isMacUA && !isIOS && !isWindows && !isAndroid;
	const isSafari = /Safari/.test(ua) && !isChromium;
	const isMacSafari = isMac && isSafari;

	return { isStandalone: standalone, isIOS, isMacSafari };
}

/** Reads navigator/window and returns PWA environment flags. */
export function readPwaEnvironmentFromWindow(win: Window): PwaEnvironmentFlags {
	const navData = win.navigator as Navigator & {
		userAgentData?: { platform?: string; brands?: { brand: string }[] };
	};

	return detectPwaEnvironment({
		userAgent: win.navigator.userAgent,
		platform: navData.userAgentData?.platform,
		brands: navData.userAgentData?.brands,
		maxTouchPoints: win.navigator.maxTouchPoints,
		hasTouchStart: 'ontouchstart' in win
	});
}
