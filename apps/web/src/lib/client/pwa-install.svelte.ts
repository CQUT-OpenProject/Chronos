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
const APPINSTALLED_DEDUP_MS = 2000;

function safeSetItem(key: string, value: string): void {
	try {
		localStorage.setItem(key, value);
	} catch {
		// private mode / storage denied: install flag stays in-memory only
	}
}

function safeGetItem(key: string): string | null {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

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
	private displayModeListenerAttached = false;
	private installPromptGate: (() => boolean) | null = null;
	private dialogScheduled = false;
	private dialogTimer: ReturnType<typeof setTimeout> | null = null;
	private environmentRecheckTimers: ReturnType<typeof setTimeout>[] = [];
	private lastAppInstalledAt = 0;
	private displayModeCleanups: (() => void)[] = [];
	private appInstalledHandler: (() => void) | null = null;

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
			safeSetItem(INSTALLED_KEY, '1');
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
			const onChange = () => this.checkEnvironment();
			mq.addEventListener('change', onChange);
			this.displayModeCleanups.push(() => mq.removeEventListener('change', onChange));
		}
	}

	/** Detaches display-mode listeners and timers (teardown / tests). */
	dispose() {
		for (const cleanup of this.displayModeCleanups) {
			try {
				cleanup();
			} catch {
				// ignore
			}
		}
		this.displayModeCleanups = [];
		this.displayModeListenerAttached = false;
		if (this.appInstalledHandler && typeof window !== 'undefined') {
			window.removeEventListener('appinstalled', this.appInstalledHandler);
			this.appInstalledHandler = null;
		}
		this.installListenerAttached = false;
		this.cancelScheduledDialog();
		for (const timer of this.environmentRecheckTimers) {
			clearTimeout(timer);
		}
		this.environmentRecheckTimers = [];
	}

	/** @internal Resets mutable state between unit tests. */
	resetForTesting() {
		this.deferredPrompt = null;
		this.installDialogOpen = false;
		this.openInAppDialogOpen = false;
		this.iosGuideOpen = false;
		this.isStandalone = false;
		this.isInstalledLocally = false;
		this.isIOS = false;
		this.isMacSafari = false;
		this.installPromptGate = null;
		this.dialogScheduled = false;
		this.lastAppInstalledAt = 0;
		if (this.dialogTimer) {
			clearTimeout(this.dialogTimer);
			this.dialogTimer = null;
		}
		for (const timer of this.environmentRecheckTimers) {
			clearTimeout(timer);
		}
		this.environmentRecheckTimers = [];
		if (typeof window !== 'undefined') {
			window.__chronosInstallPrompt = null;
		}
	}

	private attachInstallListener() {
		if (this.installListenerAttached) return;
		this.installListenerAttached = true;

		const onBeforeInstall = (event: Event) => {
			// app.html already captured + preventDefault() at parse time;
			// second preventDefault() here is a harmless no-op that keeps
			// late-attached listeners eligible for the deferred prompt.
			event.preventDefault();
			const prompt = event as BeforeInstallPromptEvent;
			window.__chronosInstallPrompt = prompt;
			this.deferredPrompt = prompt;
			this.tryScheduleInstallDialog();
		};

		this.appInstalledHandler = () => this.onAppInstalled();
		window.addEventListener('beforeinstallprompt', onBeforeInstall);
		window.addEventListener('appinstalled', this.appInstalledHandler);
	}

	private markInstalled() {
		safeSetItem(INSTALLED_KEY, '1');
		this.isInstalledLocally = true;
	}

	/** Clears install-related local flags (e.g. on full data wipe). */
	resetInstalledFlag() {
		this.isInstalledLocally = false;
		try {
			localStorage.removeItem(INSTALLED_KEY);
		} catch {
			// ignore
		}
	}

	private clearDeferredPrompt() {
		this.deferredPrompt = null;
		window.__chronosInstallPrompt = null;
	}

	private onAppInstalled() {
		const now = Date.now();
		if (now - this.lastAppInstalledAt < APPINSTALLED_DEDUP_MS) return;
		this.lastAppInstalledAt = now;

		this.markInstalled();
		this.clearDeferredPrompt();
		this.checkEnvironment();

		if (this.isStandalone) return;

		this.scheduleEnvironmentRecheck();
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

	private async detectInstalledLocally() {
		if (this.isStandalone) return;

		// NOTE: getInstalledRelatedApps() is intentionally unused: it only
		// resolves entries declared in manifest `related_applications`,
		// which Chronos does not ship, so it would always return [].
		if (safeGetItem(INSTALLED_KEY) === '1') {
			this.isInstalledLocally = true;
		}
	}

	private readSnoozedUntil(): number | null {
		if (typeof localStorage === 'undefined') return null;
		return parseSnoozedUntil(safeGetItem(SNOOZE_KEY));
	}

	private isSnoozed(): boolean {
		return isInstallPromptSnoozed(this.readSnoozedUntil());
	}

	/** Whether the current browser can show a meaningful install entry. */
	canShowInstallEntry(): boolean {
		return this.canPrompt || this.isIOS || this.isMacSafari || this.isInstalledLocally;
	}

	private scheduleDialog() {
		if (this.dialogScheduled || this.isStandalone || this.isSnoozed()) return;
		// Unsupported browsers (e.g. Firefox desktop) have no install entry:
		// skip the auto-popup, the static /about/install page stays available.
		// Once beforeinstallprompt arrives, canPrompt becomes true and the
		// onBeforeInstall -> tryScheduleInstallDialog path schedules again.
		if (!this.canShowInstallEntry()) return;
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
		const prompt = this.deferredPrompt;
		if (!prompt) return false;

		// BeforeInstallPromptEvent is single-use: always clear, even on
		// dismiss/error, and wait for the next beforeinstallprompt to re-arm.
		try {
			await prompt.prompt();
			const choice = await prompt.userChoice;
			if (choice.outcome === 'accepted') {
				trackEvent('pwa_install_accept');
				this.installDialogOpen = false;
				return true;
			}
			trackEvent('pwa_install_dismiss');
			return false;
		} catch {
			return false;
		} finally {
			this.clearDeferredPrompt();
		}
	}

	openInApp() {
		// No window.open: the installed PWA cannot be focused from a browser
		// tab via script (same-URL _blank only opens another browser tab and
		// loses transient activation after awaits). Guide the user to launch
		// from the OS surface instead.
		this.openInAppDialogOpen = false;
		snackbarKey('pwa.openInApp.hint');
	}

	snoozeInstallPrompt() {
		trackEvent('pwa_install_snooze');
		safeSetItem(SNOOZE_KEY, String(Date.now() + SNOOZE_DURATION_MS));
		this.installDialogOpen = false;
		this.iosGuideOpen = false;
		this.openInAppDialogOpen = false;
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
