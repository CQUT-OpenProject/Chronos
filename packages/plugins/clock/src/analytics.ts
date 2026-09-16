export const CLOCK_ANALYTICS = {
	apply: 'apply',
	reset: 'reset'
} as const;

export type ClockAnalyticsAction = (typeof CLOCK_ANALYTICS)[keyof typeof CLOCK_ANALYTICS];
