# Test and Acceptance

## 1. Quality strategy

Night Courier is small enough that quality should come from focused automated checks plus repeated gameplay/lifecycle validation, not a large test framework.

Priorities:

1. deterministic pure rules where practical;
2. browser production-build correctness;
3. gameplay and environment-composition acceptance through manual playtest;
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
- deterministic roadside-placement stability;
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
- Projected roadside props behind hill crests respect clipping instead of drawing over foreground terrain.
- Tunnel enclosure remains aligned with projected road edges through bends/elevation.
- Resizing the viewport does not change simulation coordinates or break HUD layout.

## 4. Driving acceptance

- Acceleration reaches but does not exceed configured max speed.
- Brake response is stronger than passive deceleration.
- Steering remains controllable at high speed.
- A large resume frame delta cannot teleport the player down the track.
- Input release reliably returns throttle/brake/steer toward neutral.
- Environment-zone changes do not alter vehicle handling unless a separately approved gameplay requirement exists.

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
- Short/risky branch is materially shorter and/or harder through route geometry/traffic pressure.
- Long/safer branch remains viable rather than strictly inferior.
- Route-choice communication uses both a UI/sign cue and environmental preview before commitment.
- If simultaneous visible fork geometry is not implemented, branch selection still feels spatially coherent rather than like an arbitrary menu teleport.

## 9. Environment-zone acceptance

Authoritative environment rules are defined in [`../01-Design/Environment-Zones-and-Roadside-Composition.md`](../01-Design/Environment-Zones-and-Roadside-Composition.md).

### Zone identity

At representative gameplay speed, a player should identify each zone within a few seconds from composition/silhouette without reading a literal zone label:

- `city`: dense building/infrastructure/commercial-light identity;
- `rural`: sparse utility/vegetation/negative-space identity;
- `forest`: dark tree/vegetation mass with reduced lighting;
- `mountain-pass`: guardrail/chevron/rock silhouette with stronger curve/elevation cues;
- `tunnel`: enclosed dark side/upper frame with rhythmic practical fixtures.

### Coherence

- All five zones remain visibly part of one Night Courier night route and one master palette.
- Zone changes rely primarily on shared prop vocabulary, density, lighting and backgrounds rather than unrelated art styles.
- Neon remains concentrated mainly in city/commercial accents; forest/pass/tunnel do not inherit city-neon density merely for variety.

### Transitions

- City-to-rural and rural-to-natural transitions do not replace all scenery in a single ordinary segment.
- Shared props/infrastructure bridge adjacent zones where appropriate.
- Signature assets appear before or as the next zone reaches normal density.
- Tunnel portal entry/exit is allowed to be a deliberate sharper transition.
- No transition causes obvious background/prop pop or one-frame re-randomization.

### Determinism

- Replaying the same route/branch with the same authored data produces the same ambient roadside layout.
- Ambient props do not change side/spacing when render frame rate changes.
- Restarting a run does not cause uncontrolled layout re-roll unless a future explicitly approved seed feature is introduced.

### Tunnel

- Tunnel approach provides a visible portal/warning cue.
- Interior outdoor parallax is disabled/suppressed cleanly.
- Side-wall/ceiling enclosure does not cover the player/HUD or invert through road curves.
- Repeating lights/reflectors preserve a readable sense of speed and direction.
- Tunnel exit returns to outdoor presentation without a separate scene load or visible simulation discontinuity.

## 10. Visual/art and asset acceptance

Production assets must conform to [`../01-Design/Asset-Inventory-and-Sprite-Requirements.md`](../01-Design/Asset-Inventory-and-Sprite-Requirements.md), [`../01-Design/Art-Direction-and-Color-Palette.md`](../01-Design/Art-Direction-and-Color-Palette.md) and [`../01-Design/Environment-Zones-and-Roadside-Composition.md`](../01-Design/Environment-Zones-and-Roadside-Composition.md).

Acceptance criteria:

