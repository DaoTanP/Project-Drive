# Task Backlog

This backlog is ordered for implementation. Tasks should remain small enough to validate independently and should not introduce deferred systems unless a blocking requirement is demonstrated.

## M0 — Bootstrap

- [x] M0.1 Initialize Vite + TypeScript project under `WebGame/`.
- [x] M0.2 Add Phaser 4 and commit the package lockfile.
- [x] M0.3 Configure 960x540 logical resolution and responsive scaling.
- [x] M0.4 Add `dev`, `build` and `typecheck` scripts.
- [x] M0.5 Add minimal Boot/Game/Result scene flow.
- [x] M0.6 Verify production `dist/` runs from a local static host.

## M1 — Road / player slice

M1 uses the algorithmic guidance summarized in [`../03-Technical/Pseudo-3D-Road-Research-Notes.md`](../03-Technical/Pseudo-3D-Road-Research-Notes.md), but implementation must remain original to Night Courier's Phaser/TypeScript architecture.

**Status:** implementation and automated/browser smoke validation complete. Human control-feel/continuous curve-transition acceptance remains recorded in [`../06-Quality/M1-Road-Player-Acceptance.md`](../06-Quality/M1-Road-Player-Acceptance.md).

- [x] M1.1 Define compact authored `RoadSectionSpec` data and the internal fixed-length runtime road-segment/endpoint model in `Road.ts`.
- [x] M1.2 Compile authored sections into runtime segments and implement stable segment lookup/interpolation by track position.
- [x] M1.3 Implement world -> camera -> screen perspective projection with bounded visible-segment lookup.
- [x] M1.4 Render a straight procedural road near-to-far, including a basic crest/max-visible-Y rejection boundary.
- [x] M1.5 Add curves using accumulated lateral displacement, fractional-base-segment continuity and simple enter/hold/leave easing.
- [x] M1.6 Add hills/elevation and crest clipping only after straight/curve projection is stable.
- [x] M1.7 Implement normalized keyboard input.
- [x] M1.8 Implement acceleration, drag/braking and max speed without coupling vehicle tuning to road-segment length.
- [x] M1.9 Implement lateral steering and tune any curve-induced lateral effect as arcade behavior rather than physical simulation.
- [x] M1.10 Add a bounded 60 Hz fixed-step simulation accumulator and discard/clamp abnormal frame gaps after focus/lifecycle changes.

### M1 explicit non-goals

Do not add during M1:

- traffic;
- roadside sprite system beyond debug/projection proof if strictly needed;
- generalized track editor/JSON pipeline;
- multiple-road/fork renderer;
- generic 3D transform framework;
- separate simulation-clock service;
- one Phaser GameObject per road segment;
- copied source structure or implementation from external racer references.

## M2 — Run lifecycle

**Status:** implementation, pure lifecycle-rule validation and production-browser timeout/restart/completion smoke validation complete. Final route duration remains explicitly deferred to M4.

- [x] M2.1 Add `GameState` initialization.
- [x] M2.2 Track world/route progress.
- [x] M2.3 Add run timer.
- [x] M2.4 Add destination completion condition.
- [x] M2.5 Add timeout failure condition.
- [x] M2.6 Implement ResultScene summary.
- [x] M2.7 Implement standalone restart.

M2 uses a temporary 30-second / 60%-of-demo-road validation run only. It does not change the design target of a 4–5 minute final run.

## M3 — Traffic / cargo / scoring

**Status:** implementation, deterministic rule validation and production-browser traffic/result smoke validation complete. Production vehicle art and impact/near-miss feedback remain M5 scope; final time/cargo bonuses and rank remain M4 scope.

- [x] M3.1 Define traffic data model with only `car`, `van` and `truck` gameplay types.
- [x] M3.2 Implement fixed-pool traffic spawn/recycling.
- [x] M3.3 Project traffic into road view using current-frame road projection data; no additional spatial index was justified at this scope.
- [x] M3.4 Implement road-space collision envelopes with swept longitudinal handling for crossed-range interaction.
- [x] M3.5 Apply speed loss on collision.
- [x] M3.6 Add cargo condition and collision damage.
- [x] M3.7 Implement near-miss proximity/arming state.
- [x] M3.8 Prevent duplicate collision/near-miss awards per vehicle pass.
- [x] M3.9 Implement combo multiplier/reset and bounded collision penalty.
- [x] M3.10 Implement M3 driving-score result calculation and result summary fields; final time/cargo bonuses remain M4.

