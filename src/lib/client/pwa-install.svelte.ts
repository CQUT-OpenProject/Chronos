import { snackbar } from '$lib/components/ui/snackbar-state.svelte';
import { onboardingController } from './onboarding.svelte';

const INSTALLED_KEY = 'chronos:pwa-installed';
const OPEN_IN_APP_HINT = '如未自动跳转，请从程序坞、启动台或开始菜单手动打开 Chronos。';

export class PWAInstallController {
	deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);
	installDialogOpen = $state(false);
	openInAppDialogOpen = $state(false);
	iosGuideOpen = $state(false);
	isStandalone = $state(false);
	isInstalledLocally = $state(false);
	isIOS = $state(false);
	isMacSafari = $state(false);

	canPrompt = $derived(this.deferredPrompt !== null);

	private installListenerAttached = false;
	private dialogScheduled = false;
	private dialogTimer: ReturnType<typeof setTimeout> | null = null;

	constructor() {
		if (typeof window !== 'undefined') {
			this.checkEnvironment();
			this.restoreDeferredPrompt();
			this.attachInstallListener();
		}
	}

	private restoreDeferredPrompt() {
		const stored = window.__chronosInstallPrompt;
		if (!stored) return;

		this.deferredPrompt = stored;
	}

	checkEnvironment() {
		if (typeof window === 'undefined') return;

		this.isStandalone =
			window.matchMedia('(display-mode: standalone)').matches ||
			// @ts-expect-error iOS Safari
			window.navigator.standalone === true;

		if (this.isStandalone) {
			localStorage.setItem(INSTALLED_KEY, '1');
			this.isInstalledLocally = true;
		}

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

	private attachInstallListener() {
		if (this.installListenerAttached) return;
		this.installListenerAttached = true;

		const onBeforeInstall = (event: Event) => {
			event.preventDefault();
			const prompt = event as BeforeInstallPromptEvent;
			window.__chronosInstallPrompt = prompt;
			this.deferredPrompt = prompt;
			this.tryScheduleInstallDialog();
		};

		window.addEventListener('beforeinstallprompt', onBeforeInstall);
		window.addEventListener('appinstalled', () => {
			localStorage.setItem(INSTALLED_KEY, '1');
			this.isInstalledLocally = true;
		});
	}

	private async detectInstalledLocally() {
		if (this.isStandalone) return;

		if (localStorage.getItem(INSTALLED_KEY) === '1') {
			this.isInstalledLocally = true;
			return;
		}

		try {
			const getInstalled = (
				navigator as Navigator & { getInstalledRelatedApps?: () => Promise<unknown[]> }
			).getInstalledRelatedApps;
			if (!getInstalled) return;

			const apps = await getInstalled.call(navigator);
			if (apps.length > 0) {
				this.isInstalledLocally = true;
				localStorage.setItem(INSTALLED_KEY, '1');
			}
		} catch {
			// API unavailable or denied
		}
	}

	private scheduleDialog() {
		if (this.dialogScheduled || this.isStandalone) return;
		this.dialogScheduled = true;

		this.dialogTimer = setTimeout(() => {
			this.dialogTimer = null;
			if (this.isStandalone) return;

			if (onboardingController.open) {
				// Onboarding covers install guidance; finish() cancels any pending popup.
				this.dialogScheduled = false;
				return;
			}

			if (this.isInstalledLocally) {
				this.openInAppDialogOpen = true;
			} else if (this.isIOS) {
				this.iosGuideOpen = true;
			} else {
				this.installDialogOpen = true;
			}
		}, 3000);
	}

	tryScheduleInstallDialog() {
		if (this.isInstalledLocally) return;
		this.scheduleDialog();
	}

	/** Cancels a pending auto-popup, e.g. because onboarding already covered install guidance. */
	cancelScheduledDialog() {
		if (this.dialogTimer) {
			clearTimeout(this.dialogTimer);
			this.dialogTimer = null;
		}
		this.dialogScheduled = false;
	}

	async init() {
		if (typeof window === 'undefined') return;

		this.checkEnvironment();
		if (this.isStandalone) return;

		await this.detectInstalledLocally();

		if (this.isInstalledLocally) {
			this.scheduleDialog();
			return;
		}

		this.tryScheduleInstallDialog();
	}

	async install(): Promise<boolean> {
		if (!this.deferredPrompt) return false;

		await this.deferredPrompt.prompt();
		const choice = await this.deferredPrompt.userChoice;
		if (choice.outcome === 'accepted') {
			this.installDialogOpen = false;
			this.deferredPrompt = null;
			window.__chronosInstallPrompt = null;
			localStorage.setItem(INSTALLED_KEY, '1');
			this.isInstalledLocally = true;
			return true;
		}
		return false;
	}

	openInApp() {
		this.openInAppDialogOpen = false;
		const target = `${window.location.origin}${window.location.pathname}${window.location.search}`;
		window.open(target, '_blank', 'noopener,noreferrer');
		snackbar(OPEN_IN_APP_HINT);
	}

	dismiss() {
		this.installDialogOpen = false;
		this.openInAppDialogOpen = false;
		this.iosGuideOpen = false;
	}
}

export const pwaInstallController = new PWAInstallController();
