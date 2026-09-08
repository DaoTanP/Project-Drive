# M3 Traffic / Cargo / Scoring

## Goal

Establish the Night Courier risk/reward loop on top of the M2 complete-run lifecycle: projected traffic creates avoidance pressure, close clean passes build score/combo, and collisions trade speed plus cargo condition for lost score momentum.

## Runtime boundaries

M3 uses only the source modules already reserved by the frozen architecture:

- `Traffic.ts` owns fixed-pool traffic state, route-space movement, projection requests, collision and near-miss detection;
- `Scoring.ts` owns near-miss score, combo state, collision penalty and the M3 driving-score summary;
- `Player.ts` owns speed-loss and cargo-damage response;
- `Road.ts` exposes a small current-frame road-object projection query so traffic uses the exact same curve/hill/camera transform as the road;
- `GameScene.ts` remains the orchestration root and passes plain step results between modules;
- `GameState.ts` carries the final plain run-result performance fields without owning traffic/scoring behavior.

No event bus, entity framework, collision library, physics engine, traffic subclass hierarchy or new renderer layer is introduced.

## Traffic model

Traffic uses a small deterministic object pool. Each active vehicle has only the state needed for the initial game:

- gameplay type: `car`, `van` or `truck`;
- normalized lateral road position;
- monotonic route-space `z` position;
- forward speed;
- one-pass near-miss/collision resolution flags;
- reusable projection output storage.

Vehicles that fall sufficiently behind the player are recycled ahead using deterministic placement patterns. Runtime does not continuously construct/destroy traffic entities.

Production traffic sprites remain M5 scope. M3 intentionally uses procedural placeholders so gameplay rules can be validated before art production.

## Projection

Traffic does not perform an independent approximation of the road camera. `Road.render()` calculates the current projected road endpoints and crest clipping boundaries. After that road pass, `Road.projectObject()` interpolates an object's road-relative position from those current-frame projections.

This keeps:

- traffic visually aligned to curves and hills;
- road/traffic perspective consistent;
- hill crest clipping available to traffic;
- screen coordinates derived rather than authoritative.

## Collision

Collision remains in route/road space.

For each fixed simulation step, traffic compares the player/vehicle relative longitudinal interval before and after the step. The minimum swept separation is used, so a high-speed player cannot skip a meaningful overlap merely because both endpoints are outside the collision depth.

Collision also requires lateral overlap. Per-type tuning controls collision width, cargo damage and speed retention.

A traffic vehicle resolves at most one collision/near-miss interaction per pass. It is reset only when recycled for a future encounter.

## Near miss

A near miss requires:

1. entering a larger longitudinal/lateral proximity envelope outside the collision envelope;
2. successfully crossing from ahead of the player to behind the player;
3. no collision having resolved for that vehicle on the same pass.

The vehicle is armed while inside the clean proximity envelope and awards exactly once when the pass completes.

## Cargo

Cargo starts at 100 and is clamped to `0..100`. Collision damage is applied by `Player` together with collision speed retention.

Cargo reaching zero does **not** fail the run in the initial design. It remains a final-performance input; cargo bonus is still deferred to M4.

## Scoring

M3 scoring is deliberately small:

- each near miss awards a base amount multiplied by the current combo;
- a clean near miss increases combo up to a small cap;
- collision applies a small driving-score penalty and resets combo to x1;
- score never becomes negative;
- near-miss count, collision count and best combo are retained for the result screen.

The M3 `score` is the accumulated driving/event score. **Time bonus, cargo bonus and rank remain M4 responsibilities.**

## Explicit non-goals

M3 does not add:

- final art assets;
- traffic lane-changing/overtake AI;
- police or opponent behavior;
- roadside hazards;
- cargo failure state;
- package-specific cargo behavior;
- time/cargo end bonuses;
- rank calculation;
- route branching;
- audio/VFX feedback;
- generalized spatial indexing before measured need.
