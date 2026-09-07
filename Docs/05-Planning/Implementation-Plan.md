# Implementation Plan

## Milestone 0 — Project bootstrap

**Goal:** runnable empty Phaser application with production build.

Deliverables:
- Vite + TypeScript project;
- Phaser dependency;
- logical 960x540 canvas;
- Boot/Game/Result scene skeleton as needed;
- package scripts for dev/build/typecheck;
- committed lockfile.

Exit criteria:
- browser dev build runs;
- production build succeeds;
- no Unity dependency exists.

## Milestone 1 — Road and player vertical slice

**Goal:** player can drive a short pseudo-3D road section.

Deliverables:
- road segment data;
- perspective projection;
- straight/curved road rendering;
- hills only if inexpensive after curves work;
- player speed/steering/braking;
- normalized keyboard input;
- basic HUD speed/debug values if useful.

Exit criteria:
- controllable road motion reads correctly at target resolution;
- frame delta behavior is stable;
- no physics engine introduced.

## Milestone 2 — Complete run loop

**Goal:** the game can start, finish or fail.

Deliverables:
- track position/progression;
- timer;
- destination/end condition;
- fail state when time expires;
- ResultScene;
- restart.

Exit criteria:
- a representative short run is playable end-to-end.

## Milestone 3 — Traffic and risk/reward

**Goal:** establish the core Night Courier identity.

Deliverables:
- traffic spawn/recycling;
- projected traffic sprites/placeholders;
- collision envelopes;
- speed loss and cargo damage;
- near-miss detection;
- combo and scoring.

Exit criteria:
- collisions are readable and deterministic enough to tune;
- near misses cannot double-award;
- player can intentionally trade risk for score.

## Milestone 4 — Final route structure

**Goal:** reach the 4–5 minute target session.

Deliverables:
- full opening/final sections;
- one route split;
- short/risky vs long/safer branch characteristics;
- completion scoring based on cargo/time;
- rank calculation.

Exit criteria:
- full run duration is within target after tuning;
- both branches are viable and behaviorally distinct.

## Milestone 5 — Mobile controls and presentation

**Goal:** minigame is usable as a polished standalone web build.

Deliverables:
- touch controls;
- optional gamepad support if low-risk;
- HUD polish;
- player/traffic/environment art pass;
- audio;
- collision/near-miss feedback;
- pause/resume behavior.

Exit criteria:
- complete run is playable on target mobile browser/WebView class hardware;
- controls remain readable at common aspect ratios.

## Milestone 6 — Unity host integration

**Goal:** run offline fullscreen inside Unity.

Deliverables:
- static production package;
- WebView host setup;
- `READY` / `INIT` handshake;
- pause/resume;
- `GAME_COMPLETED` / `GAME_ABORTED`;
- Unity persistence/high score;
- clean WebView destruction/relaunch.

Exit criteria:
- first launch, completion, close and second launch all work offline in one Unity session;
- result payload is validated before save.

## Milestone 7 — Stabilization

**Goal:** ship-quality minigame within frozen scope.

Deliverables:
- bug fixes;
- balance pass;
- mobile performance profiling;
- repeated lifecycle tests;
- final acceptance pass;
- docs synchronized with implemented contracts.

Exit criteria:
- all acceptance criteria in `06-Quality/Test-and-Acceptance.md` pass;
- no P0/P1 known defects remain;
- no deferred feature is required for core loop coherence.
