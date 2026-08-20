import type { LocalizedText } from '../types/slots';

export type SchemaType =
	| 'string'
	| 'password'
	| 'number'
	| 'boolean'
	| 'select'
	| 'file'
	| 'array'
	| 'object';

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

/**
 * Validate an input object against a declarative ConfigSchema,
 * applying default values and running custom validators.
 */
export function validateConfig<T extends object>(
	input: unknown,
	schema: ConfigSchema<T>
): SchemaValidationResult<T> {
	const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>;
	const errors: Record<string, string> = {};
	const values = {} as Record<string, unknown>;

	for (const [key, field] of Object.entries(schema) as Array<[string, SchemaField<unknown>]>) {
		const val = raw[key] !== undefined ? raw[key] : field.default;

		if (field.required && (val === undefined || val === null || val === '')) {
			errors[key] = 'Field is required';
			continue;
		}

		if (val !== undefined && field.validate) {
			const errorMsg = field.validate(val);
			if (errorMsg) {
				errors[key] = errorMsg;
			}
		}

		values[key] = val;
	}

	return {
		valid: Object.keys(errors).length === 0,
		errors,
		values: values as T
	};
}
