# System Architecture

## 1. Architectural intent

The architecture is optimized for a small, independently testable arcade minigame that can run in two hosts:

- normal desktop/mobile browser during development;
- fullscreen offline WebView inside Unity in production.

The web game must not depend on Unity-specific APIs outside the host boundary.

## 2. Runtime model

```text
Unity main game
    |
    | launch context / lifecycle / persistence
    v
Fullscreen WebView
    |
    v
Night Courier web runtime
    |
    +-- BootScene
    +-- GameScene
    +-- ResultScene
    |
    +-- Road
    +-- Player
    +-- Traffic
    +-- Input
    +-- GameState
    +-- Scoring
    |
    v
HostBridge
    |
    +-- Unity host transport
    +-- browser fallback
```

## 3. Ownership boundaries

### Unity owns
- launching and closing the minigame;
- persistent high scores/progression;
- application-level pause/resume;
- host/platform WebView setup;
- selection of the packaged game entry point;
- validating data crossing the host boundary.

### Web game owns
- current run simulation;
- rendering;
- gameplay input normalization;
- road/traffic/player state;
- scoring during the active run;
- game UI and result presentation;
- emitting the final result.

### Shared contract
Only serialized messages cross the boundary. Neither side references implementation objects owned by the other.

## 4. Dependency rules

- `main.ts` bootstraps Phaser only.
- `config.ts` owns Phaser config and small global tuning constants.
- scenes may compose gameplay modules.
- gameplay modules must not import Unity/native code.
- `HostBridge.ts` is the only source file allowed to know host transport details.
- `ResultScene` may publish a final result through `HostBridge`.
- `Player`, `Road`, `Traffic`, `Scoring` and `GameState` remain host-independent.
- `Input` converts keyboard/touch/gamepad into a normalized gameplay input state.
- `GameScene` owns frame orchestration and the small fixed-step simulation accumulator; no separate timing service is introduced.
- `Road` owns both compact authored road-section data and compiled runtime road segments. The distinction is conceptual/data-oriented and does not justify another source file in the initial architecture.

## 5. Initial source layout

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

Target: **12 TypeScript source files**.

This is a target boundary, not a hard prohibition. A 13th file is justified when it removes real coupling or isolates proven complexity. Splitting files solely for pattern purity is not justified.

## 6. Responsibilities

### `main.ts`
Construct the Phaser game using exported configuration.

### `config.ts`
Logical resolution, Phaser renderer choice, scene registration and small gameplay constants.

### `BootScene.ts`
Load assets, initialize host handshake and enter gameplay.

### `GameScene.ts`
Composition root and frame-level orchestration. It owns HUD composition, coordinates gameplay modules and advances gameplay through a bounded fixed-step simulation loop while Phaser remains responsible for the host render frame.

### `ResultScene.ts`
Display final result, restart/exit actions and publish host result.

### `GameState.ts`
Small mutable run-state model and its initialization contract.

### `Road.ts`
Own the complete small road subsystem without introducing a track framework. Responsibilities include:

- compact authored road sections;
- compilation into fixed-length runtime segments;
- segment lookup and interpolation;
- world/camera/screen projection data;
- straight-road, curve and hill geometry;
- road occlusion/clipping information;
- procedural road rendering;
- the single route branch when that milestone is reached;
- roadside placement metadata.

Reference material may inform the projection/curve algorithms, but its source-code organization is not part of this contract.

### `Player.ts`
Arcade motion, lateral position, collision response and cargo damage.

### `Traffic.ts`
Traffic lifecycle, movement, projection, collision and near-miss detection.

### `Scoring.ts`
Near-miss/combo rules and final score/rank calculation.

### `Input.ts`
Keyboard, touch and optional gamepad mapped to a normalized gameplay input state.

### `HostBridge.ts`
Host detection, message serialization/deserialization, lifecycle messages and result publication.

## 7. Deliberately absent layers

The initial architecture has no:

- service locator;
- dependency injection container;
- repository layer;
- event bus;
- ECS;
- generic entity/component model;
- generalized vehicle hierarchy;
- renderer abstraction;
- physics abstraction;
- simulation-clock/time-service abstraction;
- dedicated track compiler/editor module;
- UI framework;
- audio manager;
- track editor pipeline.

Add one only when a concrete requirement cannot remain clean within the current boundaries.

## 8. Reference-informed, implementation-independent policy

External pseudo-3D racer references are used to understand proven ideas such as:

- segment-based road representation;
- perspective projection from world to camera to screen space;
- accumulated lateral displacement for curves;
- elevation-based hills;
- horizon/crest occlusion;
- fixed-step simulation reasoning;
- data-oriented traffic indexing.

They do **not** define Night Courier's classes, function names, constants, control flow, file layout, renderer API usage or gameplay constraints. We implement the underlying ideas independently in Phaser/TypeScript within the frozen Night Courier boundaries.

See [`../03-Technical/Pseudo-3D-Road-Research-Notes.md`](../03-Technical/Pseudo-3D-Road-Research-Notes.md) for the research summary and accepted/rejected ideas.

## 9. Extensibility policy

Expected future changes such as a second track or another traffic sprite should first be represented as data inside the existing modules. Extraction into new systems occurs only after repeated implementation demonstrates a stable abstraction.
