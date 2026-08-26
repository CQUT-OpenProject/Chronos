import type { Disposable } from '../types/services';
import type { ChronosSlotMap } from '../types/slots';

export class HierarchicalSlotRegistry implements Disposable {
	private slots = new Map<string, Map<string, unknown>>();
	private owners = new Map<string, Map<string, string>>();

	constructor(private onSlotsChangedCallback?: () => void) {}

	register<K extends keyof ChronosSlotMap>(
		slotName: K,
		contribution: ChronosSlotMap[K] & { id: string },
		ownerPluginId?: string
	): Disposable {
		const key = String(slotName);
		if (!this.slots.has(key)) {
			this.slots.set(key, new Map());
		}
		const group = this.slots.get(key)!;
		const existingOwner = this.owners.get(key)?.get(contribution.id);
		if (existingOwner && ownerPluginId && existingOwner !== ownerPluginId) {
			console.warn(
				`[HierarchicalSlotRegistry] Slot "${key}/${contribution.id}" overwritten: ` +
					`"${existingOwner}" → "${ownerPluginId}"`
			);
		}
		group.set(contribution.id, contribution);
		if (ownerPluginId) {
			if (!this.owners.has(key)) {
				this.owners.set(key, new Map());
			}
			this.owners.get(key)!.set(contribution.id, ownerPluginId);
		}
		this.notify();

		return {
			dispose: () => {
				if (group.get(contribution.id) === contribution) {
					group.delete(contribution.id);
					this.owners.get(key)?.delete(contribution.id);
					this.notify();
				}
			}
		};
	}

	resolveOwner<K extends keyof ChronosSlotMap>(slotName: K, slotId: string): string | undefined {
		return this.owners.get(String(slotName))?.get(slotId);
	}

	get<K extends keyof ChronosSlotMap>(slotName: K): Array<ChronosSlotMap[K]> {
		const group = this.slots.get(String(slotName));
		if (!group) return [];
		const list = Array.from(group.values()) as Array<ChronosSlotMap[K] & { order?: number }>;
		return list.sort((a, b) => (a.order ?? 50) - (b.order ?? 50));
	}

	getSlotItem<K extends keyof ChronosSlotMap>(
		slotName: K,
		id: string
	): ChronosSlotMap[K] | undefined {
		return this.slots.get(String(slotName))?.get(id) as ChronosSlotMap[K] | undefined;
	}

	private notify(): void {
		this.onSlotsChangedCallback?.();
	}

	dispose(): void {
		this.slots.clear();
		this.owners.clear();
	}
}
