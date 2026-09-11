import { DEFAULT_USER_PREFERENCES } from '../../domain/preferences';
import type { Timetable } from '../../domain/timetable';
import type { StorageChangeEvent } from '../../types/env';
import type { Disposable } from '../../types/services';
import type { EngineActionHost, TimetableListEntry } from './engine-action-host';
import type { EngineTimeKeeper } from './engine-time-keeper';

/** Hydrates engine state from storage and handles cross-tab sync events. */
export class StorageSyncHandler {
	private listGeneration = 0;
	private listHydrated = false;
	private disposed = false;

	constructor(
		private readonly host: EngineActionHost,
		private readonly timeKeeper: EngineTimeKeeper
	) {}

	dispose(): void {
		this.disposed = true;
		this.listGeneration += 1;
	}

	async hydrate(): Promise<Disposable | undefined> {
		const storage = this.host.storage;
		const generation = ++this.listGeneration;
		this.listHydrated = false;

		const [prefs, storedActiveId] = await Promise.all([
			storage.getPreferences(),
			storage.getActiveTimetableId()
		]);
		this.host.setUserPreferences(prefs);

		const listPromise = storage.listTimetables();
		void listPromise.then(
			(list) => {
				this.applyTimetableList(list, generation);
			},
			() => {}
		);

		let activeId = storedActiveId;
		let current = activeId ? await storage.getTimetable(activeId) : null;

		if (!current) {
			const list = await listPromise;
			if (!this.applyTimetableList(list, generation)) {
				return this.subscribeIfActive(storage);
			}
			if (list.length > 0 && list[0]) {
				activeId = list[0].id;
				await storage.setActiveTimetableId(activeId);
				current = await storage.getTimetable(activeId);
			}
		}

		if (current) {
			this.host.setCurrentTimetable(current);
		}

		this.timeKeeper.updateTime();
		this.timeKeeper.start();

		if (current) {
			await this.host.badges.recalculate(current.courses);
			this.host.emit('timetable:loaded', { timetable: current });
		}
		this.host.emit('preferences:updated', { preferences: this.host.getUserPreferences() });

		return this.subscribeIfActive(storage);
	}

	async handleChange(event: StorageChangeEvent): Promise<void> {
		const storage = this.host.storage;
		if (event.type === 'preferences') {
			this.host.setUserPreferences(await storage.getPreferences());
			this.host.emit('preferences:updated', { preferences: this.host.getUserPreferences() });
		} else if (event.type === 'timetable') {
			await this.host.refreshTimetables();
			this.listHydrated = true;
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
			} else if (this.listHydrated && this.host.getTimetables().length === 0) {
				this.host.setCurrentTimetable(null);
				this.host.emit('timetable:updated', { timetable: null as unknown as Timetable });
			}
		}
	}

	async clearAllData(): Promise<void> {
		this.listGeneration += 1;
		this.listHydrated = true;
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

	private applyTimetableList(list: TimetableListEntry[], generation: number): boolean {
		if (this.disposed || generation !== this.listGeneration) return false;
		this.host.setTimetables(list);
		this.listHydrated = true;
		this.host.emit('timetables:updated', { timetables: list });
		return true;
	}

	private subscribeIfActive(storage: EngineActionHost['storage']): Disposable | undefined {
		if (this.disposed) return undefined;
		if (storage.onChanged) {
			return storage.onChanged((event) => this.handleChange(event));
		}
		return undefined;
	}
}
