export const ERROR_LOG_ANALYTICS = {
	copy: 'copy',
	clear: 'clear'
} as const;

export type ErrorLogAnalyticsAction =
	(typeof ERROR_LOG_ANALYTICS)[keyof typeof ERROR_LOG_ANALYTICS];
