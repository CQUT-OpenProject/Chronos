import { DEFAULT_USER_PREFERENCES } from '../../domain/preferences';
import type { Timetable } from '../../domain/timetable';
import type { StorageChangeEvent } from '../../types/env';
import type { Disposable } from '../../types/services';
import type { EngineActionHost } from './engine-action-host';
import type { EngineTimeKeeper } from './engine-time-keeper';

/** Hydrates engine state from storage and handles cross-tab sync events. */
export class StorageSyncHandler {
	constructor(
		private readonly host: EngineActionHost,
		private readonly timeKeeper: EngineTimeKeeper,
		private readonly onLocaleHydrated: (locale: string) => void
	) {}

	async hydrate(): Promise<Disposable | undefined> {
		const storage = this.host.storage;
		this.host.setUserPreferences(await storage.getPreferences());
		this.host.setTimetables(await storage.listTimetables());

		let activeId = await storage.getActiveTimetableId();
		if (!activeId) {
			const timetables = this.host.getTimetables();
			if (timetables.length > 0 && timetables[0]) {
				activeId = timetables[0].id;
				await storage.setActiveTimetableId(activeId);
			}
		}

		if (activeId) {
			this.host.setCurrentTimetable(await storage.getTimetable(activeId));
		}

		this.timeKeeper.updateTime();
		this.timeKeeper.start();

		const savedLocale = this.host.getUserPreferences().locale;
		if (savedLocale && savedLocale !== this.host.getLocale()) {
			this.onLocaleHydrated(savedLocale);
		}

		const current = this.host.getCurrentTimetable();
		if (current) {
			await this.host.badges.recalculate(current.courses);
			this.host.emit('timetable:loaded', { timetable: current });
		}
		this.host.emit('timetables:updated', { timetables: this.host.getTimetables() });
		this.host.emit('preferences:updated', { preferences: this.host.getUserPreferences() });

		if (storage.onChanged) {
			return storage.onChanged((event) => this.handleChange(event));
		}
		return undefined;
	}

	async handleChange(event: StorageChangeEvent): Promise<void> {
		const storage = this.host.storage;
		if (event.type === 'preferences') {
			this.host.setUserPreferences(await storage.getPreferences());
			this.host.emit('preferences:updated', { preferences: this.host.getUserPreferences() });
		} else if (event.type === 'timetable') {
			await this.host.refreshTimetables();
			const activeId = await storage.getActiveTimetableId();
			if (activeId) {
				const updated = await storage.getTimetable(activeId);
				if (updated) {
					this.host.setCurrentTimetable(updated);
					this.timeKeeper.updateTime();
					this.timeKeeper.reschedule();
					await this.host.badges.recalculate(updated.courses);
					this.host.emit('timetable:updated', { timetable: updated });
				}
			} else if (this.host.getTimetables().length === 0) {
				this.host.setCurrentTimetable(null);
				this.host.emit('timetable:updated', { timetable: null as unknown as Timetable });
			}
		}
	}

	async clearAllData(): Promise<void> {
		const storage = this.host.storage;
		if (storage.clearAllData) {
			await storage.clearAllData();
		} else {
			const list = await storage.listTimetables();
			for (const t of list) {
				await storage.deleteTimetable(t.id);
			}
			await storage.setActiveTimetableId('');
		}
		this.host.setCurrentTimetable(null);
		this.host.setTimetables([]);
		this.host.setUserPreferences({ ...DEFAULT_USER_PREFERENCES });
		this.host.emit('timetables:updated', { timetables: [] });
		this.host.emit('timetable:updated', { timetable: null as unknown as Timetable });
		this.host.emit('preferences:updated', { preferences: this.host.getUserPreferences() });
	}
}
