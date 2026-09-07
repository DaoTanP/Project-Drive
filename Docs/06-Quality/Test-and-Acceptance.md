# Test and Acceptance

## 1. Quality strategy

Night Courier is small enough that quality should come from focused automated checks plus repeated gameplay/lifecycle validation, not a large test framework.

Priorities:

1. deterministic pure rules where practical;
2. browser production-build correctness;
3. gameplay acceptance through manual playtest;
4. Unity/WebView lifecycle reliability;
5. representative mobile performance.

## 2. Automated checks

### Mandatory on meaningful changes
- TypeScript typecheck passes.
- Production Vite build passes.
- Existing automated tests pass.

### High-value unit-test candidates
Prefer testing pure functions/logic such as:
- perspective projection invariants;
- score calculation;
- rank thresholds;
- cargo clamping;
- near-miss state transitions;
- message validation/serialization.

Do not unit-test Phaser rendering internals merely to increase coverage.

## 3. Road / rendering acceptance

- Straight road remains visually centered at neutral steering.
- Positive/negative curves bend consistently and reverse correctly.
- Hills do not invert segment ordering or produce visible projection explosions.
- Nearby segments occlude farther segments correctly enough for the visual style.
- Traffic/props scale consistently with projected depth.
- Resizing the viewport does not change simulation coordinates or break HUD layout.

## 4. Driving acceptance

- Acceleration reaches but does not exceed configured max speed.
- Brake response is stronger than passive deceleration.
- Steering remains controllable at high speed.
- A large resume frame delta cannot teleport the player down the track.
- Input release reliably returns throttle/brake/steer toward neutral.

## 5. Collision / cargo acceptance

- Collision is based on gameplay/road space, not accidental screen overlap.
- One contact event cannot repeatedly drain cargo every frame without intended cooldown/separation behavior.
- Collision visibly reduces speed.
- Cargo condition never exceeds 100 or falls below 0.
- Collision resets near-miss combo.

## 6. Near-miss acceptance

- A vehicle can award at most one near miss per successful pass.
- A true collision does not also award a near miss for the same pass.
- A pass outside the proximity threshold does not award score.
- Combo increments on valid consecutive near misses and resets on collision.

## 7. Run lifecycle acceptance

- New run starts from clean state.
- Timer decreases only while gameplay is active.
- Timeout produces a controlled failure/result state.
- Destination produces a controlled completion/result state.
- Restart creates a clean state without stale traffic/score/timer values.
- A normal run lands near the 4–5 minute target after tuning.

## 8. Route acceptance

- Route choice is clearly readable before commitment.
- Player enters exactly one branch.
- Both branches reconnect/complete correctly.
- Riskier branch demonstrates materially higher traffic/risk or shorter duration.
- Safer branch remains viable rather than strictly inferior.

## 9. Visual/art and asset acceptance

Production assets must conform to [`../01-Design/Asset-Inventory-and-Sprite-Requirements.md`](../01-Design/Asset-Inventory-and-Sprite-Requirements.md) and [`../01-Design/Art-Direction-and-Color-Palette.md`](../01-Design/Art-Direction-and-Color-Palette.md).

Acceptance criteria:

