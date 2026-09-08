# M5 — Presentation, Controls and Production Assets

## 1. Purpose

M5 converts the mechanically complete M1–M4 build from procedural/placeholding presentation into the production-readable Night Courier minigame.

M5 must not redesign driving, traffic, route, scoring or the five-zone environment model. Presentation code consumes the existing simulation state.

Authoritative inputs:

- [`../01-Design/Art-Direction-and-Color-Palette.md`](../01-Design/Art-Direction-and-Color-Palette.md)
- [`../01-Design/Asset-Inventory-and-Sprite-Requirements.md`](../01-Design/Asset-Inventory-and-Sprite-Requirements.md)
- [`../01-Design/Player-Sprite-Angle-Specification.md`](../01-Design/Player-Sprite-Angle-Specification.md)
- [`../01-Design/Environment-Zones-and-Roadside-Composition.md`](../01-Design/Environment-Zones-and-Roadside-Composition.md)
- [`../03-Technical/Technical-Design.md`](../03-Technical/Technical-Design.md)

## 2. M5 execution order

The backlog numbers describe scope, not implementation dependency order. Execute M5 in five slices:

```text
M5A production foundation
    -> M5B gameplay-readable Batch A
    -> M5C environment Batch B
    -> M5D HUD / VFX feedback
    -> M5E audio / pause / final production pass
```

Do not commission the full asset inventory before Batch A has been integrated and validated at gameplay speed.

## 3. M5A — production foundation

M5A establishes infrastructure and contracts without adding fake production assets.

### Runtime foundation

- expose the complete `Night Courier 20` palette as named TypeScript tokens;
- enable Phaser pixel-art texture filtering through game configuration;
- keep logical simulation/render coordinates at `960 x 540`;
- keep `Phaser.Scale.FIT` and centered scaling;
- create the approved `WebGame/public/assets/` runtime directory tree;
- add `BootScene.preload()` progress/error infrastructure;
- do not allow a required asset load failure to enter gameplay;
- do not add a generalized asset manager, asset database or custom atlas pipeline.

### Runtime asset tree

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

Source art does not belong in these directories.

## 4. Landscape and viewport contract

Night Courier gameplay is **landscape-only** for the initial release.

Runtime rules:

- authoritative logical canvas: `960 x 540`;
- preserve aspect ratio with `FIT` rather than stretching gameplay coordinates;
- letterbox/pillarbox space is acceptable;
- browser fallback displays a rotate-device notice in portrait instead of redesigning gameplay for portrait;
- Unity host should eventually request/maintain landscape orientation where platform policy allows;
- touch controls stay inside the logical gameplay safe margin rather than depending on physical screen-edge coordinates;
- `viewport-fit=cover` remains enabled so browser/WebView safe-area behavior is available when needed.

M5.2 is not complete merely because these rules are implemented. It requires representative viewport validation.

Representative validation sizes should include at least:

- `960 x 540` / 16:9;
- a phone-like 19.5:9 or 20:9 landscape viewport;
- a tablet-like 4:3 viewport;
- portrait orientation, which must display the rotate notice rather than a distorted game.

## 5. Touch-control contract

Touch remains another producer of the existing normalized `InputState`:

```ts
interface InputState {
  steer: number;    // -1..1
  throttle: number; // 0..1
  brake: number;    // 0..1
}
```

`Player` must not know whether values came from keyboard, touch or gamepad.

### Initial logical layout

Use four large logical control regions with at least a 24 px logical margin from the 960x540 canvas boundary:

```text
bottom-left                     bottom-right

[ LEFT ] [ RIGHT ]              [ BRAKE ] [ GAS ]
```

Exact dimensions are tuning, but controls must satisfy:

- steering and throttle can be held simultaneously;
- steering and brake can be held simultaneously;
- multi-touch pointer ownership is independent per control;
- releasing one pointer must not release another held control;
- route choice continues to derive from normalized steering and needs no separate touch-only navigation mode;
- controls must not overlap the core player/traffic readability area more than necessary;
- visible pressed state is required once the touch UI is implemented.

Touch implementation belongs in `Input.ts` plus minimal scene-owned visual controls. Do not create a touch-input subsystem or mobile scene.

## 6. Player visual-steering contract

The five player sprites are presentation state, not five physics modes.

The simulation continues to consume raw normalized steering. `GameScene` maintains a separate presentation value conceptually named `visualSteer` that approaches the current steering input over a short arcade response window.

This separation is required so binary keyboard/touch input can visibly pass through the moderate steering frames instead of snapping directly from `Center` to `Hard Left/Hard Right`.

### Five-state mapping

Initial pose bands:

| `visualSteer` | Pose |
|---|---|
| `<= -0.68` | `player_rear_hard_left` |
| `-0.68 .. -0.18` | `player_rear_left` |
| `-0.18 .. +0.18` | `player_rear_center` |
| `+0.18 .. +0.68` | `player_rear_right` |
| `>= +0.68` | `player_rear_hard_right` |

The exact response rate is tuning. Requirements are:

