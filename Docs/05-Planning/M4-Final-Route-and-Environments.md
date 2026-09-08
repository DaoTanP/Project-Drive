# M4 — Final Route and Environment Composition

## Status

Implementation complete on the M4 feature branch. Final acceptance uses deterministic route-rule checks, production build/static-host validation and representative 960x540 environment renders. Production sprites/audio and final art polish remain M5.

## Implemented route

The final route keeps one common opening, one decision, two alternatives and one shared finish:

```text
CITY
  -> RURAL / outskirts
  -> ROUTE CHOICE
       LEFT:  MOUNTAIN-PASS -> TUNNEL       (short / risky)
       RIGHT: FOREST -> RURAL                (long / safer)
  -> CITY fringe / depot
  -> DESTINATION
```

The route does not render two simultaneous road meshes. The player makes one left/right decision during the authored approach window and `Road` selects the corresponding continuation sequence.

Neutral input at the commitment boundary defaults to the safe branch so the run cannot stall waiting for route-choice input.

## Route distances and timing

Authoritative M4 tuning:

| Value | M4 baseline |
|---|---:|
| Run deadline | 300 s |
| Branch decision distance | 318,800 world units from run start |
| Risky destination | 778,800 world units |
| Safe destination | 838,800 world units |
| Clean full-throttle risky run | ~244.7 s |
| Clean full-throttle safe run | ~263.45 s |

Both clean baseline paths fall inside the 4–5 minute target. The safe branch is roughly 60,000 world units / 18.75 clean seconds longer before traffic/collision effects.

The 300-second deadline leaves a limited recovery budget rather than guaranteeing completion after repeated collisions.

## Risk profile

### Risky branch

`mountain-pass -> tunnel`

Characteristics:

- shorter route distance;
- tighter curves;
- stronger elevation changes;
- shorter sightlines;
- repeated chevron/guardrail/rock cues;
- tunnel enclosure/light rhythm;
- denser recycled traffic through `Traffic.setGapScale(0.82)`.

Risk is produced by existing road geometry, visibility and traffic pressure. No new handling model or hazard system is introduced.

### Safe branch

`forest -> rural`

Characteristics:

- longer route distance;
- gentler flowing curves;
- more open sightlines;
- forest/tree silhouettes followed by sparse rural composition;
- lower recycled traffic density through `Traffic.setGapScale(1.15)`.

The safe branch is not risk-free; it trades route length for easier geometry/traffic spacing.

## Environment implementation

The five environment zones remain data/presentation semantics inside `Road.ts`:

```text
city
rural
forest
mountain-pass
tunnel
```

No `BiomeManager`, `EnvironmentSystem`, extra scene or additional renderer was created.

### Placeholder/procedural composition

M4 uses procedural placeholders to validate composition before M5 art production:

- `city`: building silhouette rhythm, streetlight/sign/rail vocabulary;
- `rural`: sparse ridge, poles, trees, rails and reflectors;
- `forest`: dense low-contrast tree silhouettes and roadside trees;
- `mountain-pass`: stronger ridge/rock mass, chevrons, rails and tighter geometry;
- `tunnel`: dark background, projected side enclosure bands, upper enclosure strip and repeated light/reflector rhythm.

These placeholders prove layout/identity only. M5 replaces eligible vehicle/roadside/background placeholders with the approved production sprite inventory while preserving the same zone semantics.

## Deterministic roadside placement

Ambient roadside objects derive from stable segment index + zone salt. Their side/type/spacing variation is stable across frames and repeated runs of the same authored route.

Important landmarks remain explicitly authored:

- route-choice gantry/cue;
- tunnel entry;
- tunnel exit;
- destination marker.

The route-choice landmark uses two channels:

1. sign/UI language describing short-risky vs long-safe;
2. environmental preview silhouettes: rock/chevron cue on the risky-left side and tree/open-road cue on the safe-right side.

No per-frame random rerolling is used.

## Scoring completion

M4 extends the M3 driving score with completion bonuses:

```text
Final Score
  = driving score
  + time bonus
  + cargo bonus
```

Current tuning:

- time bonus: `25 * whole/remaining seconds` through the finalization calculation;
- cargo bonus: `50 * remaining cargo percent`;
- timeout receives no time/cargo completion bonus.

Simple rank thresholds:

| Rank | Minimum final score |
|---|---:|
| S | 18,000 |
| A | 13,000 |
| B | 9,000 |
| C | 6,000 |
| D | below 6,000 or timeout |

These values are balance constants, not new architecture, and remain eligible for M7 tuning.

## Runtime boundaries

M4 keeps the existing compact architecture:

- `Road.ts`: route authoring, zones, deterministic roadside placeholders, background/enclosure composition and projection;
- `GameScene.ts`: route-choice orchestration and branch-specific traffic density;
- `Traffic.ts`: still owns traffic; only exposes a small recycled-gap tuning knob;
- `Scoring.ts`: final score bonuses/rank;
- `GameState.ts`: result contract and branch/destination state;
- `ResultScene.ts`: final score breakdown/rank display.

No runtime source file was added for environment management.

## Deferred to M5/M7

M4 does not claim final production presentation. Remaining work includes:

- production roadside/background sprites and player/traffic art;
- final pixel-art pivots/scaling/readability pass;
- touch controls;
- audio/VFX feedback;
- subjective control-feel and final route-balance playtesting;
- target-device performance profiling;
- final score/deadline tuning if playtest evidence requires it.
