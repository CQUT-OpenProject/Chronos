# FROZEN baseline review schedule

Per ADR 0023 §3, the following capabilities are on a **two release cycle** review clock (accepted 2026-08-23):

| Item                                                      | Review after | Action if still zero consumers          |
| --------------------------------------------------------- | ------------ | --------------------------------------- |
| `EventPipeline` serial/waterfall + engine action wrappers | ~2026-12-23  | Remove machinery wholesale              |
| `IStorageService.queryCourses`                            | ~2026-12-23  | Revisit RESERVED decision (ADR 0023 D1) |
| `engine.actions.updateCourse` (no guard/waterfall)        | Same review  | Remove or align when wrappers removed   |

Do not extend these APIs before the review without a new ADR.
