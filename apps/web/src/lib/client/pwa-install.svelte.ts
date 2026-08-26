import { trackEvent } from '$lib/client/analytics';
import { snackbarKey } from '$lib/components/ui/snackbar-state.svelte';
import {
	isInstallPromptSnoozed,
	parseSnoozedUntil,
	SNOOZE_DURATION_MS,
	SNOOZE_KEY
} from './pwa-install-snooze';
import { isPwaStandalone, PWA_DISPLAY_MODE_MEDIA_QUERIES } from './pwa-standalone';

const INSTALLED_KEY = 'chronos:pwa-installed';

class PWAInstallController {
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
	private displayModeListenerAttached = false;
	private installPromptGate: (() => boolean) | null = null;
	private dialogScheduled = false;
	private dialogTimer: ReturnType<typeof setTimeout> | null = null;
	private environmentRecheckTimers: ReturnType<typeof setTimeout>[] = [];

	constructor() {
		if (typeof window !== 'undefined') {
			this.checkEnvironment();
			this.restoreDeferredPrompt();
			this.attachInstallListener();
			this.attachDisplayModeListener();
		}
	}

	private restoreDeferredPrompt() {
		const stored = window.__chronosInstallPrompt;
		if (!stored) return;

		this.deferredPrompt = stored;
	}

	checkEnvironment() {
		if (typeof window === 'undefined') return;

		this.isStandalone = isPwaStandalone();

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

	private attachDisplayModeListener() {
		if (this.displayModeListenerAttached || typeof window === 'undefined') return;
		this.displayModeListenerAttached = true;

		for (const mode of PWA_DISPLAY_MODE_MEDIA_QUERIES) {
			const mq = window.matchMedia(`(display-mode: ${mode})`);
			mq.addEventListener('change', () => this.checkEnvironment());
		}
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
		window.addEventListener('appinstalled', () => this.onAppInstalled());
	}

	private markInstalled() {
		localStorage.setItem(INSTALLED_KEY, '1');
		this.isInstalledLocally = true;
	}

	private clearDeferredPrompt() {
		this.deferredPrompt = null;
		window.__chronosInstallPrompt = null;
	}

	private scheduleEnvironmentRecheck() {
		for (const timer of this.environmentRecheckTimers) {
			clearTimeout(timer);
		}
		this.environmentRecheckTimers = [];

		for (const delay of [100, 500, 1000]) {
			const timer = setTimeout(() => {
				this.checkEnvironment();
			}, delay);
			this.environmentRecheckTimers.push(timer);
		}
	}

	private getAppUrl() {
		return `${window.location.origin}${window.location.pathname}${window.location.search}`;
	}

	/** Chromium may route this to the installed app window instead of a browser tab. */
	private tryFocusInstalledAppWindow() {
		window.open(this.getAppUrl(), '_blank', 'noopener,noreferrer');
	}

	private onAppInstalled() {
		this.markInstalled();
		this.checkEnvironment();

		if (this.isStandalone) return;

		this.scheduleEnvironmentRecheck();

		if (!this.shouldDeferInstallPrompt()) {
			this.tryFocusInstalledAppWindow();
		}
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

	private readSnoozedUntil(): number | null {
		if (typeof localStorage === 'undefined') return null;
		return parseSnoozedUntil(localStorage.getItem(SNOOZE_KEY));
	}

	private isSnoozed(): boolean {
		return isInstallPromptSnoozed(this.readSnoozedUntil());
	}

	private scheduleDialog() {
		if (this.dialogScheduled || this.isStandalone || this.isSnoozed()) return;
		this.dialogScheduled = true;

		this.dialogTimer = setTimeout(() => {
			this.dialogTimer = null;
			if (this.isStandalone) return;

			if (this.shouldDeferInstallPrompt()) {
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
			trackEvent('pwa_install_prompt_show');
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

	setInstallPromptGate(gate: () => boolean) {
		this.installPromptGate = gate;
	}

	private shouldDeferInstallPrompt(): boolean {
		return this.installPromptGate?.() ?? false;
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
			trackEvent('pwa_install_accept');
			this.installDialogOpen = false;
			this.clearDeferredPrompt();
			this.onAppInstalled();
			return true;
		}
		return false;
	}

	openInApp() {
		this.openInAppDialogOpen = false;
		this.tryFocusInstalledAppWindow();
		snackbarKey('pwa.openInApp.hint');
	}

	snoozeInstallPrompt() {
		trackEvent('pwa_install_snooze');
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DURATION_MS));
		}
		this.installDialogOpen = false;
	}

	dismiss({ track = true }: { track?: boolean } = {}) {
		if (track) {
			trackEvent('pwa_install_dismiss');
		}
		this.installDialogOpen = false;
		this.openInAppDialogOpen = false;
		this.iosGuideOpen = false;
	}
}

export const pwaInstallController = new PWAInstallController();