- Production sprites and UI use the authoritative `Night Courier 20` palette or documented derived/dimmed forms that preserve the same color roles.
- Dark/cool neutrals visibly dominate the scene; neon remains an accent rather than the majority of the frame.
- Practical warm lighting is present so the environment does not collapse into generic purple/cyan synthwave.
- The light neutral hero vehicle remains immediately distinguishable from traffic and the background at representative gameplay speed in all five zones.
- The player has at least the five required steering poses and pose changes remain visually coherent.
- Traffic exposes only the approved `car`, `van`, `truck` gameplay types even when multiple visual sprites map to `car`.
- At least three traffic visuals are available before replacing traffic placeholders; additional visuals do not introduce new AI behavior implicitly.
- Traffic and gameplay hazards remain readable before collision distance.
- Far background layers have lower contrast/saturation than near gameplay layers.
- Roadside props remain readable at their intended projected distances without dominating the road/player silhouette.
- The shared prop inventory is sufficient to distinguish all five zones before commissioning independent zone packs.
- Vehicle and ground-standing prop pivots remain stable at the road/ground contact point during perspective scaling.
- Transparent padding is consistent enough that switching between player steering/brake variants does not visibly jump the vehicle.
- HUD semantic colors are consistent: positive cargo, caution, danger, score/time and combo states do not arbitrarily change hue between screens.
- Pixel assets render without unintended bilinear smoothing.
- Player/HUD sprites do not exhibit distracting subpixel shimmer during representative movement/scaling.
- A visual pass does not require adding colors outside the master palette unless a documented material/readability problem exists.
- Simple shapes/text/tunnel enclosure defined as procedural have not been unnecessarily converted into large sprite sets.
- Runtime asset folders contain only assets used or explicitly required by the current production inventory.

## 11. Asset package acceptance

Before release candidate packaging:

- all required runtime images load from local paths;
- font files are local and redistribution licensing has been checked;
- music/SFX are local and legally usable in the target commercial context;
- no source PSD/Aseprite/working files are present in `dist/`;
- no unused concept/reference images are present in `dist/`;
- required assets normally remain around **38–53 unique images / 49–74 frames/images including variants** unless a reviewed exception exists;
- roadside/environment assets normally remain around **15–18 shared props** and **5–7 shared background/parallax images** rather than independent per-zone packs;
- no runtime asset requires a CDN/public URL;
- filenames and paths remain deterministic across browser and Unity/WebView packaging.

## 12. Host bridge acceptance

- `READY` is emitted once the game can safely accept `INIT`.
- Invalid/unsupported message versions are rejected safely.
- Missing required INIT fields use explicit defaults only where documented; otherwise fail cleanly.
- `PAUSE` stops run progression.
- `RESUME` does not apply elapsed background time as simulation delta.
- `GAME_COMPLETED` payload values are within documented ranges.
- Unity validates payload before save.
- WebView can be destroyed and recreated without duplicate callbacks or stale state.
- Second launch in the same Unity process behaves like the first.

## 13. Offline acceptance

Test with network unavailable:
- page loads;
- all scripts/styles load;
- all required sprites/fonts/audio load;
- all five zone presentations use only bundled/local runtime resources;
- full run can complete;
- Unity result round trip works.

No required runtime resource may originate from a CDN or public URL.

## 14. Performance acceptance

Exact budgets should be established on the actual target device rather than invented in advance. Initial acceptance is behavioral:

- no sustained visible frame pacing failure during dense city composition;
- no sustained visible frame pacing failure during forest/mountain roadside density;
- tunnel enclosure/fixture rendering does not create a distinct frame-pacing regression;
- no progressive memory growth across repeated runs;
- no retained active WebView after exit;
- no large GC/allocation spikes caused by per-frame traffic or roadside-prop churn;
- touch input remains responsive under representative load;
- art replacement does not cause unacceptable texture-memory/decode spikes on the representative target device.

If profiling identifies a bottleneck, document measured evidence before adding optimization architecture.

## 15. Defect severity

- **P0:** crash, corrupt host state/save, impossible to exit, security-critical integration failure.
- **P1:** cannot complete a normal run, major input/rendering failure, repeated WebView lifecycle failure.
- **P2:** scoring/balance/visual/zone-composition defect with workaround or limited impact.
- **P3:** cosmetic/polish issue.

Release baseline: no known P0 or P1 defects.

## 16. Product acceptance checklist

A release candidate is acceptable when:

- [ ] Core controls are immediately understandable.
- [ ] One complete 4–5 minute run works.
- [ ] Cargo condition changes player risk decisions.
- [ ] Near-miss scoring creates intentional score-chasing behavior.
- [ ] Route split provides a meaningful but simple choice.
- [ ] `city`, `rural`, `forest`, `mountain-pass` and `tunnel` are visually distinguishable at gameplay speed.
- [ ] Both branches communicate different route/environment risk profiles.
- [ ] Environment transitions remain coherent and deterministic.
- [ ] Player/traffic remain clearly readable in every zone under the approved art direction.
- [ ] Required production assets satisfy the authoritative asset inventory without requiring independent biome packs or deferred systems.
- [ ] Browser standalone build works.
- [ ] Offline Unity WebView build works.
- [ ] Result persists through Unity.
- [ ] Repeated launch/close cycle is stable.
- [ ] No deferred feature is necessary to explain or complete the core loop.
