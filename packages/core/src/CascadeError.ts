export class CascadeError extends Error {
	constructor(message: string) {
		super();
		this.message = message;
		this.name = 'CascadeError';
	}
}