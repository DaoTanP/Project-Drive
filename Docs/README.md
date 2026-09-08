# Night Courier Documentation Index

This directory is the authoritative documentation root for **Night Courier**.

## Structure

| Area | Purpose |
|---|---|
| [`01-Design/`](01-Design/) | Product vision, gameplay rules, content scope, UX expectations, art direction, palette and runtime asset inventory |
| [`02-Architecture/`](02-Architecture/) | Runtime boundaries, source layout, ownership and dependency rules |
| [`03-Technical/`](03-Technical/) | Rendering, simulation, input, integration, implementation details and external technical research notes |
| [`04-Workflow/`](04-Workflow/) | Development, asset, build and validation workflow |
| [`05-Planning/`](05-Planning/) | Milestones, sequencing, task backlog and definition of done |
| [`06-Quality/`](06-Quality/) | Test strategy, performance targets and acceptance criteria |
| [`07-Decisions/`](07-Decisions/) | Frozen architectural and product decisions |

## Design documents

- [`01-Design/Game-Design-Document.md`](01-Design/Game-Design-Document.md) — gameplay/product baseline.
- [`01-Design/Scope-and-Constraints.md`](01-Design/Scope-and-Constraints.md) — scope and complexity limits.
- [`01-Design/Art-Direction-and-Color-Palette.md`](01-Design/Art-Direction-and-Color-Palette.md) — authoritative visual identity, Night Courier 20 palette and sprite color rules.
- [`01-Design/Asset-Inventory-and-Sprite-Requirements.md`](01-Design/Asset-Inventory-and-Sprite-Requirements.md) — authoritative runtime sprite/audio inventory, procedural-vs-authored rules, asset budgets, naming, pivots and production batches.

## Technical references

- [`03-Technical/Technical-Design.md`](03-Technical/Technical-Design.md) — authoritative technical implementation contract.
- [`03-Technical/Pseudo-3D-Road-Research-Notes.md`](03-Technical/Pseudo-3D-Road-Research-Notes.md) — research synthesis from pseudo-3D racer references. It captures ideas, algorithms, trade-offs and rejected approaches only; it is **not** a source-code/template contract.

## Current authoritative baseline

1. Night Courier is a **small pseudo-3D arcade delivery racer**, not a general racing framework.
2. A run targets **4–5 minutes**.
3. Core mechanics are steering, acceleration, braking, traffic avoidance, collision, timer, cargo condition, near-miss combo, scoring and one route split.
4. Initial content is intentionally limited to one player vehicle, one visual theme and a small traffic/prop set.
5. Web technology is **Phaser 4 + TypeScript + Vite**.
6. No React, ECS, backend, database or external physics engine is part of the initial scope.
7. Development runs directly in a browser; production is packaged as static offline web content and hosted fullscreen by Unity.
8. Unity and the web game communicate through a narrow versioned JSON bridge.
9. Unity owns persistent progression/high scores; the web game owns only the current run state.
10. The initial code architecture targets **12 TypeScript source files**. Extraction beyond that requires demonstrated complexity, not anticipated future use.
11. The pseudo-3D renderer baseline is **projected fixed-length road segments** compiled from compact authored road sections; external racer references inform algorithms only and do not define Night Courier's source implementation.
12. Gameplay simulation uses a bounded **60 Hz fixed-step** inside `GameScene` while Phaser owns the render frame; road tessellation and vehicle speed remain independently tunable.
13. Curves use gradual accumulated lateral displacement with continuity across segment boundaries; hills use elevation in the same projection model with crest occlusion/clipping.
14. Initial route branching selects a continuation of authored road sections; a generalized simultaneous multi-road/fork renderer is deferred unless readability testing requires it.
15. The visual baseline is **late-1990s Japanese-inspired urban night** using the custom **Night Courier 20** palette: cool dark neutrals dominate, practical warm city lights support material readability, and neon is restricted to selective accents.
16. Runtime art remains deliberately small: approximately **34–49 unique images** / **45–70 frames including variants**, with five required player steering poses, three traffic behavior classes, roughly 12–15 reusable props, 4–6 parallax images, 4–6 VFX textures and 5–8 UI icons.
17. Road geometry, lane markings, simple HUD bars/text and basic screen effects are procedural; concept-art breadth does not expand gameplay scope automatically.

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