- Production sprites and UI use the authoritative `Night Courier 20` palette or documented derived/dimmed forms that preserve the same color roles.
- Dark/cool neutrals visibly dominate the scene; neon remains an accent rather than the majority of the frame.
- Practical warm lighting is present so the environment does not collapse into generic purple/cyan synthwave.
- The light neutral hero vehicle remains immediately distinguishable from traffic and the background at representative gameplay speed.
- The player has at least the five required steering poses and pose changes remain visually coherent.
- Traffic exposes only the approved `car`, `van`, `truck` gameplay types even when multiple visual sprites map to `car`.
- At least three traffic visuals are available before replacing traffic placeholders; additional visuals do not introduce new AI behavior implicitly.
- Traffic and gameplay hazards remain readable before collision distance.
- Far background layers have lower contrast/saturation than near gameplay layers.
- Roadside props remain readable at their intended projected distances without dominating the road/player silhouette.
- Vehicle and ground-standing prop pivots remain stable at the road/ground contact point during perspective scaling.
- Transparent padding is consistent enough that switching between player steering/brake variants does not visibly jump the vehicle.
- HUD semantic colors are consistent: positive cargo, caution, danger, score/time and combo states do not arbitrarily change hue between screens.
- Pixel assets render without unintended bilinear smoothing.
- Player/HUD sprites do not exhibit distracting subpixel shimmer during representative movement/scaling.
- A visual pass does not require adding colors outside the master palette unless a documented material/readability problem exists.
- Simple shapes/text that are defined as procedural have not been unnecessarily converted into large sprite sets.
- Runtime asset folders contain only assets used or explicitly required by the current production inventory.

## 10. Asset package acceptance

Before release candidate packaging:

- all required runtime images load from local paths;
- font files are local and redistribution licensing has been checked;
- music/SFX are local and legally usable in the target commercial context;
- no source PSD/Aseprite/working files are present in `dist/`;
- no unused concept/reference images are present in `dist/`;
- required assets remain within the expected small production budget unless a reviewed exception exists;
- no runtime asset requires a CDN/public URL;
- filenames and paths remain deterministic across browser and Unity/WebView packaging.

## 11. Host bridge acceptance

- `READY` is emitted once the game can safely accept `INIT`.
- Invalid/unsupported message versions are rejected safely.
- Missing required INIT fields use explicit defaults only where documented; otherwise fail cleanly.
- `PAUSE` stops run progression.
- `RESUME` does not apply elapsed background time as simulation delta.
- `GAME_COMPLETED` payload values are within documented ranges.
- Unity validates payload before save.
- WebView can be destroyed and recreated without duplicate callbacks or stale state.
- Second launch in the same Unity process behaves like the first.

## 12. Offline acceptance

Test with network unavailable:
- page loads;
- all scripts/styles load;
- all required sprites/fonts/audio load;
- full run can complete;
- Unity result round trip works.

No required runtime resource may originate from a CDN or public URL.

## 13. Performance acceptance

Exact budgets should be established on the actual target device rather than invented in advance. Initial acceptance is behavioral:

- no sustained visible frame pacing failure during representative traffic density;
- no progressive memory growth across repeated runs;
- no retained active WebView after exit;
- no large GC/allocation spikes caused by per-frame traffic churn;
- touch input remains responsive under representative load;
- art replacement does not cause unacceptable texture-memory/decode spikes on the representative target device.

If profiling identifies a bottleneck, document measured evidence before adding optimization architecture.

## 14. Defect severity

- **P0:** crash, corrupt host state/save, impossible to exit, security-critical integration failure.
- **P1:** cannot complete a normal run, major input/rendering failure, repeated WebView lifecycle failure.
- **P2:** scoring/balance/visual defect with workaround or limited impact.
- **P3:** cosmetic/polish issue.

Release baseline: no known P0 or P1 defects.

## 15. Product acceptance checklist

A release candidate is acceptable when:

- [ ] Core controls are immediately understandable.
- [ ] One complete 4–5 minute run works.
- [ ] Cargo condition changes player risk decisions.
- [ ] Near-miss scoring creates intentional score-chasing behavior.
- [ ] Route split provides a meaningful but simple choice.
- [ ] Player/traffic remain clearly readable at gameplay speed under the approved art direction.
- [ ] Required production assets satisfy the authoritative asset inventory without requiring deferred systems.
- [ ] Browser standalone build works.
- [ ] Offline Unity WebView build works.
- [ ] Result persists through Unity.
- [ ] Repeated launch/close cycle is stable.
- [ ] No deferred feature is necessary to explain or complete the core loop.
