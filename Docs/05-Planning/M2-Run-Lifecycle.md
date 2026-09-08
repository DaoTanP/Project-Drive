# M2 Run Lifecycle

## Goal

Make Night Courier playable from run start through either successful delivery or timeout, with a standalone result and restart loop.

## State boundary

`GameState.ts` owns only current-run lifecycle state:

- elapsed time;
- time remaining;
- monotonic route distance;
- destination distance;
- finished flag;
- terminal outcome (`completed` or `timeout`).

It does not own rendering, input, vehicle motion, traffic, cargo, scoring, persistence or Unity integration.

`RunResult` is a plain data snapshot derived only after a run has reached a terminal state. This keeps the result suitable for later extension by scoring/host integration without coupling M2 to those milestones.

## Route progress vs road sampling

M1's `Road` can wrap positions for projection/demo-road lookup. M2 does **not** use wrapped position as authoritative run progress.

The runtime model is:

```text
monotonic routeDistance
        |
        +--> destination / completion rules
        |
        +--> INITIAL_ROAD_POSITION + routeDistance
                         |
                         v
                   Road query/render
                   (may wrap internally)
```

This prevents a visual road loop from resetting or corrupting delivery progress and leaves M4 free to replace the representative route with the final authored branch structure.

## Timer and terminal ordering

The timer advances only inside the existing fixed 60 Hz simulation step.

On each step:

1. update player motion;
2. calculate forward distance advanced during that step;
3. advance elapsed/time-remaining and route distance;
4. check destination completion;
5. if destination was not reached, check timeout.

If destination and timeout thresholds are reached in the same fixed step, **completion wins**. This avoids rejecting a delivery that physically reaches its terminal distance on the final allowed simulation step.

## Representative M2 tuning

M2 intentionally uses a short validation run rather than the final 4–5 minute session:

- time limit: **30 seconds**;
- destination: **60% of the current M1 demo-road length**.

These values exist only to make the complete/fail/restart loop practical to exercise during development. They are not game-balance decisions. M4 remains authoritative for the final 4–5 minute route duration and branch tuning.

## Result and restart

`GameScene` transitions to `ResultScene` exactly once after `GameState` becomes terminal.

`ResultScene` shows only lifecycle information needed at M2:

- completed vs timeout;
- elapsed time;
- time remaining;
- route completion percentage;
- restart affordance.

Score, rank, cargo condition and final bonuses remain deferred to M3/M4.

Restart creates a fresh `GameScene`, `Player` and `GameState`; no mutable run state is intentionally reused between runs.

## Explicit non-goals

M2 does not add:

- traffic;
- collision/cargo systems;
- score or rank;
- persistence/high score;
- route branching;
- final 4–5 minute balance;
- Unity bridge logic;
- event bus or lifecycle manager;
- new timing service beyond the fixed-step orchestration already owned by `GameScene`.
