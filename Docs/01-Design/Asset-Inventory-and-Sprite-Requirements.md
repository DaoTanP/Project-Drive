# Asset Inventory and Sprite Requirements

## 1. Purpose

This document is the authoritative production inventory for **Night Courier** runtime art/audio assets.

It defines:

1. required initial assets;
2. procedural vs authored presentation;
3. naming, pivots and runtime layout;
4. production batches and budget.

Related authoritative documents:

- [`Art-Direction-and-Color-Palette.md`](Art-Direction-and-Color-Palette.md)
- [`Environment-Zones-and-Roadside-Composition.md`](Environment-Zones-and-Roadside-Composition.md)
- [`Player-Sprite-Angle-Specification.md`](Player-Sprite-Angle-Specification.md)

## 2. Scope principle

Night Courier remains a small pseudo-3D arcade racer. Visual richness should come primarily from:

```text
projection
+ perspective scaling
+ parallax
+ repeated shared props
+ composition
+ lighting/color
```

not hundreds of unique images.

The five environment zones share one asset vocabulary; they are not five biome packs.

Normal initial target:

- approximately **38–53 unique runtime images**;
- approximately **49–74 frames/images including steering/brake/FX variants**;
- **1 music track**;
- approximately **8 SFX**;
- **1 local pixel/bitmap font family**.

These are upper production targets, not quotas.

## 3. Procedural vs authored

### Procedural/code-rendered

Keep procedural where simple geometry/text is sufficient:

- road surface/perspective/curves/hills;
- lane markers and simple shoulders;
- simple tunnel enclosure geometry;
- timer/score/combo digits;
- cargo bar fill;
- generic panels;
- screen flash/shake/fades;
- simple route-arrow panel backgrounds.

### Sprite-authored

Use authored textures where silhouette/material identity matters:

- player vehicle;
- traffic vehicles;
- roadside props/signage;
- tree/rock/portal silhouettes;
- background/parallax layers;
- small VFX textures;
- selected HUD icons.

## 4. Player vehicle

### 4.1 Identity

The hero is the approved compact late-night delivery vehicle:

- light neutral / white-gray body;
- restrained red/orange delivery accents;
- strong rear silhouette;
- readable taillights and plate cues;
- higher foreground value contrast than traffic/environment.

### 4.2 Required production frames

Exactly five FLAT steering frames are required:

| Asset | Required |
|---|---:|
| `player_rear_center.png` | yes |
| `player_rear_left.png` | yes |
| `player_rear_hard_left.png` | yes |
| `player_rear_right.png` | yes |
| `player_rear_hard_right.png` | yes |

### 4.3 Canonical source format

The authoritative player source/export contract is now:

```text
256 x 256 px
transparent PNG
one pose per file
fixed gameplay camera
fixed registration
```

The authoritative contact anchor is approximately:

```text
X = 128
Y = 232
```

Full geometry/tolerance rules live in `Player-Sprite-Angle-Specification.md`.

The previous 64 x 64 player contract is retired. Generic vehicle-size guidance elsewhere does not override this explicit 256 x 256 requirement.

Increasing player source resolution does **not** expand the frame count, palette, collision system or pitch-family scope.

### 4.4 Current staging files

The five player PNGs committed before the 256 px contract are not accepted production exports because their canvases are currently approximately 1254/1256 px square and inconsistent between states.

They may be used temporarily to validate runtime texture selection, but Batch A player acceptance requires explicit 256 x 256 exports with correct registration. Do not silently resample and declare them final without visual review.

### 4.5 Optional polish

Only after the five base frames pass:

- center brake-light state;
- moderate left brake-light state;
- moderate right brake-light state.

No damaged-car sprite is required. Collision presentation should primarily use speed/cargo loss, shake, flash, sparks and sound.

### 4.6 Explicitly deferred

Do not produce by default:

- `UPHILL` / `DOWNHILL` families;
- seven/fifteen yaw states;
- crash/spin/rollover sequences;
- manual distance/mipmap variants.

Target player count remains:

- minimum **5 frames**;
- recommended maximum initial **8 frames** including optional brake variants.

## 5. Traffic vehicles

Gameplay types remain only:

- `car`;
- `van`;
- `truck`.

Recommended production visuals:

1. city taxi → `car`;
2. compact hatchback → `car`;
3. delivery van → `van`;
4. box truck → `truck`.

One rear-biased gameplay sprite per visual is sufficient initially. Slight steering variants are optional and must not delay completion.

Starting source-size guidance, to be validated visually:

- car: approximately `64 x 48` to `96 x 64`;
- van: similar width, taller silhouette;
- truck: approximately `96 x 80`.

Consistent apparent pixel density is more important than equal canvas dimensions.

Traffic sprite alpha bounds do not define collision.

Target: **4–6 traffic images**, minimum 3.

## 6. Roadside/environment props

Use approximately **15–18 shared prop images total** across all zones.

Priority vocabulary:

1. streetlight;
2. guardrail segment/post;
3. utility pole;
4. tree/tree cluster;
5. rock/cliff cluster;
6. chevron/caution board;
7. small direction/caution sign;
8. overhead sign/gantry;
9. convenience/commercial sign;
10. billboard;
11. traffic cone;
12. construction barricade;
13. roadside utility box/crate;
14. tunnel portal/sign element;
15. tunnel light/reflector;
16. destination/finish marker;
17. optional low vegetation cluster;
18. optional small rural structure silhouette.

The last two remain optional until zone readability proves a need.

Directional props should be flipped at runtime where visually valid rather than duplicated.

### Zone reuse

