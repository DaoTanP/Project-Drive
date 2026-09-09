# Night Courier Documentation Index

This directory is the authoritative documentation root for **Night Courier**.

## Structure

| Area | Purpose |
|---|---|
| [`01-Design/`](01-Design/) | Product vision, gameplay rules, content scope, UX expectations, environment composition, art direction, palette and runtime asset inventory |
| [`02-Architecture/`](02-Architecture/) | Runtime boundaries, source layout, ownership and dependency rules |
| [`03-Technical/`](03-Technical/) | Rendering, simulation, input, integration, implementation details and external technical research notes |
| [`04-Workflow/`](04-Workflow/) | Development, asset, build and validation workflow |
| [`05-Planning/`](05-Planning/) | Milestones, sequencing, task backlog and definition of done |
| [`06-Quality/`](06-Quality/) | Test strategy, performance targets and acceptance criteria |
| [`07-Decisions/`](07-Decisions/) | Frozen architectural and product decisions |

## Design documents

- [`01-Design/Game-Design-Document.md`](01-Design/Game-Design-Document.md) — gameplay/product baseline.
- [`01-Design/Scope-and-Constraints.md`](01-Design/Scope-and-Constraints.md) — scope and complexity limits.
- [`01-Design/Environment-Zones-and-Roadside-Composition.md`](01-Design/Environment-Zones-and-Roadside-Composition.md) — authoritative `city` / `rural` / `forest` / `mountain-pass` / `tunnel` composition, transition, deterministic roadside-placement and route-mapping rules.
- [`01-Design/Art-Direction-and-Color-Palette.md`](01-Design/Art-Direction-and-Color-Palette.md) — authoritative visual identity, Night Courier 20 palette and zone-aware color/value rules.
- [`01-Design/Asset-Inventory-and-Sprite-Requirements.md`](01-Design/Asset-Inventory-and-Sprite-Requirements.md) — authoritative runtime sprite/audio inventory, procedural-vs-authored rules, asset budgets, naming, pivots and production batches.
- [`01-Design/Player-Sprite-Angle-Specification.md`](01-Design/Player-Sprite-Angle-Specification.md) — authoritative 256x256 player steering-frame contract: camera, yaw progression, rear-plane width, side exposure, wheel visibility, registration, palette/color cap and per-frame acceptance rules.
- [`01-Design/Traffic-Sprite-Angle-Specification.md`](01-Design/Traffic-Sprite-Angle-Specification.md) — authoritative 256x256 traffic-frame contract: complete five-yaw families for every production traffic visual, naming, registration, projection-only yaw semantics and collision separation.

## Technical references

- [`03-Technical/Technical-Design.md`](03-Technical/Technical-Design.md) — authoritative technical implementation contract, including projected road/traffic/roadside objects, environment-zone ownership and tunnel presentation constraints.
- [`03-Technical/Pseudo-3D-Road-Research-Notes.md`](03-Technical/Pseudo-3D-Road-Research-Notes.md) — research synthesis from pseudo-3D racer references. It captures ideas, algorithms, trade-offs and rejected approaches only; it is **not** a source-code/template contract.

## Active production planning

- [`05-Planning/M5-Presentation-and-Production-Assets.md`](05-Planning/M5-Presentation-and-Production-Assets.md) — M5 dependency order, landscape/touch contract, player/traffic yaw presentation contracts, asset-batch sequencing and production integration rules.
- [`06-Quality/M5-Presentation-Acceptance.md`](06-Quality/M5-Presentation-Acceptance.md) — M5 foundation, viewport, touch, vehicle sprite, roadside, HUD, VFX/audio and completion acceptance gates.

## Current authoritative baseline

