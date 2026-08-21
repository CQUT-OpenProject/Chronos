import type { LocalizedText } from '../types/slots';

export type SchemaType =
	| 'string'
	| 'password'
	| 'number'
	| 'boolean'
	| 'select'
	| 'file'
	| 'array'
	| 'object'
	| 'timetable-preview'
	| 'wallpaper-preview';

export interface SelectOption {
	label: LocalizedText;
	value: string | number;
}

export interface SchemaField<T = unknown> {
	type: SchemaType;
	title: LocalizedText;
	/** One-line concise explanation */
	description?: LocalizedText;
	/** Detailed tooltip or documentation hint */
	helpText?: LocalizedText;
	default?: T;
	placeholder?: LocalizedText;
	required?: boolean;
	accept?: string; // Applicable to 'file' type, e.g. '.html,.htm'
	options?: SelectOption[]; // Applicable to 'select' type
	/** Nested schema definition for array items (when type === 'array') */
	itemSchema?: SchemaField<unknown>;
	/** Nested properties schema definition (when type === 'object') */
	properties?: ConfigSchema<Record<string, unknown>>;
	/** Display ordering weight for UI forms (lower values rendered first) */
	order?: number;
	hidden?: boolean;
	validate?: (value: T) => string | undefined | null;
}

export type ConfigSchema<T extends object = Record<string, unknown>> = {
	[K in keyof T]: SchemaField<T[K]>;
};

export function defineSchema<T extends object>(schema: ConfigSchema<T>): ConfigSchema<T> {
	return schema;
}

export interface SchemaValidationResult<T> {
	readonly valid: boolean;
	readonly errors: Record<string, string>;
	readonly values: T;
}

export function extractDefaultValues<T extends object>(schema: ConfigSchema<T>): T {
	const result = {} as Record<string, unknown>;

	for (const [key, field] of Object.entries(schema) as Array<[string, SchemaField<unknown>]>) {
		if (field.default !== undefined) {
			result[key] = field.default;
		} else {
			switch (field.type) {
				case 'boolean':
					result[key] = false;
					break;
				case 'number':
					result[key] = 0;
					break;
				case 'select':
					result[key] = field.options?.[0]?.value ?? '';
					break;
				case 'wallpaper-preview':
				case 'timetable-preview':
					result[key] = null;
					break;
				case 'string':
				case 'password':
				case 'file':
				default:
					result[key] = '';
					break;
			}
		}
	}

	return result as T;
}

/**
 * Validate an input object against a declarative ConfigSchema,
 * applying default values, type checks, and custom validators.
 */
export function validateConfig<T extends object>(
	input: unknown,
	schema: ConfigSchema<T>
): SchemaValidationResult<T> {
	const errors: Record<string, string> = {};
	const raw =
		input && typeof input === 'object' && !Array.isArray(input)
			? (input as Record<string, unknown>)
			: {};

	const defaults = extractDefaultValues(schema);
	const values = { ...defaults, ...raw } as Record<string, unknown>;

	for (const [key, field] of Object.entries(schema) as Array<[string, SchemaField<unknown>]>) {
		const val = values[key];

		// 1. Required field check
		if (field.required) {
			if (val === undefined || val === null || val === '') {
				errors[key] = 'Field is required';
				continue;
			}
		}

		if (val === undefined || val === null || val === '') {
			continue;
		}

		// 2. Type validation
		switch (field.type) {
			case 'boolean':
				if (typeof val !== 'boolean') {
					errors[key] = 'Value must be a boolean';
				}
				break;
			case 'number':
				if (typeof val !== 'number' || Number.isNaN(val)) {
					const parsed = Number(val);
					if (Number.isNaN(parsed)) {
						errors[key] = 'Value must be a valid number';
					} else {
						values[key] = parsed;
					}
				}
				break;
			case 'select':
				if (field.options && field.options.length > 0) {
					const validValues = field.options.map((opt) => opt.value);
					if (!validValues.includes(val as string | number)) {
						errors[key] = 'Selected option is not in the allowed list';
					}
				}
				break;
			case 'string':
			case 'password':
				if (typeof val !== 'string') {
					errors[key] = 'Value must be a string';
				}
				break;
			case 'file':
				if (typeof val !== 'string' && !(val instanceof Uint8Array)) {
					errors[key] = 'Value must be a string or binary file';
				}
				break;
			case 'wallpaper-preview':
				if (val !== null && val !== '' && typeof val !== 'string' && !(val instanceof Uint8Array)) {
					errors[key] = 'Value must be a string or binary file';
				}
				break;
			case 'timetable-preview':
				break;
		}

		// 3. Custom validator execution
		if (!errors[key] && field.validate) {
			try {
				const errorMsg = field.validate(values[key] as never);
				if (errorMsg) {
					errors[key] = errorMsg;
				}
			} catch (err: unknown) {
				errors[key] = err instanceof Error ? err.message : 'Validation failed';
			}
		}
	}

	return {
		valid: Object.keys(errors).length === 0,
		errors,
		values: values as T
	};
}
