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
- five route-presentation zones within one environment family: `city`, `rural`, `forest`, `mountain-pass`, `tunnel`;
- result screen;
- keyboard and touch input;
- offline packaging;
- Unity host bridge;
- browser fallback for standalone development;
- Unity-owned high score persistence.

### Should ship
- gamepad input;
- small impact VFX / screen shake;
- deterministic traffic/roadside visual variation;
- clearly readable transitions between the five approved environment zones;
- rank grade on result screen;
- pause/resume propagation from Unity.

### Deferred unless evidence requires them
- additional tracks;
- additional vehicles;
- multiple cargo types;
- checkpoint time extensions;
- richer route graph;
- additional biome/environment families beyond the five approved route zones;
- content data files separated from TypeScript;
- dedicated HUD/audio/environment subsystems.

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
- No separate scene/renderer/gameplay system per environment zone.
- Initial TypeScript gameplay code target: approximately 12 source files.

## Complexity budget

New abstractions require a demonstrated reason such as:

- a file has multiple independently changing responsibilities;
- a subsystem needs isolated automated tests;
- more than one concrete implementation exists;
- platform integration requires a seam;
- profiling identifies a performance-specific implementation boundary.

Anticipated future flexibility alone is not sufficient justification.

The five environment zones do not, by themselves, justify `BiomeManager`, `EnvironmentSystem`, procedural-world grammar, 3D terrain, per-zone scenes or per-zone vehicle rules.

## Content budget

Initial production should remain within:

- 1 player car;
- 3 traffic behavior classes / approximately 4–6 traffic images;
- 1 coherent Japanese-night environment family expressed through 5 presentation zones;
- approximately 15–18 reusable roadside/environment props shared across zones;
- approximately 5–7 background/parallax images shared across zones;
- 1 music track;
- ~8 SFX;
- 1 run with 1 branch.

The normal total visual budget is approximately **38–53 unique runtime images** / **49–74 frames/images including variants**.

If content production exceeds this before the core loop and zone readability are validated, content work should stop and gameplay/composition validation should resume.

## Environment scope guardrail

Approved zone set:

```text
city
rural
forest
mountain-pass
tunnel
```

These are presentation profiles over shared systems/assets. They may vary:

- prop pool/density/spacing;
- background/parallax selection;
- practical-lighting pattern;
- authored curve/elevation tendencies;
- simple procedural tunnel enclosure.

They must not introduce:

- unique handling/physics;
- zone-specific traffic AI classes;
- independent biome asset packs;
- weather variants;
- full 3D terrain/building simulation;
- runtime scene loading per zone.

Detailed composition rules are authoritative in [`Environment-Zones-and-Roadside-Composition.md`](Environment-Zones-and-Roadside-Composition.md).