See [`M3-Traffic-Cargo-Scoring.md`](M3-Traffic-Cargo-Scoring.md) and [`../06-Quality/M3-Traffic-Cargo-Scoring-Acceptance.md`](../06-Quality/M3-Traffic-Cargo-Scoring-Acceptance.md).

## M4 — Final route / environment composition

M4 follows [`../01-Design/Environment-Zones-and-Roadside-Composition.md`](../01-Design/Environment-Zones-and-Roadside-Composition.md). The five zones are presentation profiles over the existing road renderer; they must not become five separate biome systems.

**Status:** implementation, deterministic route/timing/scoring validation and representative 960x540 zone/route-choice render validation complete. Production art, human control-feel/balance testing and target-device profiling remain M5/M7 scope. See [`M4-Final-Route-and-Environments.md`](M4-Final-Route-and-Environments.md) and [`../06-Quality/M4-Final-Route-Acceptance.md`](../06-Quality/M4-Final-Route-Acceptance.md).

- [x] M4.1 Extend authored road-section semantics with the minimal `city | rural | forest | mountain-pass | tunnel` zone identity and branch/landmark metadata needed by the final route.
- [x] M4.2 Implement deterministic roadside placement from stable route/segment/zone inputs, supporting authored landmarks plus reusable ambient props without frame-time random re-rolls.
- [x] M4.3 Implement shared outdoor background/parallax profile selection with a compact shared set; do not create a unique three-layer stack per zone.
- [x] M4.4 Author the `city` opening with dense infrastructure/commercial composition and readable initial traffic flow.
- [x] M4.5 Author the `rural` outskirts transition so city-to-natural scenery changes gradually rather than teleporting at one segment.
- [x] M4.6 Implement one route split decision by selecting the subsequent authored section sequence; do not build simultaneous multi-road geometry unless readability testing requires it.
- [x] M4.7 Author the short/risky branch as `mountain-pass -> tunnel`, using tighter curves/elevation, guardrails/chevrons/rock silhouettes and authored tunnel entry/exit landmarks.
- [x] M4.8 Implement tunnel presentation using the existing road projection: simple procedural enclosure geometry plus repeated projected tunnel-light/reflector props; no separate scene or 3D tunnel mesh.
- [x] M4.9 Author the long/safer branch as `forest -> rural`, using darker vegetation silhouettes, more open sightlines and gentler geometry than the risky branch.
- [x] M4.10 Author the final city-fringe/depot approach and delivery destination marker, merging both branch outcomes into one finish sequence.
- [x] M4.11 Tune branch distances, traffic density and full-run timing to **4–5 minutes** while preserving a meaningful short/risky vs long/safer trade-off.
- [x] M4.12 Add final time/cargo bonus and simple result rank.
- [x] M4.13 Validate that all five zones are visually distinguishable within a few seconds using placeholder/procedural composition before commissioning additional zone-specific art.
- [x] M4.14 Validate route-choice readability through both UI/sign cue and environmental preview; simultaneous fork geometry was not justified by the structural readability pass.

### M4 explicit non-goals

Do not add during M4:

- `BiomeManager` / `EnvironmentSystem`;
- separate scene per zone;
- unique handling/physics by zone;
- zone-specific traffic AI classes;
- procedural terrain generation;
- full 3D tunnel geometry;
- independent full asset packs for each zone;
- weather/day-night variants;
- generalized prop grammar/editor;
- additional route branches.

## M5 — Presentation / controls / production assets

M5 is executed in dependency slices defined by [`M5-Presentation-and-Production-Assets.md`](M5-Presentation-and-Production-Assets.md), with acceptance tracked in [`../06-Quality/M5-Presentation-Acceptance.md`](../06-Quality/M5-Presentation-Acceptance.md).

**M5A status:** production foundation complete. Canonical palette tokens, pixel-art config, runtime asset tree, Boot preload/error boundary, landscape-only browser shell, touch-layout contract and five-state visual-steering contract are established and validated. Production touch controls, final HUD clipping validation and Batch A+ assets remain open.