- `city`: streetlights, gantries, commercial signs, billboards, construction props, guardrails;
- `rural`: utility poles, guardrails, vegetation, sparse signs/lights;
- `forest`: tree clusters, guardrails, reflectors/caution boards;
- `mountain-pass`: guardrails, chevrons, rock clusters, sparse trees, tunnel warning elements;
- `tunnel`: portal, lights/reflectors, caution/utility elements plus procedural enclosure.

## 7. Background/parallax assets

Recommended compact shared set:

- `bg_city_far.png`;
- `bg_city_mid.png`;
- optional `bg_city_near.png` only if needed;
- `bg_ridge_far.png` reused by natural zones;
- `bg_vegetation_mid.png` reused by rural/forest;
- optional `bg_forest_rock_near.png`;
- optional final depot layer only if needed.

Target **5–7 images total** across the full route.

Do not author a separate far/mid/near triplet for every zone.

Outdoors, use conceptual depth bands:

```text
far  -> lower contrast / slow parallax
mid  -> medium contrast / medium parallax
near -> stronger contrast / faster parallax
```

Tunnel normally suppresses outdoor parallax.

## 8. Gameplay VFX

Recommended small set:

- spark A/B;
- smoke A/B;
- optional near-miss streak/flash;
- optional speed streak.

Target **4–6 small images**.

Screen shake, hit flash, UI pulse and fades remain procedural.

## 9. HUD/icons

Candidate icons:

- cargo/package;
- timer;
- pause;
- route-choice arrow;
- warning/caution;
- optional destination;
- optional near-miss/combo accent.

Use text/bitmap font for score, timer, combo, countdown and result rank where practical.

Cargo remains a procedural bar plus icon.

Target **5–8 icons**.

## 10. Font

Use one local readable pixel/bitmap-style family.

Requirements:

- legible at `960 x 540` logical resolution;
- required Latin/numeral support;
- commercial redistribution-compatible license;
- no remote CDN dependency.

## 11. Audio

### Music

- one looping gameplay track.

### SFX

Approximately eight clips/layers covering:

1. engine loop;
2. acceleration/high-RPM variation if needed;
3. brake/traction cue;
4. collision impact;
5. near miss;
6. countdown/start;
7. route-choice/checkpoint;
8. finish/result/UI confirm.

Tunnel-specific reverb is not required.

## 12. Native-size guidance

Logical game resolution is `960 x 540`.

| Category | Starting source-size guidance |
|---|---|
| **player steering frame** | **exactly `256 x 256`** |
| traffic car | `64 x 48` to `96 x 64` |
| truck | around `96 x 80` |
| small/medium prop | `32 x 64` to `128 x 128` |
| tree/rock cluster | `64 x 96` to `192 x 192` |
| tunnel portal element | `128 x 128` to `256 x 192` |
| UI icon | `24 x 24` or `32 x 32` |
| parallax strip | normally `512–1024+ px` wide |

The player value is a hard production contract. Other values are starting guidance.

## 13. Anchors/pivots

- player: canonical contact anchor approximately `(128,232)` on the 256 x 256 canvas;
- traffic vehicles: bottom-center near road/tire contact;
- vertical roadside props: bottom-center at ground contact;
- tree/rock clusters: bottom-center or documented ground-contact pivot;
- hanging/overhead props: authored pivot matching support alignment;
- UI icons: consistent category origin.

Keep transparent padding predictable across variants.

## 14. Runtime directories

```text
WebGame/public/assets/
├── player/
├── traffic/
├── props/
├── backgrounds/
├── fx/
├── ui/
├── fonts/
└── audio/
```

Do not put PSD/Aseprite/source working files here. Do not create per-zone top-level runtime directories while inventory remains small.

## 15. Naming

Use lowercase snake_case:

```text
player_rear_center.png
player_rear_hard_left.png
traffic_taxi_rear.png
prop_streetlight.png
prop_tree_cluster_01.png
prop_tunnel_portal.png
bg_city_far.png
fx_spark_01.png
ui_cargo.png
sfx_collision_01.ogg
music_night_run.ogg
```

Do not use arbitrary suffixes such as `_final2_new`.

## 16. Atlas strategy

Individual files remain preferred while art changes.

Do not introduce a custom atlas pipeline before profiling/package evidence justifies it. If later useful, reasonable groups are vehicles, props, UI and FX.

## 17. Production batches

### Batch A — gameplay readable

Produce/integrate first:

- five **256 x 256** FLAT player steering frames;
- taxi/hatchback/van/truck, with at least three traffic visuals;
- `bg_city_far`;
- `bg_city_mid`.

Approximately **10–11 images** are sufficient.

Batch A gate requires player steering continuity, stable pivots, readable traffic silhouettes and city depth at gameplay speed before Batch B begins.

### Batch B — environment identity

Then produce the shared prop/background vocabulary required for all five zones.

### Batch C — polish

Only after gameplay/composition is stable:

- sparks/smoke;
- HUD icons;
- optional brake frames;
- optional extra traffic variants;
- result-screen decoration;
- only justified final parallax accents.

Pitch-family expansion is not Batch C by default.

## 18. Budget summary

| Group | Initial target |
|---|---:|
| player vehicle | 5–8 frames, each 256 x 256 |
| traffic | 4–6 images |
| roadside/environment props | 15–18 shared images |
| backgrounds/parallax | 5–7 shared images |
| VFX | 4–6 images |
| UI/icons | 5–8 images |
| font | 1 family |
| music | 1 track |
| SFX | ~8 clips |

Resolution does not change the unique-image budget.
