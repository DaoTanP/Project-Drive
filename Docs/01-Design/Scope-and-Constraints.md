# Scope and Constraints

## Product scope

Night Courier is intentionally scoped as a **single-session arcade minigame**, not a reusable racing platform.

### Must ship
- pseudo-3D road presentation;
- one drivable vehicle;
- acceleration, braking and steering;
- curves and elevation sufficient to sell pseudo-3D movement;
- traffic spawning/movement;
- collision response;
- cargo condition;
- near-miss combo scoring;
- timer and game-over condition;
- one route split;
- result screen;
- keyboard and touch input;
- offline packaging;
- Unity host bridge;
- browser fallback for standalone development;
- Unity-owned high score persistence.

### Should ship
- gamepad input;
- small impact VFX / screen shake;
- traffic/roadside visual variation;
- rank grade on result screen;
- pause/resume propagation from Unity.

### Deferred unless evidence requires them
- additional tracks;
- additional vehicles;
- multiple cargo types;
- checkpoint time extensions;
- richer route graph;
- content data files separated from TypeScript;
- dedicated HUD/audio subsystems.

## Technical constraints

- Static web application; no server dependency at runtime.
- Must be runnable offline from locally packaged assets.
- Must tolerate WebView lifecycle pause/resume.
- Persistent state must not rely on browser localStorage as the authoritative store when hosted by Unity.
- Communication across the Unity/web boundary is serialized data, not direct access to Unity gameplay objects.
- Avoid broad `file://` assumptions in the integration contract; platform host code may expose bundled content through a virtual/local URL.
- No external physics engine.
- No React or DOM application framework.
- No ECS.
- Initial TypeScript gameplay code target: approximately 12 source files.

## Complexity budget

New abstractions require a demonstrated reason such as:

- a file has multiple independently changing responsibilities;
- a subsystem needs isolated automated tests;
- more than one concrete implementation exists;
- platform integration requires a seam;
- profiling identifies a performance-specific implementation boundary.

Anticipated future flexibility alone is not sufficient justification.

## Content budget

Initial production should remain within:

- 1 player car;
- 3 traffic silhouettes/variants;
- 1 environment family;
- 10–15 roadside props;
- 1 music track;
- ~8 SFX;
- 1 run with 1 branch.

If content production exceeds this before the core loop is validated, content work should stop and gameplay validation should resume.
