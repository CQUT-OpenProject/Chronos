import { trackEvent } from '$lib/client/analytics';
import { snackbarKey } from '$lib/components/ui/snackbar-state.svelte';
import {
	isInstallPromptSnoozed,
	parseSnoozedUntil,
	SNOOZE_DURATION_MS,
	SNOOZE_KEY
} from './pwa-install-snooze';
import { PWA_DISPLAY_MODE_MEDIA_QUERIES } from './pwa-standalone';
import { readPwaEnvironmentFromWindow } from './pwa-environment';
import {
	APPINSTALLED_DEDUP_MS,
	attachInstallPromptLifecycle,
	restoreStoredInstallPrompt,
	scheduleEnvironmentRecheck,
	storeInstallPrompt
} from './pwa-prompt-lifecycle';

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
	deferredPrompt = $state<BeforeInstallPromptEvent | null>(null);
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
		this.environmentRecheckCleanup?.();
		this.environmentRecheckCleanup = null;
		if (typeof window !== 'undefined') {
			storeInstallPrompt(window, null);
		}
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