- [ ] M5.1 Implement touch steering/throttle/brake controls.
- [ ] M5.2 Verify orientation/aspect-ratio scaling behavior after production touch/HUD surfaces exist; M5A structural shell checks already cover 16:9, phone-wide, 4:3 and portrait fallback.
- [ ] M5.3 Add optional gamepad mapping if it does not delay mobile completion.
- [x] M5.4 Establish the `Night Courier 20` palette tokens in code/asset documentation before final sprite production.
- [x] M5.5 Create runtime asset directories and lock naming/pivot conventions from `Asset-Inventory-and-Sprite-Requirements.md`.
- [ ] M5.6 Produce/import Asset Batch A: five player steering poses, at least three traffic visuals, city far skyline and city mid/building strip.
- [ ] M5.7 Map traffic visuals to the existing `car`/`van`/`truck` behavior classes without adding new AI types.
- [ ] M5.8 Validate player and traffic readability against representative `city`, `forest`, `mountain-pass` and `tunnel` compositions at gameplay speed.
- [ ] M5.9 Produce/import Asset Batch B: approximately 15–18 reusable roadside/environment props shared across all five zones, prioritizing streetlight, guardrail, utility pole, tree cluster, rock/cliff cluster, chevron, tunnel portal/light and core signage.
- [ ] M5.10 Add remaining shared background/parallax images while keeping the initial target at approximately **5–7 images total** across all outdoor zones; tunnel should normally reuse procedural enclosure instead of extra background stacks.
- [ ] M5.11 Add timer/score/cargo/combo HUD polish using procedural text/bars plus only the required 5–8 gameplay icons.
- [ ] M5.12 Add one readable local pixel/bitmap font family and verify redistribution license.
- [ ] M5.13 Produce/import Asset Batch C VFX: small spark/smoke set and only justified optional visual variants.
- [ ] M5.14 Verify nearest-neighbor/pixel-art scaling, pivots, transparent bounds and remove visible smoothing/shimmer issues.
- [ ] M5.15 Add one music track.
- [ ] M5.16 Add approximately eight required SFX, including engine, collision, near-miss, countdown/start and finish/UI feedback.
- [ ] M5.17 Add collision feedback.
- [ ] M5.18 Add near-miss feedback.
- [ ] M5.19 Implement pause/resume without time jump.
- [ ] M5.20 Audit runtime asset count against the documented **~38–53 unique-image** budget before adding further content.
- [ ] M5.21 Perform final zone-composition pass so `city`, `rural`, `forest`, `mountain-pass` and `tunnel` remain distinct but visually coherent under one palette.

## M6 — Host bridge / Unity

- [ ] M6.1 Define TypeScript protocol types for v1 messages.
- [ ] M6.2 Implement browser fallback in `HostBridge.ts`.
- [ ] M6.3 Implement `READY` emission.
- [ ] M6.4 Implement and validate `INIT` handling.
- [ ] M6.5 Implement `PAUSE` and `RESUME` handling.
- [ ] M6.6 Implement `GAME_COMPLETED`.
- [ ] M6.7 Implement `GAME_ABORTED` / exit path.
- [ ] M6.8 Build static offline package with no remote dependencies.
- [ ] M6.9 Host package in fullscreen Unity WebView.
- [ ] M6.10 Validate result payload before Unity persistence.
- [ ] M6.11 Persist/reload high score in Unity.
- [ ] M6.12 Destroy WebView and validate second launch in same session.

## M7 — Quality / stabilization

- [ ] M7.1 Typecheck and production-build clean pass.
- [ ] M7.2 Add targeted unit tests for pure scoring/projection/zone-placement logic where valuable.
- [ ] M7.3 Exercise collision/near-miss edge cases.
- [ ] M7.4 Test pause/resume repeatedly.
- [ ] M7.5 Test browser standalone lifecycle.
- [ ] M7.6 Test Unity offline lifecycle with every required runtime sprite/font/audio asset available locally.
- [ ] M7.7 Profile representative target mobile device.
- [ ] M7.8 Fix P0/P1 defects.
- [ ] M7.9 Final balance pass for timer/cargo/score.
- [ ] M7.10 Final visual readability/palette consistency/asset-pivot pass at gameplay speed.
- [ ] M7.11 Remove unused runtime/source-art files from the production package.
- [ ] M7.12 Synchronize docs with final implemented contracts and asset inventory.

## Deferred backlog

Do not start these unless the initial game is already coherent and validated:

- [ ] Additional tracks.
- [ ] Additional player cars.
- [ ] Police pursuit and police vehicle asset set.
- [ ] Cargo-type modifiers and cargo-specific asset sets.
- [ ] Larger route graph.
- [ ] Simultaneous multi-road/fork renderer.
- [ ] Multiple biome/environment packs.
- [ ] Weather-specific art packs.
- [ ] Track JSON/editor pipeline.
- [ ] Dedicated HUD subsystem.
- [ ] Dedicated audio subsystem.
- [ ] Custom sprite-atlas/content-pipeline tooling without measured need.
- [ ] Expanded master palette without a demonstrated material/readability problem.
- [ ] Backend/cloud features.
