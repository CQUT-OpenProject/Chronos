import { parseHTML } from 'linkedom';

const { DOMParser } = parseHTML('<!DOCTYPE html><html><body></body></html>');
globalThis.DOMParser = DOMParser as typeof globalThis.DOMParser;
