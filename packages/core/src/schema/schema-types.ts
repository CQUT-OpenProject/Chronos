import type { LocalizedText } from '../types/slots';

export type SchemaType =
	| 'string'
	| 'password'
	| 'number'
	| 'boolean'
	| 'select'
	| 'file'
	| 'date'
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
	accept?: string;
	options?: SelectOption[];
	/** Select presentation; defaults to dropdown */
	presentation?: 'dropdown' | 'radio';
	/** @internal Reserved for nested array schemas */
	itemSchema?: SchemaField<unknown>;
	/** @internal Reserved for nested object schemas */
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
