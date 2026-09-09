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
- route position/progression;
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

## Milestone 4 — Final route and environment composition

**Goal:** produce the complete 4–5 minute route with one meaningful branch and five readable presentation zones without expanding into a general biome system.

Authoritative zone design: [`../01-Design/Environment-Zones-and-Roadside-Composition.md`](../01-Design/Environment-Zones-and-Roadside-Composition.md).

Deliverables:
- minimal authored zone identity for `city`, `rural`, `forest`, `mountain-pass`, `tunnel`;
- deterministic ambient roadside placement plus explicit authored landmarks;
- shared outdoor background/parallax profile selection;
- city opening;
- rural/outskirts transition;
- one route split;
- short/risky `mountain-pass -> tunnel` branch;
- long/safer `forest -> rural` branch;
- simple tunnel enclosure using the existing projected road renderer;
- shared city-fringe/depot finish;
- completion scoring based on cargo/time;
- rank calculation.

Exit criteria:
- full run duration is within 4–5 minutes after tuning;
- both branches are viable and behaviorally/visually distinct;
- `city`, `rural`, `forest`, `mountain-pass` and `tunnel` can each be recognized quickly from composition without explicit zone labels;
- roadside placement is deterministic;
- tunnel entry/interior/exit reads correctly without a separate scene or full 3D mesh;
- no `BiomeManager`, environment ECS or per-zone gameplay system is introduced.

## Milestone 5 — Mobile controls and presentation

**Goal:** minigame is usable as a polished standalone web build with production assets replacing placeholders.

Vehicle art contracts:

- player: five `256 x 256` FLAT steering frames;
- traffic: every production traffic visual uses a complete five-yaw family at `256 x 256` per source frame, following [`../01-Design/Traffic-Sprite-Angle-Specification.md`](../01-Design/Traffic-Sprite-Angle-Specification.md);
- traffic yaw remains presentation-only and does not create new AI/physics/collision states.

Background art contracts follow [`../01-Design/Background-Parallax-Asset-Specification.md`](../01-Design/Background-Parallax-Asset-Specification.md):

- `bg_city_far`: exact `2048 x 512`, horizontally seamless;
- `bg_city_mid`: exact `2048 x 512`, RGBA transparent, horizontally seamless;
- the earlier `2048 x 768` city-mid exploration size is retired;
- `bg_city_near` remains optional and must not be added unless representative gameplay shows that projected roadside props cannot create sufficient near-city depth.

Deliverables:
- touch controls;
- optional gamepad support if low-risk;
- HUD polish;
- player production art pass;
- traffic production art pass with at least three complete five-yaw identities and a standard target of taxi + hatchback + van + truck = 20 traffic frames;
- city far/mid production background pair using the frozen `2048 x 512` contracts;
- approximately 15–18 shared roadside/environment props supporting all five zones;
- approximately 5–7 shared background/parallax images total;
- final environment composition/readability pass;
- audio;
- collision/near-miss feedback;
- pause/resume behavior.

Exit criteria:
- complete run is playable on target mobile browser/WebView class hardware;
- controls remain readable at common aspect ratios;
- every shipping traffic identity has all five accepted `256 x 256` yaw frames and stable road-contact registration;
- traffic yaw texture selection does not change road-space collision/near-miss behavior;
- `bg_city_far` and `bg_city_mid` satisfy their exact dimensions/seamless-loop contract and preserve player/traffic readability in composite;
- all five zones remain distinct while using one coherent palette/asset vocabulary;
- runtime art remains within the revised **~49–67 image** budget unless a reviewed exception exists.

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
- route/zone readability pass;
- mobile performance profiling across dense city, natural road and tunnel cases;
- repeated lifecycle tests;
- final acceptance pass;
- docs synchronized with implemented contracts.

Exit criteria:
- all acceptance criteria in `06-Quality/Test-and-Acceptance.md` pass;
- no P0/P1 known defects remain;
- no deferred feature is required for core loop coherence.
