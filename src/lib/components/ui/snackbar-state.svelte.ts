export type SnackbarAction = { label: string; onClick: () => void };
export type SnackbarPriority = 'polite' | 'assertive';

export const snackbarStore = $state<{
	open: boolean;
	message: string;
	action: SnackbarAction | null;
	priority: SnackbarPriority;
}>({
	open: false,
	message: '',
	action: null,
	priority: 'polite'
});

let timer: ReturnType<typeof setTimeout> | null = null;

export function snackbar(
	message: string,
	action?: SnackbarAction,
	duration = 4000,
	priority: SnackbarPriority = 'polite'
) {
	if (timer) clearTimeout(timer);
	snackbarStore.message = message;
	snackbarStore.action = action ?? null;
	snackbarStore.priority = priority;
	snackbarStore.open = true;
	timer = setTimeout(() => {
		snackbarStore.open = false;
	}, duration);
}

export function dismissSnackbar() {
	if (timer) clearTimeout(timer);
	snackbarStore.open = false;
}
