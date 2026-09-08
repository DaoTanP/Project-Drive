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

## Technical references

- [`03-Technical/Technical-Design.md`](03-Technical/Technical-Design.md) — authoritative technical implementation contract, including projected road/traffic/roadside objects, environment-zone ownership and tunnel presentation constraints.
- [`03-Technical/Pseudo-3D-Road-Research-Notes.md`](03-Technical/Pseudo-3D-Road-Research-Notes.md) — research synthesis from pseudo-3D racer references. It captures ideas, algorithms, trade-offs and rejected approaches only; it is **not** a source-code/template contract.

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
10. The normal revised visual budget is approximately **38–53 unique runtime images** / **49–74 frames/images including variants**.
11. Web technology is **Phaser 4 + TypeScript + Vite**.
12. No React, ECS, backend, database or external physics engine is part of the initial scope.
13. Development runs directly in a browser; production is packaged as static offline web content and hosted fullscreen by Unity.
14. Unity and the web game communicate through a narrow versioned JSON bridge.
15. Unity owns persistent progression/high scores; the web game owns only the current run state.
16. The initial code architecture targets **12 TypeScript source files**. Environment-zone work does not authorize a new `BiomeManager`/`EnvironmentSystem`; extraction requires demonstrated complexity.
17. The pseudo-3D renderer baseline is **projected fixed-length road segments** compiled from compact authored road sections; external racer references inform algorithms only and do not define Night Courier's source implementation.
18. Gameplay simulation uses a bounded **60 Hz fixed-step** inside `GameScene` while Phaser owns the render frame; road tessellation and vehicle speed remain independently tunable.
19. Curves use gradual accumulated lateral displacement with continuity across segment boundaries; hills use elevation in the same projection model with crest occlusion/clipping.
20. Initial route branching selects a continuation of authored road sections; a generalized simultaneous multi-road/fork renderer is deferred unless readability testing requires it.
21. The visual baseline is a **late-1990s Japanese-inspired night route** using the custom **Night Courier 20** palette: cool dark neutrals dominate, practical warm lights support readability, and neon is concentrated mainly in city/commercial accents rather than every zone.
22. Road geometry, lane markings, simple tunnel enclosure, simple HUD bars/text and basic screen effects are procedural; concept-art breadth does not expand gameplay scope automatically.

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
