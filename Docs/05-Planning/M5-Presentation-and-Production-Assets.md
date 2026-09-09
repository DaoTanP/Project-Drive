# M5 — Presentation, Controls and Production Assets

## 1. Purpose

M5 converts the mechanically complete M1–M4 build from procedural/placeholding presentation into the production-readable Night Courier minigame.

M5 must not redesign driving, traffic, route, scoring or the five-zone environment model. Presentation code consumes the existing simulation state.

Authoritative inputs:

- [`../01-Design/Art-Direction-and-Color-Palette.md`](../01-Design/Art-Direction-and-Color-Palette.md)
- [`../01-Design/Asset-Inventory-and-Sprite-Requirements.md`](../01-Design/Asset-Inventory-and-Sprite-Requirements.md)
- [`../01-Design/Player-Sprite-Angle-Specification.md`](../01-Design/Player-Sprite-Angle-Specification.md)
- [`../01-Design/Traffic-Sprite-Angle-Specification.md`](../01-Design/Traffic-Sprite-Angle-Specification.md)
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

**Status:** complete. Runtime/config/build and browser-shell checks passed, including an injected missing-required-asset test proving Boot remains active and Game does not start on load failure. M5.1/M5.2 production touch/HUD validation and all production-art acceptance remain later M5 scope.

M5A establishes infrastructure and contracts without adding fake production assets.

### Runtime foundation

- expose the complete `Night Courier 20` palette as canonical named TypeScript tokens;
- enable Phaser pixel-art texture filtering through game configuration;
- keep logical simulation/render coordinates at `960 x 540`;
- keep `Phaser.Scale.FIT` and centered scaling;
- create the approved `WebGame/public/assets/` runtime directory tree;
- add `BootScene.preload()` progress/error infrastructure;
- do not allow a required asset load failure to enter gameplay;
- do not add a generalized asset manager, asset database or custom atlas pipeline.

Existing M4 procedural placeholder code may retain local semantic color aliases temporarily, but new production presentation must resolve from the canonical token map rather than defining a competing palette.

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

M5A structurally validated `960x540`, phone-wide `844x390`, tablet-like `1024x768`, and portrait `390x844`. M5.2 remains incomplete until production touch/HUD controls are also checked for clipping and usability.

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

## 6. Vehicle yaw-presentation contracts

### 6.1 Player visual steering

The five player sprites are presentation state, not five physics modes.

The simulation continues to consume raw normalized steering. `GameScene` maintains a separate presentation value named `visualSteer` that approaches the current steering input over a short arcade response window.

This separation is required so binary keyboard/touch input can visibly pass through the moderate steering frames instead of snapping directly from `Center` to `Hard Left/Hard Right`.

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

### 6.2 Player 256 x 256 source contract

The previous 64 x 64 player source contract is retired.

The current player presentation contract is:

```text
source canvas = 256 x 256 px
initial runtime display box = 256 x 256
canonical contact anchor = (128, 232)
```

The resolution change does not alter yaw angles, five-state count, FLAT-only scope, physics or road-space collision.

### 6.3 Traffic five-yaw contract

Every production traffic visual uses the complete five-yaw family documented in `Traffic-Sprite-Angle-Specification.md`:

```text
Hard Left -> Left -> Center -> Right -> Hard Right
```

Every traffic frame is an exact **`256 x 256`** transparent source image using a road-contact anchor compatible with `(128,232)`.

Canonical naming pattern:

```text
traffic_<visual>_rear_<yaw>.png
```

Examples:

```text
traffic_taxi_rear_center.png
traffic_taxi_rear_left.png
traffic_taxi_rear_hard_left.png
traffic_van_rear_right.png
traffic_truck_rear_hard_right.png
```

Traffic yaw is presentation state. It should derive from local projected road tangent / relative heading and any real lateral heading if that mechanic later exists; it must **not** become an AI steering state.

Traffic pose selection must not alter:

- `TrafficType`;
- traffic speed;
- road-space `roadX`;
- collision envelope;
- near-miss envelope/state;
- recycle/spawn logic.

The `256 x 256` size is a source/export contract only. Traffic runtime display size remains pseudo-3D projected and depth-dependent; do not render traffic at a fixed 256px box.

A `Center`-only traffic visual may exist temporarily during integration, but final Batch A acceptance requires all five yaw states for every traffic visual that ships.

## 7. Batch A — gameplay-readable art

Produce and integrate only after M5A contracts are stable.

### Player

Exactly five required **`256 x 256`** transparent FLAT frames:

```text
player_rear_hard_left.png
player_rear_left.png
player_rear_center.png
player_rear_right.png
player_rear_hard_right.png
```

They follow `Player-Sprite-Angle-Specification.md` exactly.

Runtime integration preloads these five keys, renders the player with a Phaser image rather than the procedural player placeholder, uses the `(128,232)` source contact anchor and selects textures through smoothed `visualSteer`.

### Traffic

Standard Batch A traffic content is four production visual identities:

```text
taxi       -> car
hatchback  -> car
van        -> van
truck      -> truck
```

Each identity requires five `256 x 256` yaw frames:

```text
rear_hard_left
rear_left
rear_center
rear_right
rear_hard_right
```

Counts:

```text
reduced minimum: 3 identities x 5 = 15 traffic frames
standard target: 4 identities x 5 = 20 traffic frames
```

Visual/yaw variety must not create new traffic behavior classes.

Produce one complete traffic family and validate registration/camera continuity before finalizing all twenty frames.

### First backgrounds

```text
bg_city_far.png
bg_city_mid.png
```

Batch A image count is therefore:

- **22 images minimum** = 5 player + 15 traffic + 2 backgrounds;
- **27 images standard** = 5 player + 20 traffic + 2 backgrounds.

### Batch A gate

Before Batch B:

- all five player source PNGs are exact `256 x 256` exports;
- player pose transitions read as one vehicle at gameplay speed;
- player remains readable against city/forest/mountain-pass/tunnel placeholder compositions;
- player contact anchor remains stable across all five states;
- every shipping traffic visual has all five exact `256 x 256` yaw frames;
- every traffic family preserves stable `(128,232)`-compatible contact registration and apparent scale;
- traffic yaw changes read as one vehicle rotating, not independent concept renders;
- traffic silhouettes remain readable at near-miss/collision distances;
- traffic pose selection does not change road-space collision or near-miss behavior;
- pivots and transparent bounds are stable;
- nearest-neighbor rendering shows no obvious smoothing;
- no player or traffic pitch-family expansion is justified by default.

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
- traffic uphill/downhill pitch families;
- more than five player yaw states;
- more than five traffic yaw states;
- new traffic AI types;
- lane-change/steering AI solely to justify traffic yaw art;
- zone-specific vehicle physics;
- full 3D tunnel;
- per-zone asset packs;
- generalized UI framework;
- generalized vehicle-animation framework;
- custom atlas/content pipeline;
- shader palette system;
- audio middleware;
- multiple music tracks;
- portrait gameplay layout.

## 13. M5A exit criteria

M5A is complete when:

- `Night Courier 20` exists as the canonical named runtime token map;
- Phaser pixel-art filtering is enabled;
- the approved runtime asset directories exist;
- `BootScene` owns preload progress/failure handling and cannot continue after required-load failure;
- browser shell uses the canonical deep-night background and has a landscape-only portrait notice;
- touch layout and vehicle-yaw presentation contracts are documented before their implementation;
- no fake production image/audio/font has been added merely to exercise the loader;
- `npm run typecheck`, production build, static-output smoke and representative shell checks pass.

M5.1, final M5.2 touch/HUD validation and the unaccepted production-art portions of M5.6+ remain incomplete until their actual implementation/validation gates are satisfied.
