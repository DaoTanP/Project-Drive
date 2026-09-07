# ADR-0001 — Initial Technology, Scope and Runtime Boundaries

- Status: Accepted
- Date: 2026-09-07

## Context

Night Courier is intended to be a small arcade-style pseudo-3D racing minigame hosted by a larger Unity application. The primary goals are rapid implementation, browser-first iteration, offline runtime support and minimal architectural overhead.

Several implementation directions were considered conceptually:

- implement the minigame directly in Unity;
- use vanilla Canvas/JavaScript;
- use a lower-level rendering library;
- use Phaser with a small custom pseudo-3D road renderer;
- add broader web application frameworks or physics libraries.

The game also needs to exchange launch/result data with Unity but does not need to render onto a world-space arcade cabinet.

## Decision

### Product

The game is **Night Courier**: a 4–5 minute pseudo-3D arcade delivery racer.

Initial mechanics are limited to:
- acceleration;
- braking;
- steering;
- traffic;
- collision;
- timer;
- cargo condition;
- near-miss combo/scoring;
- one route branch;
- result/high-score flow.

### Technology

Use:
- Phaser 4;
- TypeScript;
- Vite;
- custom arcade motion and pseudo-3D projection math.

Do not use in the initial implementation:
- React;
- ECS;
- external physics engine;
- backend/database;
- required online services;
- generalized racing-engine abstractions.

### Architecture

Target approximately 12 TypeScript source files:

```text
src/
├── main.ts
├── config.ts
├── HostBridge.ts
├── scenes/
│   ├── BootScene.ts
│   ├── GameScene.ts
│   └── ResultScene.ts
└── game/
    ├── GameState.ts
    ├── Road.ts
    ├── Player.ts
    ├── Traffic.ts
    ├── Scoring.ts
    └── Input.ts
```

`GameScene` acts as the composition/orchestration boundary. Do not add generic managers/services around it without demonstrated need.

### Host/runtime

- Develop and playtest primarily in a normal browser.
- Build static local web output.
- Host the production game fullscreen in a Unity WebView.
- Do not require rendering the web game onto a cabinet texture.
- Do not make a raw `file://` filesystem layout part of the cross-platform contract.
- Use a versioned serialized JSON bridge.
- Keep Unity authoritative for persistence.
- Destroy the WebView after exit rather than retaining hidden browser runtimes.

## Rationale

Phaser supplies the infrastructure that would otherwise need to be rebuilt around Canvas—scene lifecycle, assets, input, audio, game loop and rendering—while still allowing custom road projection math.

TypeScript provides compile-time checking for gameplay and host-message contracts, which is especially useful in rapid AI-assisted implementation.

Vite provides a fast browser iteration loop and static production output suitable for offline packaging.

The 12-file architecture preserves meaningful subsystem boundaries without paying the maintenance cost of a generalized engine. The selected boundaries isolate the highest-change areas—road rendering, player behavior, traffic, scoring, input and host integration—while leaving small concerns such as HUD/audio inside Phaser scenes until evidence justifies extraction.

A fullscreen WebView avoids the substantial complexity of browser-to-Unity render textures and keeps the minigame deployable as an independent web build.

## Consequences

### Positive
- Fast browser-based development loop.
- Small codebase that can be understood in one pass.
- Easy offline packaging.
- Minimal Unity coupling.
- Easy replacement or independent testing of the web minigame.
- Low risk of framework-driven scope expansion.

### Negative / accepted trade-offs
- The initial architecture is not optimized for many game modes or vehicles.
- `Road.ts` and `GameScene.ts` may become larger than files in a heavily layered architecture.
- Host bridge behavior needs platform-specific Unity/WebView adapter work.
- Some concerns remain intentionally colocated until complexity proves extraction worthwhile.

## Reconsideration triggers

Revisit this ADR only if concrete evidence shows one of the following:

- WebView cannot meet a required target-platform constraint;
- browser rendering cannot meet measured target performance;
- Road/GameScene responsibilities become demonstrably unmaintainable;
- multiple real implementations require an abstraction currently omitted;
- game scope is explicitly expanded beyond a small arcade minigame.

Do not revisit it solely because a more generalized architecture might be useful later.
