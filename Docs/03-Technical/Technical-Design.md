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
    -> advance route position
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
- environment-zone identity;
- optional route/branch semantics;
- optional authored landmark placements.

Section data is not directly rendered.

### Compiled runtime segments

Authored sections are expanded into fixed-length runtime segments suitable for projection and lookup. A runtime segment conceptually contains:

- stable segment index / longitudinal range;
- curve contribution;
- two endpoints (`p1`, `p2`);
- endpoint world-space elevation/depth;
- semantic zone/placement metadata or a stable reference to it;
- transient camera/screen projection values or equivalent reusable projection storage;
- an occlusion/clipping boundary used when hills hide farther content.

This authoring/runtime distinction prevents track authoring concerns from leaking into the frame loop while keeping the complete subsystem inside one source file for the initial scope.

The first version keeps route/zone data in `Road.ts`. Move it to JSON or dedicated data modules only when non-programmer editing or multiple tracks make that separation valuable.

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
- lateral player/traffic/roadside position is represented in road-relative space where practical;
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

Preferred route/environment mapping:

```text
city
 -> rural/outskirts
 -> branch
    -> short/risky: mountain-pass -> tunnel
    -> long/safer: forest -> rural
 -> city-fringe/depot finish
```

Only introduce simultaneous multi-road/fork geometry if playtesting proves that the branch is unreadable without it.

## 11. Environment zones and roadside composition

The initial route uses exactly five presentation zones:

```ts
type EnvironmentZone =
  | 'city'
  | 'rural'
  | 'forest'
  | 'mountain-pass'
  | 'tunnel';
```

These are authored presentation semantics, not new gameplay modes or scene boundaries.

The authoritative design/composition rules are defined in [`../01-Design/Environment-Zones-and-Roadside-Composition.md`](../01-Design/Environment-Zones-and-Roadside-Composition.md).

### 11.1 Ownership

Keep the initial implementation inside existing boundaries:

- `Road.ts` owns authored section zone metadata, deterministic roadside-placement rules and the projection query needed by roadside objects;
- `GameScene` orchestrates drawing order and shared Phaser objects if required;
- no `BiomeManager`, `EnvironmentSystem`, generalized prop ECS or scene-per-zone architecture is introduced.

Extraction is allowed only if implementation evidence later proves `Road.ts` has an independently changing presentation responsibility large enough to justify it.

### 11.2 Environment profile intent

A zone may conceptually resolve a compact profile such as:

```ts
interface EnvironmentProfile {
  propPool: readonly PropId[];
  density: number;
  backgroundProfile: BackgroundProfileId;
  lightingProfile: LightingProfileId;
}
```

This is an example of data shape, not a required exported API. Zone differences should remain tuning/content data rather than subclass behavior.

### 11.3 Deterministic roadside placement

Ambient roadside props must be stable across repeated runs of the same route/branch.

Do not call frame-time random placement.

Stable placement should derive conceptually from:

```text
segment index
+ route/branch id
+ environment zone
+ stable seed
```

Two placement types are enough:

- **authored landmark:** explicit route-choice sign, tunnel portal, destination marker, major gantry;
- **deterministic ambient:** streetlights, guardrails, utility poles, trees, rocks, reflectors and minor signs.

A compact prop rule may express:

- allowed zones;
- left/right/both side policy;
- road-edge offset;
- target/minimum spacing;
- density/weight;
- mirror permission;
- optional `inside-curve` / `outside-curve` preference.

Chevron/caution props should prefer the outside of curves when this improves bend readability.

### 11.4 Projected roadside sprites

Roadside objects use the same camera/road projection model as traffic.

Conceptual object state:

```text
route/segment position
+ road-relative lateral offset
+ authored ground/pivot height
    -> road projection query
    -> screen x/y/scale
    -> apply segment crest clip
```

Roadside screen coordinates are derived every render; object world/route placement remains authoritative.

Render projected roadside objects far-to-near and apply the current segment/crest clipping boundary so trees/signs/rocks behind hills do not draw over foreground terrain.

### 11.5 Zone transitions

Zone changes should be authored across several sections where practical.

Prefer:

1. introduce next-zone signature assets at low density;
2. reduce previous-zone density/background contribution;
3. preserve shared infrastructure across the boundary;
4. reach the next zone's normal profile after the transition distance.

Tunnel portal entry/exit is the deliberate exception where enclosure can change sharply at an authored landmark.

### 11.6 Background/parallax selection

Backgrounds remain a small shared set, approximately **5–7 images** total.

Do not load a unique three-layer background stack for each zone.

Recommended reuse:

- city far/mid building layers for `city`;
- distant ridge reused by `rural`, `forest`, `mountain-pass`;
- vegetation/tree-line layer reused by `rural` and `forest`;
- optional near natural layer selectively reused by `forest`/`mountain-pass`;
- normal outdoor parallax disabled/replaced while in `tunnel`.

### 11.7 Tunnel rendering

Tunnel remains the same road simulation and projection.

Preferred implementation uses:

- authored portal landmark sprite/element;
- procedural projected side-wall bands/quads derived from visible road edges;
- simple dark upper-frame/ceiling enclosure treatment;
- repeated projected tunnel lights/reflectors/caution props;
- outdoor parallax disabled or visually suppressed inside.

Do not implement a full 3D tunnel mesh, raycast environment or a separate Phaser Scene.

If simple projected wall bands cannot achieve acceptable readability, document the concrete visual failure before expanding the renderer.

### 11.8 Zone-specific geometry remains authored road data

Environment zones may correlate with different road tendencies, but they do not alter vehicle simulation:

