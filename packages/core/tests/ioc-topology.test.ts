import { describe, it, expect, vi } from 'vite-plus/test';
import { ChronosEngine } from '../src/runtime/engine';
import { createServiceIdentifier } from '../src/types/services';
import type { ChronosPlugin } from '../src/types/context';

interface ICustomAuthService {
	login(token: string): Promise<boolean>;
}

const ICustomAuthService = createServiceIdentifier<ICustomAuthService>('service:custom-auth');

function createTestEnv() {
	return {
		platform: 'web' as const,
		http: { request: vi.fn() },
		storage: {
			getTimetable: vi.fn().mockResolvedValue(null),
			listTimetables: vi.fn().mockResolvedValue([]),
			saveTimetable: vi.fn().mockResolvedValue(undefined),
			deleteTimetable: vi.fn().mockResolvedValue(undefined),
			getActiveTimetableId: vi.fn().mockResolvedValue(null),
			setActiveTimetableId: vi.fn().mockResolvedValue(undefined),
			queryCourses: vi.fn().mockResolvedValue([]),
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
			sha256: async () => ''
		}
	};
}

describe('Single-track plugin activation', () => {
	it('activates plugin immediately via apply and exposes ctx.service', async () => {
		const engine = new ChronosEngine({ env: createTestEnv() });
		const applyHook = vi.fn((ctx) => {
			expect(() => ctx.service(ICustomAuthService)).toThrow();
		});

		const testPlugin: ChronosPlugin = {
			id: 'immediate-plugin',
			name: 'Immediate',
			version: '1.0.0',
			apply: applyHook
		};

		await engine.loadPlugin(testPlugin);

		expect(engine.isPluginLoaded('immediate-plugin')).toBe(true);
		expect(applyHook).toHaveBeenCalledTimes(1);

		engine.dispose();
	});
});
