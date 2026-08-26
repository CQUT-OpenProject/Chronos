import { env } from '$env/dynamic/public';
import type { PostHog } from 'posthog-js';
import type { IAnalyticsService } from '@chronos/core';

export type AnalyticsEvent =
	| 'onboarding_step_next'
	| 'onboarding_step_back'
	| 'onboarding_skip'
	| 'onboarding_start_import'
	| 'onboarding_layout_selected'
	| 'empty_import_click'
	| 'empty_import_guide_open'
	| 'timetable_week_swipe'
	| 'timetable_week_jump_current'
	| 'course_detail_open'
	| 'course_editor_open'
	| 'course_save'
	| 'course_delete'
	| 'import_source_select'
	| 'share_link_decode_success'
	| 'share_link_decode_fail'
	| 'import_mode_select'
	| 'import_confirm'
	| 'export_copy_link'
	| 'export_slot_execute_attempt'
	| 'export_slot_execute_success'
	| 'export_slot_execute_fail'
	| 'settings_theme_change'
	| 'settings_color_scheme_change'
	| 'settings_layout_change'
	| 'settings_capsule_corner_change'
	| 'settings_locale_change'
	| 'settings_haptic_feedback_change'
	| 'timetable_switch'
	| 'timetable_delete'
	| 'timetable_overlap_expand'
	| 'timetable_details_save'
	| 'timetable_details_reset'
	| 'pwa_install_prompt_show'
	| 'pwa_install_accept'
	| 'pwa_install_snooze'
	| 'pwa_install_dismiss'
	| 'pwa_install_cta_click'
	| 'pwa_update_apply'
	| 'update_check_attempt'
	| 'update_check_success'
	| 'update_check_fail'
	| 'release_detail_open'
	| 'about_clear_all_data'
	| 'developer_easter_egg_open';

let client: PostHog | null = null;
let pending: Array<[AnalyticsEvent, Record<string, string | number | boolean> | undefined]> | null =
	null;
let analyticsPort: IAnalyticsService | null = null;

export function bindAnalyticsPort(service: IAnalyticsService): void {
	analyticsPort = service;
}

export function initAnalytics() {
	if (import.meta.env.DEV || !__ANALYTICS_ENABLED__) return;

	const key = env.PUBLIC_POSTHOG_KEY;
	if (!key) return;

	pending = [];
	void import('posthog-js')
		.then(({ default: posthog }) => {
			posthog.init(key, {
				api_host: env.PUBLIC_POSTHOG_HOST,
				defaults: '2026-05-30',
				autocapture: false,
				disable_session_recording: true,
				persistence: 'localStorage'
			});
			client = posthog;
			const queued = pending;
			pending = null;
			for (const [name, properties] of queued ?? []) {
				posthog.capture(name, properties);
			}
		})
		.catch(() => {
			pending = null;
		});
}

/** PostHog adapter entry — used by `WebAnalyticsProvider` only. */
export function capturePostHogEvent(
	name: AnalyticsEvent,
	properties?: Record<string, string | number | boolean>
) {
	if (client) {
		client.capture(name, properties);
		return;
	}
	pending?.push([name, properties]);
}

/** UI telemetry facade — routes through `IAnalyticsService` when the engine port is bound. */
export function trackEvent(
	name: AnalyticsEvent,
	properties?: Record<string, string | number | boolean>
) {
	if (analyticsPort) {
		analyticsPort.track(name, properties);
		return;
	}
	capturePostHogEvent(name, properties);
}
