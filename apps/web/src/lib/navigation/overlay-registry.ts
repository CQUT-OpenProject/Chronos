const overlayClosers = new Map<string, () => void>();

export function registerOverlayCloser(id: string, close: () => void): () => void {
	overlayClosers.set(id, close);
	return () => {
		overlayClosers.delete(id);
	};
}

export function closeOverlayById(id: string): boolean {
	const close = overlayClosers.get(id);
	if (!close) return false;
	close();
	return true;
}
