# FROZEN baseline review schedule

Per ADR 0023 §3, the following capabilities are on a **two release cycle** review clock (accepted 2026-08-23):

| Item                                                                                                                     | Review after | Action if still zero consumers |
| ------------------------------------------------------------------------------------------------------------------------ | ------------ | ------------------------------ |
| ~~`EventPipeline` serial/waterfall + engine action wrappers~~ — DONE: removed in 0.5.x (broadcast-only `emit` / `on`)    | —            | —                              |
| ~~`IStorageService.queryCourses`~~ — DONE: first consumer `tool-today` landed (ADR 0028 §6); RESERVED kept, shape frozen | —            | —                              |
| ~~`engine.actions.updateCourse` (no guard/waterfall)~~ — DONE: aligned when wrappers removed                             | —            | —                              |

All scheduled items are resolved. New frozen capabilities require a dedicated ADR before landing.
