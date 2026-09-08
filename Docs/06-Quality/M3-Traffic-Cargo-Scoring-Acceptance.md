# M3 Traffic / Cargo / Scoring Acceptance Checklist

This checklist records the validation evidence required before Milestone 3 is merged.

## Automated build gate

- [x] `npm ci`
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] production `dist/` static-host smoke test

## Traffic simulation

- [x] traffic is represented by the three frozen gameplay types: `car`, `van`, `truck`;
- [x] a fixed traffic pool is created once and vehicles are recycled ahead rather than continuously constructed/destroyed;
- [x] traffic longitudinal state uses monotonic route space rather than screen coordinates;
- [x] traffic projection uses current-frame `Road` projection data and therefore follows the same curves/hills/camera as road geometry;
- [x] traffic is drawn far-to-near after the road pass;
- [x] projected placeholders remain readable at 960x540 and do not show obvious curve-side inversion in the reviewed production screenshots.

## Collision / near miss

- [x] collision requires both swept longitudinal overlap and lateral overlap;
- [x] a synthetic high-speed crossing is detected even when step endpoints can move significantly in route space;
- [x] one vehicle can resolve only one collision interaction per pass;
- [x] collision produces type-specific cargo damage and speed retention;
- [x] near miss requires proximity outside the collision envelope followed by a completed pass;
- [x] one vehicle can award only one near miss per pass;
- [x] a collision-resolved pass cannot also award a near miss.

## Cargo / scoring

- [x] cargo starts at 100 and is clamped to `0..100`;
- [x] cargo reaching zero does not create a new fail state;
- [x] near miss awards driving score and increments combo;
- [x] repeated near misses build combo up to the configured cap;
- [x] collision resets combo to x1 and applies a bounded score penalty;
- [x] score cannot become negative;
- [x] result data carries score, cargo, near-miss count, collision count and best combo;
- [x] time bonus, cargo bonus and rank remain deferred to M4.

## Validation evidence

The branch-only M3 smoke harness performed two forms of validation and was removed before PR creation.

### Pure rule checks

A temporary TypeScript test exercised deterministic traffic/scoring/player logic without Phaser rendering. It confirmed:

- a center-matched pass against the first traffic car produces exactly one collision, `7` cargo damage and `0.68` speed retention;
- subsequent steps against that same pass do not double-hit;
- a nearby-but-non-overlapping pass produces exactly one near miss and no collision;
- two clean near misses produce scores `250` then `750` with combo progression x1 -> x2 -> x3;
- a collision then applies the configured penalty and resets combo to x1 while preserving best combo;
- `Player.applyCollision()` applies speed retention and cargo damage, including lower clamping at zero.

### Production-browser smoke

The production `dist/` build was exercised at 960x540 with continuous throttle and a short steering input. Reviewed screenshots confirmed:

- multiple traffic placeholders scale with perspective and sit on the projected road;
- traffic remains aligned through a curved-road state;
- the HUD exposes score/cargo/combo during the run;
- the automated run recorded a clean near miss (`SCORE 250`, `COMBO x2`) without cargo damage in the sampled path;
- the final ResultScene reported `SCORE 000250`, `CARGO 100%`, `NEAR MISS 1`, `BEST COMBO x2`, `COLLISIONS 0` and `ROUTE 100.0%`.

The browser path did not intentionally force a collision; collision/damage behavior is covered by the deterministic pure rule test above. Production collision feedback VFX/audio is explicitly M5 scope.

## Scope review

- [x] no physics engine or screen-space collision system was added;
- [x] no traffic subclasses, lane-changing AI, event bus or entity framework was added;
- [x] only the two runtime files already reserved by the 12-file architecture (`Traffic.ts`, `Scoring.ts`) were introduced;
- [x] procedural traffic visuals remain temporary and production sprite work remains M5 scope;
- [x] route branching and final 4–5 minute balance remain M4 scope.
