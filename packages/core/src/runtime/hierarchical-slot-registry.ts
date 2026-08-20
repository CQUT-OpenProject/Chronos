import type { Disposable } from '../types/services';
import type { StandardSlotMap } from '../types/slots';

export class HierarchicalSlotRegistry implements Disposable {
	private slots = new Map<string, Map<string, unknown>>();
	private listeners = new Set<() => void>();

	constructor(private onSlotsChangedCallback?: () => void) {}

	register<K extends keyof StandardSlotMap>(
		slotName: K,
		contribution: StandardSlotMap[K] & { id: string }
	): Disposable {
		const key = String(slotName);
		if (!this.slots.has(key)) {
			this.slots.set(key, new Map());
		}
		const group = this.slots.get(key)!;
		group.set(contribution.id, contribution);
		this.notify();

		return {
			dispose: () => {
				if (group.get(contribution.id) === contribution) {
					group.delete(contribution.id);
					this.notify();
				}
			}
		};
	}

	get<K extends keyof StandardSlotMap>(slotName: K): Array<StandardSlotMap[K]> {
		const group = this.slots.get(String(slotName));
		if (!group) return [];
		const list = Array.from(group.values()) as Array<StandardSlotMap[K] & { order?: number }>;
		return list.sort((a, b) => (a.order ?? 50) - (b.order ?? 50));
	}

	getSlotItem<K extends keyof StandardSlotMap>(
		slotName: K,
		id: string
	): StandardSlotMap[K] | undefined {
		return this.slots.get(String(slotName))?.get(id) as StandardSlotMap[K] | undefined;
	}

	onChanged(listener: () => void): Disposable {
		this.listeners.add(listener);
		return {
			dispose: () => {
				this.listeners.delete(listener);
			}
		};
	}

	clear(): void {
		this.slots.clear();
		this.notify();
	}

	private notify(): void {
		for (const listener of this.listeners) {
			try {
				listener();
			} catch (error) {
				console.error('[HierarchicalSlotRegistry] Error in listener:', error);
			}
		}
		this.onSlotsChangedCallback?.();
	}

	dispose(): void {
		this.slots.clear();
		this.listeners.clear();
	}
}
