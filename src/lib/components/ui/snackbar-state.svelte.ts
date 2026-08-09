export type SnackbarAction = { label: string; onClick: () => void };

export const snackbarStore = $state<{
	open: boolean;
	message: string;
	action: SnackbarAction | null;
}>({
	open: false,
	message: '',
	action: null
});

let timer: ReturnType<typeof setTimeout> | null = null;

export function snackbar(message: string, action?: SnackbarAction, duration = 4000) {
	if (timer) clearTimeout(timer);
	snackbarStore.message = message;
	snackbarStore.action = action ?? null;
	snackbarStore.open = true;
	timer = setTimeout(() => {
		snackbarStore.open = false;
	}, duration);
}

export function dismissSnackbar() {
	if (timer) clearTimeout(timer);
	snackbarStore.open = false;
}
