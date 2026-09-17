import { createContext, untrack, type Component } from 'svelte';

export interface EdgeBarAction {
	id: string;
	label: string;
	icon: Component<{ class?: string }> | string;
	variant?: 'filled' | 'outlined' | 'danger';
	disabled?: boolean;
	showIconInPortrait?: boolean;
	onClick: () => void | Promise<void>;
}

export function createEdgeBarActions() {
	let entries = $state.raw(new Map<string, { token: object; actions: readonly EdgeBarAction[] }>());
	return {
		get(owner: string): readonly EdgeBarAction[] {
			return entries.get(owner)?.actions ?? [];
		},
		register(owner: string, actions: readonly EdgeBarAction[]): () => void {
			const token = {};
			entries = new Map(untrack(() => entries)).set(owner, { token, actions });
			return () => {
				if (untrack(() => entries.get(owner)?.token) !== token) return;
				const next = new Map(untrack(() => entries));
				next.delete(owner);
				entries = next;
			};
		}
	};
}

export type EdgeBarActionsController = ReturnType<typeof createEdgeBarActions>;
export const [getEdgeBarActions, setEdgeBarActions] = createContext<
	EdgeBarActionsController | undefined
>();
