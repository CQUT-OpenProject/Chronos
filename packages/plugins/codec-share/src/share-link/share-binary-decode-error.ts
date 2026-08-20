export class ShareBinaryDecodeError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'ShareBinaryDecodeError';
	}
}
