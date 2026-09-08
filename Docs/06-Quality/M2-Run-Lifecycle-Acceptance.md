# M2 Run Lifecycle Acceptance Checklist

This checklist records evidence required before Milestone 2 is merged.

## Automated build gate

- [x] `npm ci`
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] production `dist/` static-host smoke test

## Lifecycle behavior

- [x] a new run starts with zero route progress and the full M2 time budget;
- [x] route distance increases monotonically from forward vehicle motion and is not reset by road wrapping;
- [x] continuous throttle can reach the representative M2 destination before timeout;
- [x] an idle/no-progress run reaches the timeout result;
- [x] destination reached on the same simulation step as time expiry resolves as `completed`;
- [x] `ResultScene` distinguishes completion from timeout and displays lifecycle summary values;
- [x] restart creates a fresh run with reset timer, route progress, player speed and lateral position;
- [x] terminal transition occurs once and does not continue simulating the finished run;
- [x] abnormal browser frame gaps remain bounded by the existing fixed-step/frame-gap policy.

## Scope review

- [x] M2 does not add traffic, cargo, score/rank, route branching, persistence or host integration;
- [x] M2 keeps the frozen source architecture small: only the already-planned `GameState.ts` runtime file is added;
- [x] representative 30-second/60%-demo-road values are documented as temporary validation tuning, not final game balance.

## Validation evidence

Standard WebGame CI passed on the M2 runtime source with dependency install, typecheck, production build and static-output smoke validation.

A temporary branch-only lifecycle harness was used, then removed before PR creation. It verified:

- pure `GameState` terminal rules, including completion precedence when destination and timeout occur in the same fixed step;
- monotonic route progress when a negative distance delta is supplied defensively;
- production browser start state at 960x540;
- idle timeout reaching the `TIME EXPIRED` result at exactly 30.0 simulation seconds;
- restart returning to a fresh zero-progress run;
- continuous throttle reaching `DELIVERY COMPLETE` in the representative M2 route;
- success result reporting 100% route completion and remaining time.

The first timeout screenshot attempt was intentionally not accepted because the headless browser had not yet advanced the bounded fixed-step simulation to the terminal tick. The harness wait window was extended and the test repeated; the second run produced the expected timeout ResultScene. This preserves the distinction between wall-clock wait time and bounded simulation time under a slow/headless render loop.

## Human/visual check

Visual review of the production-browser screenshots confirmed that the start HUD, timeout result, restart state and completion result are readable at 960x540.

Detailed driving feel and continuous curve-transition feel remain covered by the outstanding M1 human playtest and later balance milestones; M2 does not claim those subjective items are resolved.
