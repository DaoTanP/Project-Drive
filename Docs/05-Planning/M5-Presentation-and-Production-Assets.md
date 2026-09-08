# M5 — Presentation, Controls and Production Assets

## 1. Purpose

M5 converts the mechanically complete M1–M4 build from procedural/placeholding presentation into the production-readable Night Courier minigame.

M5 must not redesign driving, traffic, route, scoring or the five-zone environment model. Presentation code consumes existing simulation state.

Authoritative inputs:

- [`../01-Design/Art-Direction-and-Color-Palette.md`](../01-Design/Art-Direction-and-Color-Palette.md)
- [`../01-Design/Asset-Inventory-and-Sprite-Requirements.md`](../01-Design/Asset-Inventory-and-Sprite-Requirements.md)
- [`../01-Design/Player-Sprite-Angle-Specification.md`](../01-Design/Player-Sprite-Angle-Specification.md)
- [`../01-Design/Environment-Zones-and-Roadside-Composition.md`](../01-Design/Environment-Zones-and-Roadside-Composition.md)
- [`../03-Technical/Technical-Design.md`](../03-Technical/Technical-Design.md)

## 2. M5 execution order

```text
M5A production foundation
    -> M5B gameplay-readable Batch A
    -> M5C environment Batch B
    -> M5D HUD / VFX feedback
    -> M5E audio / pause / final production pass
```

Do not commission the full inventory before Batch A is integrated and validated at gameplay speed.

## 3. M5A — production foundation

**Status:** complete.

M5A established:

- canonical `Night Courier 20` runtime tokens;
- Phaser pixel-art texture filtering;
- `960 x 540` logical resolution with `FIT` scaling;
- approved runtime asset directory tree;
- `BootScene` preload/error boundary;
- landscape-only browser shell and portrait rotate notice;
- touch input contract;
- five-state `visualSteer` presentation contract.

No generalized asset manager, UI framework or atlas pipeline was introduced.

## 4. Landscape and viewport contract

Night Courier gameplay remains **landscape-only**.

Runtime rules:

- logical canvas: `960 x 540`;
- preserve aspect ratio with `FIT`;
- letterbox/pillarbox is acceptable;
- portrait fallback asks the player to rotate;
- touch controls remain inside logical safe margins;
- Unity host may later request landscape orientation where platform policy permits.

M5A structurally validated `960x540`, `844x390`, `1024x768` and portrait `390x844`. M5.2 remains open until touch/HUD clipping is validated.

## 5. Touch-control contract

Touch remains another producer of the existing normalized input:

```ts
interface InputState {
  steer: number;
  throttle: number;
  brake: number;
}
```

Initial layout:

```text
bottom-left                     bottom-right

[ LEFT ] [ RIGHT ]              [ BRAKE ] [ GAS ]
```

Requirements:

- steering + throttle simultaneously;
- steering + brake simultaneously;
- independent multi-touch ownership;
- releasing one pointer does not release another control;
- route choice still derives from normalized steering;
- visible pressed state;
- no new mobile scene/input subsystem.

## 6. Player visual-steering contract

The five player textures are presentation states, not physics modes.

`GameScene` owns a smoothed `visualSteer` value separate from raw input so binary steering traverses moderate poses rather than snapping directly to hard poses.

| `visualSteer` | Texture |
|---|---|
| `<= -0.68` | `player_rear_hard_left` |
| `-0.68 .. -0.18` | `player_rear_left` |
| `-0.18 .. +0.18` | `player_rear_center` |
| `+0.18 .. +0.68` | `player_rear_right` |
| `>= +0.68` | `player_rear_hard_right` |

Requirements:

- neutral → moderate → hard when steering is held;
- hard → moderate → neutral when released;
- no effect on `Player.roadX`, speed, cargo or collision math;
- no runtime bitmap mirroring;
- add hysteresis only if threshold flicker is observed;
- current release remains FLAT-only.

Do not add an Animator/state-machine subsystem for five textures.

## 7. Player resolution migration — 256 x 256

The old 64 x 64 player contract is retired.

Current authoritative production contract:

```text
source canvas: 256 x 256 px
runtime display box: 256 x 256 initially
contact anchor: (128, 232)
```

