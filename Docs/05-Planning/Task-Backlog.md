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

- [ ] M3.1 Define traffic data model with only `car`, `van` and `truck` gameplay types.
- [ ] M3.2 Implement traffic spawn/recycling.
- [ ] M3.3 Project traffic into road view and add segment/range indexing only if it simplifies measured queries.
- [ ] M3.4 Implement road-space collision envelopes, including crossed-range/swept handling if fixed-step speed can skip meaningful overlap.
- [ ] M3.5 Apply speed loss on collision.
- [ ] M3.6 Add cargo condition and collision damage.
- [ ] M3.7 Implement near-miss proximity state.
- [ ] M3.8 Prevent duplicate near-miss awards per pass.
- [ ] M3.9 Implement combo multiplier/reset.
- [ ] M3.10 Implement final score calculation.

## M4 — Final route

- [ ] M4.1 Author opening section.
- [ ] M4.2 Implement one route split decision by selecting the subsequent authored road-section sequence; do not build simultaneous multi-road geometry unless readability testing requires it.
- [ ] M4.3 Author short/risky branch.
- [ ] M4.4 Author long/safer branch.
- [ ] M4.5 Author final section/destination.
- [ ] M4.6 Tune total run duration to 4–5 minutes.
- [ ] M4.7 Add final time/cargo bonus.
- [ ] M4.8 Add simple result rank.

## M5 — Presentation / controls / production assets

- [ ] M5.1 Implement touch steering/throttle/brake controls.
- [ ] M5.2 Verify orientation/aspect-ratio scaling behavior.
- [ ] M5.3 Add optional gamepad mapping if it does not delay mobile completion.
- [ ] M5.4 Establish the `Night Courier 20` palette tokens in code/asset documentation before final sprite production.
- [ ] M5.5 Create runtime asset directories and lock naming/pivot conventions from `Asset-Inventory-and-Sprite-Requirements.md`.
- [ ] M5.6 Produce/import Asset Batch A: five player steering poses, at least three traffic visuals, far skyline and mid skyline.
- [ ] M5.7 Map traffic visuals to the existing `car`/`van`/`truck` behavior classes without adding new AI types.
- [ ] M5.8 Validate player and traffic readability against representative night-city compositions at gameplay speed.
- [ ] M5.9 Produce/import Asset Batch B: reusable 12–15 roadside/environment props plus required near parallax strips.
- [ ] M5.10 Add remaining background/parallax images while keeping the initial target at approximately 4–6 images.
- [ ] M5.11 Add timer/score/cargo/combo HUD polish using procedural text/bars plus only the required 5–8 gameplay icons.
- [ ] M5.12 Add one readable local pixel/bitmap font family and verify redistribution license.
- [ ] M5.13 Produce/import Asset Batch C VFX: small spark/smoke set and only justified optional visual variants.
- [ ] M5.14 Verify nearest-neighbor/pixel-art scaling, pivots, transparent bounds and remove visible smoothing/shimmer issues.
- [ ] M5.15 Add one music track.
- [ ] M5.16 Add approximately eight required SFX, including engine, collision, near-miss, countdown/start and finish/UI feedback.
- [ ] M5.17 Add collision feedback.
- [ ] M5.18 Add near-miss feedback.
- [ ] M5.19 Implement pause/resume without time jump.
- [ ] M5.20 Audit runtime asset count against the documented ~34–49 unique-image budget before adding further content.

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
- [ ] M7.2 Add targeted unit tests for pure scoring/projection logic where valuable.
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
