import { PLUGIN_CONFIG_STORAGE_KEY } from '../constants/plugin-storage';
import type { Disposable, ServiceIdentifier } from '../types/services';
import { IStorageService } from '../types/services';
import type { ChronosContext, ChronosEvents } from '../types/context';
import type { ChronosSlotMap } from '../types/slots';
import type { ThemeContribution } from '../types/contributions';
import type { IconThemeContribution } from '../theme/icon-theme';
import type { CourseBadgeSlotContribution } from '../types/slots';
import type { EngineContextHost } from './engine-context-host';
import { createPluginI18n, createPluginStorage } from './plugin-context-factories';

export type { EngineContextHost } from './engine-context-host';

type SlotRegistrar = (
	host: EngineContextHost,
	contribution: ChronosSlotMap[keyof ChronosSlotMap],
	ctx: ScopedContext<Record<string, unknown>>
) => Disposable;

const SLOT_REGISTRARS: Partial<Record<keyof ChronosSlotMap, SlotRegistrar>> = {
	'theme.definition': (host, contribution) =>
		host.themes!.registerTheme(contribution as unknown as ThemeContribution),
	'theme.icon.definition': (host, contribution) =>
		host.iconThemes!.registerIconTheme(contribution as unknown as IconThemeContribution),
	'timetable.cell.badge': (host, contribution, ctx) =>
		host.badges!.registerCourseBadge(contribution as unknown as CourseBadgeSlotContribution, ctx)
};

export class ScopedContext<Config extends object = Record<string, unknown>>
	implements ChronosContext<Config>, Disposable
{
	readonly subscriptions: Disposable[] = [];
	private _config: Config;

	readonly storage: ReturnType<typeof createPluginStorage>;
	readonly i18n: ReturnType<typeof createPluginI18n>;

	constructor(
		readonly pluginId: string,
		private host: EngineContextHost,
		initialConfig?: Config
	) {
		this._config = (initialConfig ?? {}) as Config;

		this.storage = createPluginStorage(this.pluginId, () =>
			this.host.services.get(IStorageService)
		);
		this.i18n = createPluginI18n(this.pluginId, this.host, (disposable) => {
			this.subscriptions.push(disposable);
		});
	}

	get config(): Readonly<Config> {
		return this._config;
	}

	async updateConfig(patch: Partial<Config>): Promise<void> {
		this._config = {
			...this._config,
			...patch
		};
		await this.storage.set(PLUGIN_CONFIG_STORAGE_KEY, this._config);
		this.host.events.emit('config:changed', {
			pluginId: this.pluginId,
			config: this._config as Record<string, unknown>
		});
	}

	service<T>(identifier: ServiceIdentifier<T>): T {
		return this.host.services.get(identifier);
	}

	tryService<T>(identifier: ServiceIdentifier<T>): T | undefined {
		return this.host.services.tryGet(identifier);
	}

	get state() {
		return this.host.state;
	}

	get actions() {
		return this.host.actions;
	}

	private track<T extends Disposable>(disposable: T): T {
		this.subscriptions.push(disposable);
		return {
			dispose: () => {
				const index = this.subscriptions.indexOf(disposable);
				if (index >= 0) {
					this.subscriptions.splice(index, 1);
				}
				disposable.dispose();
			}
		} as T;
	}

	addDisposable(disposable: Disposable): void {
		this.subscriptions.push(disposable);
	}

	registerSlot<K extends keyof ChronosSlotMap>(
		slotName: K,
		contribution: ChronosSlotMap[K] & { id: string }
	): Disposable {
		const slotDisp = this.host.slots.register(slotName, contribution, this.pluginId);
		const extraRegistrar = SLOT_REGISTRARS[slotName];

		if (extraRegistrar) {
			const extraDisp = extraRegistrar(
				this.host,
				contribution,
				this as ScopedContext<Record<string, unknown>>
			);
			return this.track({
				dispose: () => {
					extraDisp.dispose();
					slotDisp.dispose();
				}
			});
		}

		return this.track(slotDisp);
	}

	on<E extends keyof ChronosEvents>(
		event: E,
		handler: (payload: ChronosEvents[E]) => void | Promise<void>
	): Disposable {
		return this.track(this.host.events.on(event, handler));
	}

	emit<E extends keyof ChronosEvents>(event: E, payload: ChronosEvents[E]): void {
		this.host.events.emit(event, payload);
	}

	dispose(): void {
		for (let i = this.subscriptions.length - 1; i >= 0; i--) {
			const sub = this.subscriptions[i];
			if (sub) {
				try {
					sub.dispose();
				} catch (error) {
					console.error(
						`[ScopedContext] Error disposing subscription in "${this.pluginId}":`,
						error
					);
				}
			}
		}
		this.subscriptions.length = 0;
	}
}