This is a presentation-resolution change only.

It does not change:

- five-state yaw count;
- yaw angles;
- FLAT-only scope;
- Night Courier 20 palette/color cap;
- vehicle physics;
- road-space collision envelopes.

The five high-resolution PNGs currently committed are staging references. They are approximately 1254/1256 px square and therefore do **not** yet satisfy Batch A production-size acceptance. Runtime may load/scale them while the integration path is tested; final acceptance requires explicit 256 x 256 exports with stable registration.

Do not silently resample those staging files and declare them final without visual review.

## 8. M5B — gameplay-readable Batch A

### Player

Exactly five required **256 x 256** transparent FLAT frames:

```text
player_rear_hard_left.png
player_rear_left.png
player_rear_center.png
player_rear_right.png
player_rear_hard_right.png
```

Runtime integration now uses these texture keys and the smoothed visual-steering mapping. The old procedural player placeholder is removed from the player presentation path.

The production-size/art acceptance remains pending until the five committed staging PNGs are replaced/re-exported at exact 256 x 256 and pass the angle/registration checklist.

### Traffic

At least three production visuals, recommended four:

```text
traffic_taxi_rear.png       -> car
traffic_hatchback_rear.png  -> car
traffic_van_rear.png        -> van
traffic_truck_rear.png      -> truck
```

Visual variety must not create new behavior classes.

### First backgrounds

```text
bg_city_far.png
bg_city_mid.png
```

Batch A remains approximately 10–11 images.

### Batch A gate

Before Batch B:

- all five player files are exact 256 x 256 production exports;
- player pose transitions read as one vehicle at gameplay speed;
- tire-contact anchor remains stable across all states;
- player remains readable over city/forest/mountain-pass/tunnel compositions;
- traffic silhouettes remain readable at collision/near-miss distances;
- nearest-neighbor rendering has no obvious smoothing/shimmer;
- no pitch-family expansion is justified by default.

## 9. M5C — environment Batch B

Only after Batch A passes.

Produce approximately 15–18 shared props total, including streetlight, guardrail, utility pole, tree cluster, rock/cliff cluster, chevron, core signs/gantry, tunnel portal/light and destination marker.

Shared natural backgrounds follow:

- `bg_ridge_far`;
- `bg_vegetation_mid`;
- optional near natural strip only if readability evidence requires it.

M4 deterministic roadside placement remains authoritative. Sprite-backed props must reuse road projection, render far-to-near, respect crest clipping, use stable pivots and reuse pooled Phaser images. Do not add `EnvironmentRenderer`, `PropManager`, ECS or zone scenes preemptively.

## 10. HUD and feedback

Production HUD priority:

```text
TIME                 SCORE

        gameplay

CARGO                COMBO
```

`ZONE`, `BRANCH` and route percentage remain debug-only information after HUD polish.

Collision feedback should combine existing mechanics with concise presentation:

```text
speed loss + cargo loss + shake + flash + sparks + impact SFX
```

Near miss should use concise score/combo pulse + audio and only justified small VFX.

## 11. Font and audio

Use one local readable redistribution-compatible pixel/bitmap font family.

Initial audio target:

- one gameplay music loop;
- approximately eight SFX.

Browser/mobile audio unlock must be validated through a user gesture. A short start/countdown flow is preferred if it solves both onboarding and audio unlock without creating another scene.

## 12. Pause/resume

Browser-side pause/resume precedes M6 host forwarding.

Pause:

- stop simulation;
- retain in-memory state;
- pause relevant audio.

Resume:

- discard wall-clock gap;
- reset fixed-step accumulator;
- avoid timer/player/traffic jumps.

No pause manager is required.

## 13. M5 explicit non-goals

Do not add without concrete acceptance evidence:

- new gameplay mechanics;
- new routes/zones;
- uphill/downhill player families;
- more than five player yaw states;
- new traffic AI types;
- zone-specific vehicle physics;
- full 3D tunnel;
- per-zone asset packs;
- generalized UI framework;
- custom atlas pipeline;
- shader palette system;
- audio middleware;
- multiple music tracks;
- portrait gameplay layout.
