// Domain
export * from './domain/course';
export * from './domain/course-query';
export * from './domain/timetable';
export * from './domain/preferences';

// Engine
export * from './algorithms/date';
export * from './algorithms/calendar';
export * from './algorithms/holiday-calendar';
export * from './algorithms/slot-key';
export * from './algorithms/grid';
export * from './algorithms/display-models';
export {
	placeCapsules,
	applyCapsuleCornerRounding,
	applyCapsuleSquareCorners,
	ALL_CORNERS_ROUNDED,
	ALL_CORNERS_SQUARE,
	type CapsuleTypeScale,
	type CapsuleGeometry,
	type CapsuleCorners,
	type PlacedCourseCapsule,
	type PlacedOverlapPlaceholder,
	type PlacedItem,
	type PlaceCapsulesInput,
	type CorneredItem
} from './algorithms/capsule-layout';
export * from './algorithms/palette';
export * from './algorithms/timetable-layout';
export * from './algorithms/period-clock';
export * from './algorithms/period-time-edit';

// Shell

// Schema
export * from './schema/schema';

// Types
export * from './types/services';
export * from './types/course-query';
export * from './types/slots';
export * from './types/mountable';
export type {
	ThemeContribution,
	ThemeWorkbenchColors,
	CourseBadgeSlotContribution,
	DynamicColorAdapter
} from './types/contributions';
export type { PlatformType, ChronosEnv } from './types/env';
export * from './types/context';
export * from './types/plugin-server';
export * from './types/official-plugins';
export * from './types/result';

// Runtime
export * from './runtime/hierarchical-slot-registry';
export * from './runtime/event-pipeline';
export * from './runtime/theme-registry';
export * from './runtime/icon-theme-registry';
export * from './theme/workbench-colors';
export * from './theme/theme-defaults';
export * from './theme/icon-theme';
export * from './theme/color-theme-json';
export * from './theme/icon-theme-json';
export * from './runtime/badge-manager';
export * from './runtime/scoped-context';
export * from './runtime/engine';

// Plugin authoring
export * from './plugin/define-chronos-plugin';
export * from './plugin/call-plugin-server';
export * from './plugin/register-import-tab';

// Profile
export * from './profile/profile';
export * from './profile/profile-manager';

// Hosts
export * from './hosts/native-protocol';

// i18n
export { I18nCatalog, interpolateMessage, resolveLocaleMapText } from './i18n/i18n-catalog';
export type { PluginMessageCatalog } from './i18n/i18n-catalog';
export { PLUGIN_CONFIG_STORAGE_KEY } from './constants/plugin-storage';
