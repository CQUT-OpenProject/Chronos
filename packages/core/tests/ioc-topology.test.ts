import { describe, it, expect, vi } from 'vite-plus/test';
import { ChronosEngine } from '../src/runtime/engine';
import { ServiceContainer } from '../src/runtime/service-container';
import { createServiceIdentifier, IHttpService } from '../src/types/services';
import type { ChronosPlugin } from '../src/types/context';
import type { Timetable } from '../src/domain/timetable';

interface ICustomAuthService {
	login(token: string): Promise<boolean>;
}

const ICustomAuthService = createServiceIdentifier<ICustomAuthService>('service:custom-auth');

describe('IoC Topological Activation and Lifecycle', () => {
	it('delays plugin activation until all inject dependencies are satisfied', async () => {
		const services = new ServiceContainer();
		const engine = new ChronosEngine({
			services,
			env: {
				platform: 'web',
				http: {
					request: vi.fn()
				},
				storage: {
					getTimetable: vi.fn().mockResolvedValue(null),
					listTimetables: vi.fn().mockResolvedValue([]),
					saveTimetable: vi.fn().mockResolvedValue(undefined),
					patchTimetable: vi.fn().mockResolvedValue(undefined),
					deleteTimetable: vi.fn().mockResolvedValue(undefined),
					getActiveTimetableId: vi.fn().mockResolvedValue(null),
					setActiveTimetableId: vi.fn().mockResolvedValue(undefined),
					getPreferences: vi.fn().mockResolvedValue({}),
					savePreferences: vi.fn().mockResolvedValue(undefined),
					getPluginData: vi.fn().mockResolvedValue(null),
					setPluginData: vi.fn().mockResolvedValue(undefined),
					deletePluginData: vi.fn().mockResolvedValue(undefined)
				},
				vault: {
					isSupported: async () => false,
					storeSecret: vi.fn(),
					getSecret: vi.fn(),
					removeSecret: vi.fn()
				},
				runtime: {
					setTimeout: (h, ms) => setTimeout(h, ms) as unknown as number,
					clearTimeout: (h) => clearTimeout(h),
					sha256: async () => '',
					encodeUtf8: (s) => new TextEncoder().encode(s),
					decodeUtf8: (b) => new TextDecoder().decode(b)
				}
			}
		});

		const applyHook = vi.fn();
		const testPlugin: ChronosPlugin = {
			id: 'auth-dependent-plugin',
			name: 'Auth Dependent',
			version: '1.0.0',
			inject: [IHttpService, ICustomAuthService],
			apply: applyHook
		};

		// 1. Load plugin when ICustomAuthService is not yet registered (IHttpService is registered via env)
		await engine.loadPlugin(testPlugin);

		expect(engine.isPluginPending('auth-dependent-plugin')).toBe(true);
		expect(engine.isPluginLoaded('auth-dependent-plugin')).toBe(false);
		expect(applyHook).not.toHaveBeenCalled();

		// 2. Register ICustomAuthService into services
		const mockAuth: ICustomAuthService = {
			login: vi.fn().mockResolvedValue(true)
		};
		const authHandle = services.register(ICustomAuthService, mockAuth);
		await new Promise((resolve) => setTimeout(resolve, 10));

		// Now plugin should be automatically activated
		expect(engine.isPluginPending('auth-dependent-plugin')).toBe(false);
		expect(engine.isPluginLoaded('auth-dependent-plugin')).toBe(true);
		expect(applyHook).toHaveBeenCalledTimes(1);

		// 3. Unregister ICustomAuthService -> plugin should be deactivated and moved to pending
		authHandle.dispose();
		await new Promise((resolve) => setTimeout(resolve, 10));
		expect(engine.isPluginPending('auth-dependent-plugin')).toBe(true);
		expect(engine.isPluginLoaded('auth-dependent-plugin')).toBe(false);

		engine.dispose();
	});
});
