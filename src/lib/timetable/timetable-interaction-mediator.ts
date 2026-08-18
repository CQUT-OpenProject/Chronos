import { haptic } from '$lib/haptic/haptic';
import { trackEvent, type AnalyticsEvent } from '$lib/client/analytics';
import type { Course } from '$lib/models/course';

export interface HapticPort {
	light(): boolean;
	medium(): boolean;
	heavy(): boolean;
}

export interface TelemetryPort {
	track(event: AnalyticsEvent, properties?: Record<string, string | number | boolean>): void;
}

export interface TimetableInteractionMediatorOptions {
	onCourseClick?: (course: Course) => void;
	onCourseLongClick?: (course: Course) => void;
	hapticPort?: HapticPort;
	telemetryPort?: TelemetryPort;
}

/**
 * Cohesive mediator connecting presentation gestures with haptic feedback & analytics side-effects.
 */
export function createTimetableInteractionMediator(
	options: TimetableInteractionMediatorOptions = {}
) {
	const {
		onCourseClick,
		onCourseLongClick,
		hapticPort = haptic,
		telemetryPort = { track: trackEvent }
	} = options;

	return {
		handleCourseClick(course: Course) {
			onCourseClick?.(course);
		},
		handleCourseLongPress(course: Course) {
			hapticPort.heavy();
			onCourseLongClick?.(course);
		},
		handleOverlapExpand(_key?: string) {
			telemetryPort.track('timetable_overlap_expand');
		},
		triggerLightFeedback() {
			hapticPort.light();
		},
		triggerMediumFeedback() {
			hapticPort.medium();
		}
	};
}

export type TimetableInteractionMediator = ReturnType<typeof createTimetableInteractionMediator>;
