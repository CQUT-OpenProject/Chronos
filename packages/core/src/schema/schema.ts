import type { LocalizedText } from '../types/slots';

export type SchemaType = 'string' | 'password' | 'number' | 'boolean' | 'select' | 'file';

export interface SelectOption {
	label: LocalizedText;
	value: string | number;
}

export interface SchemaField<T = unknown> {
	type: SchemaType;
	title: LocalizedText;
	description?: LocalizedText;
	default?: T;
	placeholder?: LocalizedText;
	required?: boolean;
	accept?: string; // Applicable to 'file' type, e.g. '.html,.htm'
	options?: SelectOption[]; // Applicable to 'select' type
	hidden?: boolean;
	validate?: (value: T) => string | undefined | null;
}

export type ConfigSchema<T extends object = Record<string, unknown>> = {
	[K in keyof T]: SchemaField<T[K]>;
};

export function defineSchema<T extends object>(schema: ConfigSchema<T>): ConfigSchema<T> {
	return schema;
}