1. Night Courier is a **small pseudo-3D arcade delivery racer**, not a general racing framework.
2. A run targets **4–5 minutes**.
3. Core mechanics are steering, acceleration, braking, traffic avoidance, collision, timer, cargo condition, near-miss combo, scoring and one route split.
4. The initial route uses one coherent Japanese-night environment family expressed through exactly five approved presentation zones: **city, rural, forest, mountain-pass and tunnel**.
5. Preferred route mapping is `city -> rural/outskirts -> branch`, with short/risky `mountain-pass -> tunnel`, long/safer `forest -> rural`, then a shared city-fringe/depot finish.
6. Environment zones are data/composition profiles over shared systems, not independent biome packs. They may vary prop pool/density/spacing, background selection, lighting rhythm and authored road geometry tendencies, but not vehicle physics or traffic AI classes.
7. Roadside/environment placement is deterministic from stable route/segment/zone inputs. High-value landmarks are authored explicitly; ambient props use reusable deterministic placement rules.
8. Tunnel uses the existing road projection with simple procedural enclosure geometry plus repeated projected fixtures; no separate scene or full 3D tunnel mesh is part of initial scope.
9. Initial content remains deliberately small: one player vehicle, three traffic behavior classes, approximately **15–18 shared roadside/environment props** and **5–7 shared background/parallax images**.
10. The revised runtime image budget is approximately **49–67 images**; with all four recommended traffic identities and complete five-yaw families, the expected range is approximately **54–67 images**.
11. Web technology is **Phaser 4 + TypeScript + Vite**.
12. No React, ECS, backend, database or external physics engine is part of the initial scope.
13. Development runs directly in a browser; production is packaged as static offline web content and hosted fullscreen by Unity.
14. Unity and the web game communicate through a narrow versioned JSON bridge.
15. Unity owns persistent progression/high scores; the web game owns only the current run state.
16. The initial code architecture targets **12 TypeScript source files**. Environment-zone or production-presentation work does not authorize generic manager/service layers; extraction requires demonstrated complexity.
17. The pseudo-3D renderer baseline is **projected fixed-length road segments** compiled from compact authored road sections; external racer references inform algorithms only and do not define Night Courier's source implementation.
18. Gameplay simulation uses a bounded **60 Hz fixed-step** inside `GameScene` while Phaser owns the render frame; road tessellation and vehicle speed remain independently tunable.
19. Curves use gradual accumulated lateral displacement with continuity across segment boundaries; hills use elevation in the same projection model with crest occlusion/clipping.
20. Initial route branching selects a continuation of authored road sections; a generalized simultaneous multi-road/fork renderer is deferred unless readability testing requires it.
21. The visual baseline is a **late-1990s Japanese-inspired night route** using the custom **Night Courier 20** palette: cool dark neutrals dominate, practical warm lights support readability, and neon is concentrated mainly in city/commercial accents rather than every zone.
22. Road geometry, lane markings, simple tunnel enclosure, simple HUD bars/text and basic screen effects are procedural; concept-art breadth does not expand gameplay scope automatically.
23. The player steering set is exactly five separately authored `256 x 256` transparent FLAT frames for the initial release. `Center / Left / Hard Left` use approximately `0° / 10–12° / 20–22°` yaw progression, with symmetric angle metrics on the right; runtime bitmap mirroring is not the production solution because asymmetric hero-car details must remain on their real side.
24. Player steering frames preserve canonical contact registration around `(128,232)`, stable apparent scale, controlled rear-plane contraction and progressive side/wheel visibility. Each frame follows Night Courier 20 and has a hard cap of **24 visible colors** excluding transparency.
25. Every production traffic visual uses a complete five-yaw family (`Hard Left / Left / Center / Right / Hard Right`), with every traffic frame exported as an exact `256 x 256` transparent PNG and road-contact registration compatible with `(128,232)`.
26. Traffic yaw is presentation only. Taxi/hatchback remain `car`, van remains `van`, truck remains `truck`; selected yaw texture never changes road-space collision, near-miss state, speed or AI behavior.
27. Traffic `256 x 256` is a source/export contract, not a fixed display size. Traffic remains depth-scaled by the pseudo-3D projection/world-size data.
28. The standard initial traffic set is taxi + hatchback + van + truck, each with five yaw states = **20 traffic frames**. A reduced three-identity set is **15 frames** but every shipping identity still requires all five yaw states for final acceptance.
29. Initial gameplay presentation is **landscape-only** at a `960 x 540` logical canvas with aspect-preserving FIT scaling; portrait browser fallback asks the user to rotate rather than running a separate portrait gameplay layout.
30. Touch, keyboard and optional gamepad all normalize into the same `InputState`; touch-specific controls must not leak into `Player` driving logic.
31. Five player textures are selected from a separate smoothed visual-steering presentation value so binary input can traverse moderate steering poses without changing physics.
32. Production runtime assets live under the shared `WebGame/public/assets/{player,traffic,props,backgrounds,fx,ui,fonts,audio}` categories. Source art and per-zone asset-pack directories remain outside the runtime structure.

## External-reference discipline

External technical material may influence:

- mathematical reasoning;
- algorithms;
- data structures at the conceptual level;
- known pitfalls and trade-offs;
- implementation sequencing.

It must not silently redefine project architecture or be copied as a source-code template. Do not import external file layouts, identifiers, helper functions, magic constants, assets or demo-specific constraints unless separately justified by a project requirement and license review.

## Change discipline

A document marked as a baseline decision should not be reopened merely to add flexibility. Change it only when implementation evidence, platform constraints, profiling or validated gameplay/art feedback demonstrates a concrete contradiction.