- `city`: mild elevation, medium curves, denser infrastructure;
- `rural`: gentle curves, rolling elevation, open sightlines;
- `forest`: flowing curves, moderate elevation, safer sightlines;
- `mountain-pass`: tighter curves, stronger elevation, shorter sightlines;
- `tunnel`: readable bends/mild elevation, enclosure instead of outdoor scenery.

Do not add zone-specific handling, friction, physics or collision rules.

## 12. Traffic

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

- spawn/recycle cars based on route position;
- maintain longitudinal and lateral positions;
- project visible cars to screen;
- detect collision envelopes in road/track space;
- detect one-shot near-miss events.

Traffic behavior does not change by environment zone unless later playtesting identifies a specific balance requirement. Visual composition may vary traffic density only if it remains simple tuning rather than zone-specific AI.

Avoid screen-space collision because projected scale changes continuously.

## 13. Collision and near-miss

Use simplified road-space thresholds.

A collision requires overlapping longitudinal and lateral envelopes. A near miss requires entering a larger proximity envelope without entering the collision envelope, then successfully passing the vehicle.

Each traffic car must guard against awarding the same near miss multiple times.

If speed becomes large enough that a fixed step can cross meaningful collision distance, use bounded substeps or swept longitudinal checks. Do not solve this by forcing game speed to match road-segment length.

## 14. Scoring

`Scoring.ts` owns score rules. Suggested inputs:

- base near-miss award;
- combo multiplier;
- time remaining;
- cargo remaining;
- collision count if needed.

Exact numeric tuning is data/constants and should be changed through playtesting without structural changes.

Environment zone does not directly multiply score in the initial version. Branch risk/reward should emerge from route length, geometry, traffic density and final time/cargo outcome rather than a hidden biome bonus.

## 15. Input normalization

All sources map to:

```ts
interface InputState {
  steer: number;    // -1..1
  throttle: number; // 0..1
  brake: number;    // 0..1
}
```

`Player` consumes only this shape. Touch/UI implementation details must not leak into driving logic.

## 16. Pause/resume

On pause:
- stop simulation progression;
- pause music/SFX if needed;
- retain current run state in memory.

On resume:
- ignore the accumulated browser/WebView time gap;
- reset/clamp the frame accumulator before simulation continues.

## 17. Asset loading, inventory and color baseline

Assets are packaged locally. Boot must fail visibly rather than start partially when required assets cannot be loaded.

The authoritative runtime inventory is [`../01-Design/Asset-Inventory-and-Sprite-Requirements.md`](../01-Design/Asset-Inventory-and-Sprite-Requirements.md). Final sprite production follows [`../01-Design/Art-Direction-and-Color-Palette.md`](../01-Design/Art-Direction-and-Color-Palette.md) and [`../01-Design/Environment-Zones-and-Roadside-Composition.md`](../01-Design/Environment-Zones-and-Roadside-Composition.md).

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

Source art files must not be mixed into runtime folders. Do not create zone-specific top-level runtime directories while the shared inventory remains small.

Implementation should expose the `Night Courier 20` master colors as named constants/tokens rather than scattering ad-hoc hex values through rendering/HUD code. This is especially important for procedural road/tunnel colors and semantic HUD states.

Do not add runtime palette-management architecture, shader-based palette swapping, custom asset databases or an asset validation framework unless production evidence demonstrates a need. A small typed/static token map and straightforward Phaser preload manifest are sufficient for the initial game.

### Sprite/runtime rules

- player, traffic and roadside props use authored sprites;
- road geometry, lane lines, simple tunnel enclosure, simple HUD bars/text and basic screen effects stay procedural;
- vehicle and ground-standing prop pivots should be bottom-centered around their road/ground contact point;
- transparent padding must remain predictable across variants;
- directional props should be flipped at runtime where visually valid rather than duplicated;
- individual files are preferred while art is changing; atlasing is deferred until asset churn decreases or profiling/package evidence justifies it.

## 18. Pixel-art rendering constraints

- use nearest-neighbor filtering for pixel sprites;
- preserve consistent apparent pixel density between player, traffic, props and HUD;
- avoid accidental anti-aliasing on final sprite assets;
- avoid high-frequency subpixel movement on the hero vehicle and HUD where it causes shimmer;
- prefer integer-aligned UI placement where practical;
- procedural road/tunnel rendering may use vector/polygon geometry, but its colors must remain inside the approved visual system;
- projected sprite scaling must preserve readable silhouettes and avoid unnecessary fractional-size oscillation where it produces visible shimmer.

## 19. Performance principles

- one WebView/game instance at a time;
- avoid unnecessary allocations in the frame loop;
- reuse projection/segment storage rather than creating transient objects per visible segment per frame;
- recycle traffic objects rather than continuously constructing/destroying them;
- derive deterministic ambient prop placement without rebuilding a large object graph every frame;
- limit visible road segments and prop density to what the target display can resolve;
- use logical resolution scaling rather than rendering at device-native resolution;
- avoid loading unused zone/concept/source assets into the runtime build;
- profile target mobile hardware before adding optimization abstractions.

## 20. External research policy

Pseudo-3D road research is documented in [`Pseudo-3D-Road-Research-Notes.md`](Pseudo-3D-Road-Research-Notes.md).

External examples are used only to understand concepts, constraints and algorithms. Night Courier does not adopt their source organization, identifiers, helper APIs, constants, asset content or demo-specific implementation restrictions. The production implementation must be written independently for the project's Phaser/TypeScript architecture.

## 21. Error handling

Recoverable host errors should produce a controlled result/error message. Fatal asset/runtime initialization failures should display a minimal error state and allow exit instead of leaving a frozen canvas.