- pressing from neutral reads `Center -> Left/Right -> Hard Left/Hard Right`;
- releasing hard steering reads back through the moderate pose before `Center`;
- presentation interpolation must not alter `Player.roadX`, speed or collision math;
- use a small state hysteresis if threshold flicker is visible;
- do not runtime-flip the authored right-side player sprites because vehicle identity contains asymmetric details;
- current release remains the single FLAT pitch family.

Do not introduce a player animator/state-machine framework solely for five steering textures.

## 7. Batch A — gameplay-readable art

Produce and integrate only after M5A contracts are stable.

Required initial art:

### Player

Exactly five required `64 x 64` transparent FLAT frames:

```text
player_rear_hard_left.png
player_rear_left.png
player_rear_center.png
player_rear_right.png
player_rear_hard_right.png
```

They follow `Player-Sprite-Angle-Specification.md` exactly.

### Traffic

At least three production visuals, recommended four:

```text
traffic_taxi_rear.png       -> car
traffic_hatchback_rear.png  -> car
traffic_van_rear.png        -> van
traffic_truck_rear.png      -> truck
```

Visual variety must not create new traffic behavior classes.

### First backgrounds

```text
bg_city_far.png
bg_city_mid.png
```

Batch A should remain approximately 10–11 images.

### Batch A gate

Before Batch B:

- player pose transitions read as one vehicle at gameplay speed;
- player remains readable against city/forest/mountain-pass/tunnel placeholder compositions;
- traffic silhouettes remain readable at near-miss/collision distances;
- pivots and transparent bounds are stable;
- nearest-neighbor rendering shows no obvious smoothing;
- no pitch-family expansion is justified by default.

## 8. Batch B — environment identity

Only after Batch A passes.

Produce approximately 15–18 shared props total, not per zone. Priority follows the authoritative inventory:

- streetlight;
- guardrail;
- utility pole;
- tree cluster;
- rock/cliff cluster;
- chevron;
- core signs/gantry;
- tunnel portal/light;
- destination marker;
- remaining approved shared utility/commercial props.

Add shared natural backgrounds after city layers:

- `bg_ridge_far`;
- `bg_vegetation_mid`;
- optional near natural strip only if readability evidence requires it.

### Projected-sprite integration rule

M4's deterministic roadside placement remains authoritative. M5 replaces procedural placeholder shapes with sprite-backed presentation without changing route placement semantics.

Projected roadside sprites must:

- reuse stable route/segment/zone placement;
- use the existing road projection;
- render far-to-near;
- respect hill/crest clipping;
- use predictable bottom-center or documented pivots;
- reuse pooled Phaser image objects rather than creating/destroying sprites every frame;
- stay inside existing `Road.ts` / `GameScene` responsibility unless measured complexity proves extraction necessary.

Do not add `EnvironmentRenderer`, `PropManager`, ECS or zone scenes preemptively.

## 9. HUD and feedback

The M4 debug HUD is not the production HUD.

Production priority:

```text
TIME                 SCORE

        gameplay

CARGO                COMBO
```

`ZONE`, `BRANCH` and route percentage remain debug information and should not occupy normal gameplay HUD after presentation polish.

Prefer procedural text/bars and only the approved small icon set.

Collision feedback should compose existing mechanics with small presentation effects:

```text
speed loss + cargo loss + shake + flash + sparks + impact SFX
```

Near miss should use a concise score/combo pulse plus audio and only justified small VFX.

## 10. Font and audio dependencies

### Font

One local readable pixel/bitmap family is sufficient. Production acceptance requires a redistribution-compatible license and no CDN dependency.

### Audio

Initial target remains:

- one gameplay music loop;
- approximately eight SFX.

Browser/mobile audio may require user interaction before playback. M5 must validate a user-gesture audio-unlock/start flow before treating audio as complete.

A short start/countdown flow is preferred if it solves both control onboarding and audio unlock without creating another scene.

## 11. Pause/resume

Browser-side pause/resume should be implemented before M6 host forwarding.

Pause must:

- stop simulation progression;
- retain in-memory run state;
- pause relevant audio.

Resume must:

- discard wall-clock gap;
- reset the fixed-step accumulator before continuing;
- avoid traffic/player teleport or timer loss.

Do not create a pause manager solely for this behavior.

## 12. M5 explicit non-goals

Do not add during M5 unless acceptance evidence proves a concrete need:

- new gameplay mechanics;
- new routes or environment zones;
- player uphill/downhill pitch families;
- more than five player yaw states;
- new traffic AI types;
- zone-specific vehicle physics;
- full 3D tunnel;
- per-zone asset packs;
- generalized UI framework;
- custom atlas/content pipeline;
- shader palette system;
- audio middleware;
- multiple music tracks;
- portrait gameplay layout.

## 13. M5A exit criteria

M5A is complete when:

- `Night Courier 20` exists as a single named runtime token map;
- Phaser pixel-art filtering is enabled;
- the approved runtime asset directories exist;
- `BootScene` owns preload progress/failure handling and cannot continue after required-load failure;
- browser shell uses the canonical deep-night background and has a landscape-only portrait notice;
- touch layout and visual steering contracts are documented before their implementation;
- no fake production image/audio/font has been added merely to exercise the loader;
- `npm run typecheck`, production build and static-output smoke pass.

M5.1, M5.2 and M5.6+ remain incomplete until their actual implementation/validation gates are satisfied.
