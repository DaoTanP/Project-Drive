# M2 Run Lifecycle Acceptance Checklist

This checklist records evidence required before Milestone 2 is merged.

## Automated build gate

- [ ] `npm ci`
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] production `dist/` static-host smoke test

## Lifecycle behavior

- [ ] a new run starts with zero route progress and the full M2 time budget;
- [ ] route distance increases monotonically from forward vehicle motion and is not reset by road wrapping;
- [ ] continuous throttle can reach the representative M2 destination before timeout;
- [ ] an idle/no-progress run reaches the timeout result;
- [ ] destination reached on the same simulation step as time expiry resolves as `completed`;
- [ ] `ResultScene` distinguishes completion from timeout and displays lifecycle summary values;
- [ ] restart creates a fresh run with reset timer, route progress, player speed and lateral position;
- [ ] terminal transition occurs once and does not continue simulating the finished run;
- [ ] abnormal browser frame gaps remain bounded by the existing fixed-step/frame-gap policy.

## Scope review

- [ ] M2 does not add traffic, cargo, score/rank, route branching, persistence or host integration;
- [ ] M2 keeps the frozen source architecture small: only the already-planned `GameState.ts` runtime file is added;
- [ ] representative 30-second/60%-demo-road values are documented as temporary validation tuning, not final game balance.

## Human check

A browser playthrough should confirm that both the success path and restart path are understandable at 960x540. Detailed driving feel remains covered by the outstanding M1 human playtest and later balance milestones.
