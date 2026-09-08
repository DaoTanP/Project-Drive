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
- [`01-Design/Player-Sprite-Angle-Specification.md`](01-Design/Player-Sprite-Angle-Specification.md) — authoritative **256x256** player steering-frame contract: camera, yaw progression, rear-plane width, side exposure, wheel visibility, registration, palette/color cap and runtime anchor rules.

## Technical references

- [`03-Technical/Technical-Design.md`](03-Technical/Technical-Design.md) — authoritative technical implementation contract, including projected road/traffic/roadside objects, environment-zone ownership and tunnel presentation constraints.
- [`03-Technical/Pseudo-3D-Road-Research-Notes.md`](03-Technical/Pseudo-3D-Road-Research-Notes.md) — research synthesis from pseudo-3D racer references. It captures ideas, algorithms, trade-offs and rejected approaches only; it is **not** a source-code/template contract.

## Active production planning

- [`05-Planning/M5-Presentation-and-Production-Assets.md`](05-Planning/M5-Presentation-and-Production-Assets.md) — M5 dependency order, landscape/touch contract, five-state visual-steering mapping, 256px player integration, asset-batch sequencing and production integration rules.
- [`06-Quality/M5-Presentation-Acceptance.md`](06-Quality/M5-Presentation-Acceptance.md) — M5 foundation, viewport, touch, 256px player, roadside, HUD, VFX/audio and completion acceptance gates.

## Current authoritative baseline

1. Night Courier is a **small pseudo-3D arcade delivery racer**, not a general racing framework.
2. A run targets **4–5 minutes**.
3. Core mechanics are steering, acceleration, braking, traffic avoidance, collision, timer, cargo condition, near-miss combo, scoring and one route split.
4. The initial route uses one coherent Japanese-night environment family expressed through exactly five approved presentation zones: **city, rural, forest, mountain-pass and tunnel**.
5. Preferred route mapping is `city -> rural/outskirts -> branch`, with short/risky `mountain-pass -> tunnel`, long/safer `forest -> rural`, then a shared city-fringe/depot finish.
6. Environment zones are data/composition profiles over shared systems, not independent biome packs.
7. Roadside/environment placement is deterministic from stable route/segment/zone inputs. High-value landmarks are authored explicitly; ambient props use reusable deterministic placement rules.
8. Tunnel uses existing road projection with simple procedural enclosure geometry plus repeated projected fixtures; no separate scene/full 3D tunnel mesh is initial scope.
9. Initial content remains deliberately small: one player vehicle, three traffic behavior classes, approximately **15–18 shared roadside/environment props** and **5–7 shared background/parallax images**.
10. Normal visual budget remains approximately **38–53 unique runtime images** / **49–74 frames/images including variants**.
11. Web technology is **Phaser 4 + TypeScript + Vite**.
12. No React, ECS, backend, database or external physics engine is part of initial scope.
13. Production is packaged as static offline web content and hosted fullscreen by Unity.
14. Unity and web game communicate through a narrow versioned JSON bridge.
15. Unity owns persistent progression/high scores; web game owns the current run state.
16. Initial code architecture targets **12 TypeScript source files**. Presentation work does not authorize generic manager/service layers without measured need.
17. Pseudo-3D renderer baseline is **projected fixed-length road segments** compiled from compact authored road sections.
18. Gameplay simulation uses a bounded **60 Hz fixed-step** inside `GameScene` while Phaser owns render frames.
19. Curves use accumulated lateral displacement; hills use the same projection model with crest occlusion/clipping.
20. Initial route branching selects a continuation of authored road sections; generalized simultaneous fork rendering remains deferred.
21. Visual baseline is a late-1990s Japanese-inspired night route using **Night Courier 20**.
22. Road geometry, lane markings, simple tunnel enclosure, simple HUD bars/text and basic screen effects remain procedural.
23. The player steering set is exactly five separately authored **`256 x 256` transparent FLAT frames**. `Center / Left / Hard Left` use approximately `0° / 10–12° / 20–22°` yaw progression, with symmetric angle metrics on the right. Runtime bitmap mirroring is not the production solution because hero-car asymmetry must remain physically correct.
24. Player frames share canonical contact anchor approximately **`(128,232)`**, stable scale, controlled rear-plane contraction and progressive side/wheel visibility. Each frame follows Night Courier 20 and has a hard cap of **24 visible colors** excluding transparency.
25. Initial gameplay presentation is landscape-only at a `960 x 540` logical canvas with aspect-preserving FIT scaling; portrait fallback asks the user to rotate.
26. Touch, keyboard and optional gamepad all normalize into the same `InputState`; source-specific details do not leak into `Player` driving logic.
27. `GameScene` uses a separate smoothed `visualSteer` presentation value to select the five player textures; player texture selection does not modify physics/collision state.
28. Runtime player display box is initially `256 x 256`, using source anchor `(128,232)` rather than canvas center for tire/road registration.
29. The five high-resolution player PNGs committed before the 256px contract are staging references only (currently approximately `1254/1256` square) and must be explicitly re-exported/authored at exactly `256 x 256` before Batch A player acceptance.
30. Production runtime assets live under `WebGame/public/assets/{player,traffic,props,backgrounds,fx,ui,fonts,audio}`. Source art and per-zone asset-pack directories remain outside runtime structure.

## External-reference discipline

External technical material may influence mathematical reasoning, algorithms, conceptual data structures, known pitfalls/trade-offs and implementation sequencing.

It must not silently redefine architecture or be copied as a source-code template. Do not import external file layouts, identifiers, helpers, magic constants, assets or demo-specific constraints unless separately justified and license-reviewed.

## Change discipline

A baseline decision should not be reopened merely to add flexibility. Change it only when implementation evidence, platform constraints, profiling or validated gameplay/art feedback demonstrates a concrete contradiction.
