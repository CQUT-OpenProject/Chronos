# Chronos Domain Context

## Platform Bootstrap

Root layout delegates client startup to a single deep module (`platform-bootstrap`). It owns ordered subsystem initialization, reactive platform policies (theme DOM, onboarding trigger, install prompt gating), and unified teardown.

## Connectivity

Tracks `isOnline` from `navigator.onLine` and window online/offline events. Does not render UI.

## Offline UX Adapter

Subscribes to connectivity state and shows global offline/online snackbars. Persistent per-screen offline indicators (e.g. timetable app bar) remain in feature UI.

## App Shell

Holds subscribed app state (theme, wallpaper, current timetable) and exposes mutation methods. Does not manage platform lifecycle.

## Timetable Screen

Reactive shell for the schedule tab: week navigation, grid models, and course display. Initialized by platform bootstrap after app shell.
