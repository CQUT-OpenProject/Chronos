import { trackEvent } from '$lib/client/analytics';
import { snackbarKey } from '$lib/components/ui/snackbar-state.svelte';
const INSTALLED_DISPLAY_MODES = ['standalone', 'fullscreen', 'minimal-ui'] as const;

export function isPwaStandalone(): boolean {
	if (typeof window === 'undefined') return false;
	// @ts-expect-error iOS Safari
	if (window.navigator.standalone === true) return true;
	return INSTALLED_DISPLAY_MODES.some(
		(mode) => window.matchMedia(`(display-mode: ${mode})`).matches
	);
}

export const PWA_DISPLAY_MODE_MEDIA_QUERIES = [...INSTALLED_DISPLAY_MODES, 'browser'] as const;

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

export const SNOOZE_KEY = 'chronos:pwa-install-snoozed-until';
export const SNOOZE_DURATION_MS = 3 * 24 * 60 * 60 * 1000;

export function parseSnoozedUntil(raw: string | null): number | null {
	if (!raw) return null;
	const parsed = Number(raw);
	return Number.isFinite(parsed) ? parsed : null;
}

export function isInstallPromptSnoozed(snoozedUntil: number | null, now = Date.now()): boolean {
	return snoozedUntil !== null && now < snoozedUntil;
}

export const APPINSTALLED_DEDUP_MS = 2000;

export interface InstallPromptLifecycleCallbacks {
	onBeforeInstall: (prompt: BeforeInstallPromptEvent) => void;
	onAppInstalled: () => void;
}

export function attachInstallPromptLifecycle(
	window: Window,
	callbacks: InstallPromptLifecycleCallbacks
): () => void {
	const onBeforeInstall = (event: Event) => {
		event.preventDefault();
		callbacks.onBeforeInstall(event as BeforeInstallPromptEvent);
	};

	const onAppInstalled = () => {
		callbacks.onAppInstalled();
	};

	window.addEventListener('beforeinstallprompt', onBeforeInstall);
	window.addEventListener('appinstalled', onAppInstalled);

	return () => {
		window.removeEventListener('beforeinstallprompt', onBeforeInstall);
		window.removeEventListener('appinstalled', onAppInstalled);
	};
}

export function scheduleEnvironmentRecheck(
	onRecheck: () => void,
	delays: number[] = [100, 500, 1000]
): () => void {
	const timers = delays.map((delay) => setTimeout(onRecheck, delay));
	return () => {
		for (const timer of timers) {
			clearTimeout(timer);
		}
	};
}

export function restoreStoredInstallPrompt(window: Window): BeforeInstallPromptEvent | null {
	return window.__chronosInstallPrompt ?? null;
}

export function storeInstallPrompt(window: Window, prompt: BeforeInstallPromptEvent | null): void {
	window.__chronosInstallPrompt = prompt;
}

const INSTALLED_KEY = 'chronos:pwa-installed';

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
	private deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);
	installDialogOpen = $state(false);
	openInAppDialogOpen = $state(false);
	iosGuideOpen = $state(false);
	isStandalone = $state(false);
	isInstalledLocally = $state(false);
	isIOS = $state(false);
	isMacSafari = $state(false);

	canPrompt = $derived(this.deferredPrompt !== null);

	private installLifecycleCleanup: (() => void) | null = null;
	private displayModeListenerAttached = false;
	private installPromptGate: (() => boolean) | null = null;
	private dialogScheduled = false;
	private dialogTimer: ReturnType<typeof setTimeout> | null = null;
	private environmentRecheckCleanup: (() => void) | null = null;
	private lastAppInstalledAt = 0;
	private displayModeCleanups: (() => void)[] = [];

	constructor() {
		if (typeof window !== 'undefined') {
			this.checkEnvironment();
			this.deferredPrompt = restoreStoredInstallPrompt(window);
			this.attachInstallListener();
			this.attachDisplayModeListener();
		}
	}

	checkEnvironment() {
		if (typeof window === 'undefined') return;

		const flags = readPwaEnvironmentFromWindow(window);
		this.isStandalone = flags.isStandalone;
		this.isIOS = flags.isIOS;
		this.isMacSafari = flags.isMacSafari;

		if (this.isStandalone) {
			safeSetItem(INSTALLED_KEY, '1');
			this.isInstalledLocally = true;
		}
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
		this.installLifecycleCleanup?.();
		this.installLifecycleCleanup = null;
		this.cancelScheduledDialog();
		this.environmentRecheckCleanup?.();
		this.environmentRecheckCleanup = null;
	}

	private attachInstallListener() {
		if (this.installLifecycleCleanup || typeof window === 'undefined') return;

		this.installLifecycleCleanup = attachInstallPromptLifecycle(window, {
			onBeforeInstall: (prompt) => {
				storeInstallPrompt(window, prompt);
				this.deferredPrompt = prompt;
				this.tryScheduleInstallDialog();
			},
			onAppInstalled: () => this.onAppInstalled()
		});
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
		if (typeof window !== 'undefined') {
			storeInstallPrompt(window, null);
		}
	}

	private onAppInstalled() {
		const now = Date.now();
		if (now - this.lastAppInstalledAt < APPINSTALLED_DEDUP_MS) return;
		this.lastAppInstalledAt = now;

		this.markInstalled();
		this.clearDeferredPrompt();
		this.checkEnvironment();

		if (this.isStandalone) return;

		this.environmentRecheckCleanup?.();
		this.environmentRecheckCleanup = scheduleEnvironmentRecheck(() => this.checkEnvironment());
	}

	private async detectInstalledLocally() {
		if (this.isStandalone) return;

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
