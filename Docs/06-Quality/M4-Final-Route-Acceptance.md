# M4 Final Route / Environment Acceptance

## Purpose

This record captures validation evidence for Milestone 4. It distinguishes objective implementation checks from subjective production-art/control-feel work that remains in later milestones.

## Automated build gate

The M4 source must pass:

- `npm ci`;
- TypeScript typecheck;
- production Vite build;
- static `dist/` serving smoke.

## Deterministic route-rule validation

Validated against the M4 authored route:

- run starts in `city`;
- common route transitions into `rural` before branch commitment;
- branch commitment occurs at route distance `318,800`;
- safe branch resolves first into `forest`, later `rural`, then shared `city` finish;
- risky branch resolves into `mountain-pass`, then `tunnel`, then shared `city` finish;
- safe destination distance is `838,800`;
- risky destination distance is `778,800`;
- branch rebuilding preserves a valid destination landmark and common-prefix semantics.

## Duration validation

A deterministic clean-run simulation using the actual `Player`, `Road` and `GameState` fixed-step rules verifies:

- risky path completes in approximately `244.7 s`;
- safe path completes in approximately `263.45 s`;
- both remain between 4 and 5 minutes;
- safe path is more than 10 seconds longer than risky at the clean baseline;
- both complete before the 300-second deadline without collision delay.

This is a timing baseline, not a claim that human runs will match these exact numbers.

## Score/result validation

Validated rules:

- completion final score equals driving score + time bonus + cargo bonus;
- completed runs with remaining time/cargo receive positive applicable bonuses;
- timeout receives zero completion time/cargo bonus;
- timeout rank is `D`;
- result contract contains branch, driving score, bonus breakdown and rank;
- rank thresholds are deterministic pure rules.

## Environment render validation

Representative 960x540 browser renders are required for:

- `city`;
- `rural`;
- `forest`;
- `mountain-pass`;
- `tunnel`;
- route-choice approach after environmental preview cues are present.

Acceptance at placeholder stage means:

- each zone has a distinct silhouette/composition within a representative frame;
- the road remains visually readable;
- no projection explosion/inversion is visible;
- props remain attached to projected road depth rather than screen-fixed scenery;
- mountain-pass directional cues reinforce tighter road geometry;
- tunnel visibly suppresses normal outdoor presentation and establishes enclosure/light rhythm;
- route-choice presents both explicit sign/UI information and environmental risky-vs-safe preview cues.

These checks validate composition structure, not final art quality.

## Determinism acceptance

- roadside ambient placement is derived from stable authored segment/zone inputs;
- repeated rendering does not reroll prop identity/side each frame;
- authored tunnel/route-choice/destination landmarks remain stable;
- no runtime random world generator was introduced.

## Architecture acceptance

M4 is acceptable only if it does not introduce:

- `BiomeManager` / `EnvironmentSystem`;
- scene-per-zone loading;
- independent physics/handling by environment;
- zone-specific traffic classes;
- full 3D terrain/tunnel mesh system;
- generalized procedural prop grammar/editor;
- additional route branches;
- new runtime source files solely to support zone abstraction.

The implementation remains inside the existing compact source layout.

## Explicitly pending later validation

The following are not claimed by M4 and remain M5/M7 work:

- final production sprite/background quality;
- final roadside asset-count audit;
- subjective player steering/control feel across the entire 4–5 minute route;
- final collision/traffic balance on both branches through human playtest;
- target mobile/WebView performance;
- final score/rank/deadline tuning;
- final route-choice comprehension test with representative players.

These pending items do not invalidate the M4 structural route/environment implementation; they are presentation, balance and target-device acceptance gates defined for later milestones.
