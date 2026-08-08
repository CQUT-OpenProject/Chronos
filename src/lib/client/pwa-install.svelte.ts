const SNOOZE_KEY = 'chronos:pwa-install-snooze';
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

export class PWAInstallController {
	deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);
	installDialogOpen = $state(false);
	iosGuideOpen = $state(false);
	isStandalone = $state(false);
	isIOS = $state(false);
	isMacSafari = $state(false);

	canPrompt = $derived(this.deferredPrompt !== null);

	constructor() {
		if (typeof window !== 'undefined') {
			this.checkEnvironment();
		}
	}

	checkEnvironment() {
		if (typeof window === 'undefined') return;

		this.isStandalone =
			window.matchMedia('(display-mode: standalone)').matches ||
			// @ts-expect-error iOS Safari
			window.navigator.standalone === true;

		const ua = window.navigator.userAgent;
		const navData = window.navigator as unknown as {
			userAgentData?: { platform?: string; brands?: { brand: string }[] };
		};
		const platform = navData.userAgentData?.platform ?? '';

		// 1. Chromium check (Chrome, Edge, Opera, Brave)
		const hasChromiumBrands = navData.userAgentData?.brands?.some((b) =>
			/Chrome|Chromium|Microsoft Edge|Brave/.test(b.brand)
		);
		const isChromium =
			Boolean(hasChromiumBrands) ||
			(/Chrome|Chromium|Edg|OPR|Brave/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua));

		// 2. iOS / iPadOS check (Strict: Never true if Chromium or Android/Windows)
		const isAndroid = platform === 'Android' || /Android/.test(ua);
		const isWindows = platform === 'Windows' || /Windows/.test(ua);

		const isRealIOS = platform === 'iOS' || /iPhone|iPod|iPad/.test(ua);
		// iPadOS Safari reports Macintosh, but hasTouch is true. macOS Desktop has maxTouchPoints === 0.
		const isMacUA = platform === 'macOS' || /Macintosh/.test(ua);
		const hasTouch = window.navigator.maxTouchPoints > 0 || 'ontouchstart' in window;
		const isIPadOS = isMacUA && hasTouch && !isChromium && !isAndroid && !isWindows;

		this.isIOS = (isRealIOS || isIPadOS) && !isChromium && !isAndroid && !isWindows;

		// 3. macOS Safari check (Mac + Safari + NOT Chromium)
		const isMac = isMacUA && !this.isIOS && !isWindows && !isAndroid;
		const isSafari = /Safari/.test(ua) && !isChromium;
		this.isMacSafari = isMac && isSafari;
	}

	init() {
		if (typeof window === 'undefined') return;

		this.checkEnvironment();
		if (this.isStandalone) return;

		const onBeforeInstall = (event: Event) => {
			event.preventDefault();
			this.deferredPrompt = event as BeforeInstallPromptEvent;

			const snoozedUntil = Number(localStorage.getItem(SNOOZE_KEY) ?? '0');
			if (Date.now() >= snoozedUntil) {
				setTimeout(() => {
					if (!this.isStandalone && this.deferredPrompt) {
						this.installDialogOpen = true;
					}
				}, 3000);
			}
		};

		window.addEventListener('beforeinstallprompt', onBeforeInstall);
		return () => window.removeEventListener('beforeinstallprompt', onBeforeInstall);
	}

	async install(): Promise<boolean> {
		if (!this.deferredPrompt) return false;

		await this.deferredPrompt.prompt();
		const choice = await this.deferredPrompt.userChoice;
		if (choice.outcome === 'accepted') {
			this.installDialogOpen = false;
			this.deferredPrompt = null;
			return true;
		}
		return false;
	}

	dismiss() {
		localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_MS));
		this.installDialogOpen = false;
		this.iosGuideOpen = false;
	}
}

export const pwaInstallController = new PWAInstallController();
