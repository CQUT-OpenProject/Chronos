export const APPINSTALLED_DEDUP_MS = 2000;

export interface InstallPromptLifecycleCallbacks {
	onBeforeInstall: (prompt: BeforeInstallPromptEvent) => void;
	onAppInstalled: () => void;
}

/** Attaches beforeinstallprompt and appinstalled listeners. Returns a dispose function. */
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

/** Schedules repeated environment rechecks after appinstalled (display-mode may lag). */
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

/** Restores a deferred install prompt captured before the controller mounted. */
export function restoreStoredInstallPrompt(window: Window): BeforeInstallPromptEvent | null {
	return window.__chronosInstallPrompt ?? null;
}

export function storeInstallPrompt(window: Window, prompt: BeforeInstallPromptEvent | null): void {
	window.__chronosInstallPrompt = prompt;
}
