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

## 3. Frame and simulation model

Phaser owns the host render frame. Gameplay advances through a small fixed-step accumulator inside `GameScene`.

Conceptual flow:

```text
Phaser frame delta
    -> clamp pathological frame gap
    -> add to accumulator
    -> run zero or more fixed simulation steps, with a bounded catch-up count
    -> render current state once
```

Initial simulation target: **60 Hz** (`1/60 s`). The exact maximum frame-gap clamp and catch-up count are tuning/robustness constants, not architecture.

Fixed-step simulation is preferred because road progression, collision envelopes, near-miss state and traffic behavior should not materially change with render-frame rate.

Do not introduce a separate simulation-clock service. The accumulator remains an orchestration detail of `GameScene` until proven otherwise.

Within each fixed simulation step:

```text
read normalized input
    -> update player arcade motion
    -> advance track position
    -> update traffic state
    -> resolve collision / near-miss state
    -> update scoring + timer
    -> detect run completion/failure
```

Projection and drawing use the resulting current state. On browser/WebView resume, accumulated wall-clock time must not be replayed as simulation time.

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

Vehicle tuning must remain independent from road tessellation. Do not encode an invariant that requires maximum vehicle speed to stay below one road segment per simulation step. If high-speed interaction later needs stronger guarantees, solve it in collision/progression logic rather than coupling game balance to segment length.

## 5. Road representation

The road uses two data levels inside `Road.ts`.

### Authored road sections

Compact section-level data expresses designer intent such as:

- approximate section length;
- target curve amount/direction;
- target elevation change;
- optional semantic identity needed later for branching/content placement.

Section data is not directly rendered.

### Compiled runtime segments

Authored sections are expanded into fixed-length runtime segments suitable for projection and lookup. A runtime segment conceptually contains:

- stable segment index / longitudinal range;
- curve contribution;
- two endpoints (`p1`, `p2`);
- endpoint world-space elevation/depth;
- transient camera/screen projection values or equivalent reusable projection storage;
- an occlusion/clipping boundary used when hills hide farther content.

This authoring/runtime distinction prevents track authoring concerns from leaking into the frame loop while keeping the complete subsystem inside one source file for the initial scope.

The first version keeps track data in `Road.ts`. Move it to JSON or dedicated data modules only when non-programmer editing or multiple tracks make that separation valuable.

## 6. Pseudo-3D projection model

Night Courier uses **projected road segments**, not raster scanline/Z-map rendering and not full polygonal 3D.

The core reasoning model is:

```text
world-space road endpoint
    -> subtract camera position
    -> camera-space point
    -> perspective scale based on depth
    -> projected screen center / vertical position / half-width
```

The renderer needs only enough perspective math to create convincing arcade depth. It does not require a full 3D transform hierarchy or arbitrary world rotation.

Important coordinate-space rules:

- longitudinal road distance remains a stable world/track-space quantity;
- lateral player/traffic position is represented in road-relative space where practical;
- screen-space position is derived output, never authoritative gameplay state;
- collision remains in road/track space because projected size changes continuously with depth.

## 7. Straight-road rendering and visibility

Visible runtime segments are queried from the player's/camera's current longitudinal position out to a bounded draw distance.

Road geometry is generated procedurally from the projected endpoints. The intended ordering is:

```text
road geometry: near -> far
projected sprites: far -> near
```

For road geometry, maintain a screen-space horizon/crest boundary while traversing visible segments. Segments whose projected road surface is fully hidden by nearer terrain are skipped. Each visible segment records enough clipping information for sprites behind a hill crest to be partially hidden rather than simply drawn over the terrain.

This is an occlusion technique, not a generalized scene-graph feature.

## 8. Curves

Curves are represented as a gradual lateral displacement of successive projected segments rather than arbitrary 3D road rotation.

Conceptual algorithm:

1. Read each segment's curve contribution.
2. Accumulate a lateral offset and a lateral-offset rate while traversing visible segments.
3. Apply the accumulated offset to projected road centers.
4. Initialize the accumulation using the player's fractional progress through the current base segment so crossing a segment boundary does not create a visible lateral snap.

Authored curves should transition through **enter / hold / leave** phases with easing rather than jumping immediately from zero curvature to full curvature. This provides smooth visual steering without introducing spline infrastructure.

S-curves and compound bends are compositions of these simple eased sections.

## 9. Hills and elevation

Hills use real authored/runtime elevation values on road endpoints. The same perspective projection used for the road handles the vertical effect.

Implementation order remains:

```text
straight road
    -> curves
    -> hills
```

Do not implement a separate hill renderer. Hills should primarily add:

- world-space elevation changes;
- camera/player elevation interpolation as needed;
- crest occlusion/clipping behavior.

## 10. Route branching

The initial route contains one meaningful branch, but this does not justify a generalized multiple-road renderer.

Preferred first approach:

```text
approach decision point
    -> collect left/right choice
    -> select subsequent authored section sequence
    -> continue through the same road subsystem
```

Only introduce simultaneous multi-road/fork geometry if playtesting proves that the branch is unreadable without it.

## 11. Traffic

Traffic entities are data, not subclasses:

```ts
interface TrafficCar {
  type: TrafficType;
  roadX: number;
  z: number;
  speed: number;
}
```

The initial behavior types remain only `car`, `van` and `truck`. Multiple sprites may map to the same behavior type; for example taxi and hatchback visuals both use `car`.

Traffic responsibilities:

- spawn/recycle cars based on track position;
- maintain longitudinal and lateral positions;
- project visible cars to screen;
- detect collision envelopes in road/track space;
- detect one-shot near-miss events.

A segment-indexed/bucketed lookup may be used later if it materially simplifies visible-traffic queries and collision lookahead. `Traffic.ts` remains the owner of traffic state even if it indexes vehicles by road segment.

Avoid screen-space collision because projected scale changes continuously.

## 12. Collision and near-miss

Use simplified road-space thresholds.

A collision requires overlapping longitudinal and lateral envelopes. A near miss requires entering a larger proximity envelope without entering the collision envelope, then successfully passing the vehicle.

Each traffic car must guard against awarding the same near miss multiple times.

If speed becomes large enough that a fixed step can cross meaningful collision distance, use bounded substeps or swept longitudinal checks. Do not solve this by forcing game speed to match road-segment length.

## 13. Scoring

`Scoring.ts` owns score rules. Suggested inputs:

- base near-miss award;
- combo multiplier;
- time remaining;
- cargo remaining;
- collision count if needed.

Exact numeric tuning is data/constants and should be changed through playtesting without structural changes.

## 14. Input normalization

All sources map to:

```ts
interface InputState {
  steer: number;    // -1..1
  throttle: number; // 0..1
  brake: number;    // 0..1
}
```

`Player` consumes only this shape. Touch/UI implementation details must not leak into driving logic.

## 15. Pause/resume

On pause:
- stop simulation progression;
- pause music/SFX if needed;
- retain current run state in memory.

On resume:
- ignore the accumulated browser/WebView time gap;
- reset/clamp the frame accumulator before simulation continues.

## 16. Asset loading, inventory and color baseline

Assets are packaged locally. Boot must fail visibly rather than start partially when required assets cannot be loaded.

The authoritative runtime inventory is [`../01-Design/Asset-Inventory-and-Sprite-Requirements.md`](../01-Design/Asset-Inventory-and-Sprite-Requirements.md). Final sprite production follows [`../01-Design/Art-Direction-and-Color-Palette.md`](../01-Design/Art-Direction-and-Color-Palette.md).

Runtime asset layout should converge on:

```text
WebGame/public/assets/
├── player/
├── traffic/
├── props/
├── backgrounds/
├── fx/
├── ui/
├── fonts/
└── audio/
```

Source art files must not be mixed into runtime folders.

Implementation should expose the `Night Courier 20` master colors as named constants/tokens rather than scattering ad-hoc hex values through rendering/HUD code. This is especially important for procedural road colors and semantic HUD states.

Do not add runtime palette-management architecture, shader-based palette swapping, custom asset databases or an asset validation framework unless production evidence demonstrates a need. A small typed/static token map and straightforward Phaser preload manifest are sufficient for the initial game.

### Sprite/runtime rules

- player, traffic and roadside props use authored sprites;
- road geometry, lane lines, simple HUD bars/text and basic screen effects stay procedural;
- vehicle and ground-standing prop pivots should be bottom-centered around their road/ground contact point;
- transparent padding must remain predictable across variants;
- directional props should be flipped at runtime where visually valid rather than duplicated;
- individual files are preferred while art is changing; atlasing is deferred until asset churn decreases or profiling/package evidence justifies it.

## 17. Pixel-art rendering constraints

- use nearest-neighbor filtering for pixel sprites;
- preserve consistent apparent pixel density between player, traffic, props and HUD;
- avoid accidental anti-aliasing on final sprite assets;
- avoid high-frequency subpixel movement on the hero vehicle and HUD where it causes shimmer;
- prefer integer-aligned UI placement where practical;
- procedural road rendering may use vector/polygon geometry, but its colors must remain inside the approved visual system;
- projected sprite scaling must preserve readable silhouettes and avoid unnecessary fractional-size oscillation where it produces visible shimmer.

## 18. Performance principles

- one WebView/game instance at a time;
- avoid unnecessary allocations in the frame loop;
- reuse projection/segment storage rather than creating transient objects per visible segment per frame;
- recycle traffic objects rather than continuously constructing/destroying them;
- limit visible road segments and prop density to what the target display can resolve;
- use logical resolution scaling rather than rendering at device-native resolution;
- avoid loading unused concept/source assets into the runtime build;
- profile target mobile hardware before adding optimization abstractions.

## 19. External research policy

Pseudo-3D road research is documented in [`Pseudo-3D-Road-Research-Notes.md`](Pseudo-3D-Road-Research-Notes.md).

External examples are used only to understand concepts, constraints and algorithms. Night Courier does not adopt their source organization, identifiers, helper APIs, constants, asset content or demo-specific implementation restrictions. The production implementation must be written independently for the project's Phaser/TypeScript architecture.

## 20. Error handling

Recoverable host errors should produce a controlled result/error message. Fatal asset/runtime initialization failures should display a minimal error state and allow exit instead of leaving a frozen canvas.
