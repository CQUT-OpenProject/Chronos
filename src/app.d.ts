/// <reference types="vite/client" />

interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

interface Window {
	__chronosInstallPrompt?: BeforeInstallPromptEvent | null;
	__chronosHideBootFallback?: () => void;
	__chronosAppMounted?: boolean;
}

declare module 'virtual:pwa-info' {
	export interface PwaInfo {
		pwaInDevEnvironment: boolean;
		webManifest: {
			href: string;
			useCredentials: boolean;
			linkTag: string;
		};
		registerSW?: {
			inline: boolean;
			mode: 'inline' | 'script' | 'script-defer';
			inlinePath: string;
			registerPath: string;
			scope: string;
			type: 'classic' | 'module';
			scriptTag?: string;
		};
	}

	export const pwaInfo: PwaInfo | undefined;
}

declare module 'virtual:pwa-register' {
	export interface RegisterSWOptions {
		immediate?: boolean;
		onNeedRefresh?: () => void;
		onOfflineReady?: () => void;
		onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
		onRegisteredSW?: (
			swScriptUrl: string,
			registration: ServiceWorkerRegistration | undefined
		) => void;
		onRegisterError?: (error: unknown) => void;
	}

	export function registerSW(options?: RegisterSWOptions): (reloadPage?: boolean) => Promise<void>;
}

declare const __BUILD_TIME__: string;
