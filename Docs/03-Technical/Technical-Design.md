# Technical Design

## 1. Technology baseline

- Language: TypeScript
- Game framework: Phaser 4
- Build/dev server: Vite
- Rendering: Phaser WebGL with Canvas fallback where supported
- Physics: custom arcade math only
- Runtime assets: static local files
- Persistence: host-owned when running under Unity

Exact dependency patch versions are established by the initial lockfile and upgraded deliberately, not implicitly.

## 2. Logical resolution

Initial target logical resolution: `960 x 540` (16:9).

The canvas scales to the available viewport while gameplay coordinates remain stable. Native device resolution must not directly define simulation coordinates.

For pixel assets, nearest-neighbor scaling is the default. Avoid filtering that softens sprite pixels or causes inconsistent visual density between assets.

## 3. Frame model

`GameScene.update()` converts frame delta to seconds and coordinates subsystems:

```text
read normalized input
    -> update player arcade motion
    -> advance track position
    -> update/project traffic
    -> resolve collisions / near misses
    -> update scoring + timer
    -> render/update HUD
    -> detect run completion/failure
```

Clamp extreme frame deltas after backgrounding/resume to prevent simulation jumps.

## 4. Player simulation

Minimum state:

```ts
interface PlayerState {
  speed: number;
  roadX: number;       // normalized lateral road position
  cargoHealth: number; // 0..100
}
```

Representative rules:

- acceleration raises speed toward `maxSpeed`;
- brake reduces speed more strongly than passive drag;
- steering rate scales with speed but is capped for control stability;
- off-road position applies speed penalty if off-road play is supported visually;
- collision applies speed loss and cargo damage.

No rigid-body solver is required.

## 5. Road representation

Use ordered road segments with compact authored data, for example:

```ts
interface RoadSegmentSpec {
  length: number;
  curve: number;
  hill: number;
}
```

Road rendering projects visible segments from world/track space into screen space. Each segment provides the projected center, vertical position and half-width needed to draw road quads/trapezoids and position sprites.

The first version keeps track data in `Road.ts`. Move it to JSON or dedicated data modules only when non-programmer editing or multiple tracks make that separation valuable.

## 6. Pseudo-3D rendering

Pipeline:

```text
track segment
 -> camera-relative depth
 -> perspective scale
 -> projected screen center/height/width
 -> road polygon
 -> traffic/prop sprite projection
```

Rendering must be back-to-front for visible road segments/sprites where overlap requires it.

The visual target is convincing arcade depth, not geometric 3D correctness.

Depth readability also uses the approved art-direction rules: distant layers use lower contrast/saturation subsets of the master palette while near gameplay objects retain the widest allowed value range.

## 7. Traffic

Traffic entities are data, not subclasses:

```ts
interface TrafficCar {
  type: TrafficType;
  roadX: number;
  z: number;
  speed: number;
}
```

Traffic responsibilities:

- spawn/recycle cars based on track position;
- maintain longitudinal and lateral positions;
- project visible cars to screen;
- detect collision envelopes in road/track space;
- detect one-shot near-miss events.

Avoid screen-space collision because projected scale changes continuously.

## 8. Collision and near-miss

Use simplified road-space thresholds.

A collision requires overlapping longitudinal and lateral envelopes. A near miss requires entering a larger proximity envelope without entering the collision envelope, then successfully passing the vehicle.

Each traffic car must guard against awarding the same near miss multiple times.

## 9. Scoring

`Scoring.ts` owns score rules. Suggested inputs:

- base near-miss award;
- combo multiplier;
- time remaining;
- cargo remaining;
- collision count if needed.

Exact numeric tuning is data/constants and should be changed through playtesting without structural changes.

## 10. Input normalization

All sources map to:

```ts
interface InputState {
  steer: number;    // -1..1
  throttle: number; // 0..1
  brake: number;    // 0..1
}
```

`Player` consumes only this shape. Touch/UI implementation details must not leak into driving logic.

## 11. Pause/resume

On pause:
- stop simulation progression;
- pause music/SFX if needed;
- retain current run state in memory.

On resume:
- ignore the accumulated browser/WebView time gap;
- restart with a clamped/zeroed first delta.

## 12. Asset loading and color baseline

Assets are packaged locally. Boot must fail visibly rather than start partially when required assets cannot be loaded.

Asset categories:
- player car sprites;
- traffic sprites;
- road/background/prop sprites;
- HUD assets if needed;
- one music track;
- SFX.

Final sprite production follows [`../01-Design/Art-Direction-and-Color-Palette.md`](../01-Design/Art-Direction-and-Color-Palette.md).

Implementation should expose the `Night Courier 20` master colors as named constants/tokens rather than scattering ad-hoc hex values through rendering/HUD code. This is especially important for procedural road colors and semantic HUD states.

Do not add runtime palette-management architecture, shader-based palette swapping or an asset validation framework unless production evidence demonstrates a need. A small typed/static token map is sufficient for the initial game.

## 13. Pixel-art rendering constraints

- use nearest-neighbor filtering for pixel sprites;
- preserve consistent apparent pixel density between player, traffic, props and HUD;
- avoid accidental anti-aliasing on final sprite assets;
- avoid high-frequency subpixel movement on the hero vehicle and HUD where it causes shimmer;
- prefer integer-aligned UI placement where practical;
- procedural road rendering may use vector/polygon geometry, but its colors must remain inside the approved visual system.

## 14. Performance principles

- one WebView/game instance at a time;
- avoid unnecessary allocations in the frame loop;
- recycle traffic objects rather than continuously constructing/destroying them;
- limit visible road segments and prop density to what the target display can resolve;
- use logical resolution scaling rather than rendering at device-native resolution;
- profile target mobile hardware before adding optimization abstractions.

## 15. Error handling

Recoverable host errors should produce a controlled result/error message. Fatal asset/runtime initialization failures should display a minimal error state and allow exit instead of leaving a frozen canvas.
