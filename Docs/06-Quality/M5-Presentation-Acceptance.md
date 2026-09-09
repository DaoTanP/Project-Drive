# M5 — Presentation and Production Acceptance

## 1. Purpose

This document defines acceptance evidence for M5. It separates implementation completion from visual, mobile and asset-production validation.

Do not mark a production-art task complete because an asset merely loads, because a staging image can be scaled at runtime, or because a placeholder screenshot looks plausible.

## 2. M5A foundation acceptance

### Code/config

- [x] `Night Courier 20` is exposed as the canonical named runtime token map matching `NC-00` through `NC-19`.
- [x] Phaser production config enables pixel-art texture filtering.
- [x] Logical resolution remains `960 x 540` with aspect-preserving FIT scaling.
- [x] No physics/gameplay rules changed as part of presentation foundation.
- [x] No runtime source module was added solely for palette/assets/touch abstraction.

Existing M4 placeholder render code may retain local semantic color aliases temporarily; new production presentation must resolve from the canonical palette rather than introduce another competing master palette.

### Asset layout

- [x] `WebGame/public/assets/` contains only the approved top-level category directories.
- [x] No source-art working files are stored in runtime directories.
- [x] No zone-specific runtime directory hierarchy was introduced.

### Boot/load behavior

- [x] `BootScene` has a preload-stage status/error boundary.
- [x] Required asset load failure prevents transition to `GameScene`.
- [x] Failure state lists failed asset keys clearly enough for QA/debugging.
- [x] M5A does not add fake production assets solely to populate the queue.

Failure behavior was validated with a temporary CI workspace that injected a missing required image without changing repository runtime source. The test asserted `Boot` remained active, `Game` remained inactive, and the failed key appeared in the status text.

### Browser/mobile shell

- [x] Landscape viewport displays the game normally.
- [x] Portrait mobile-like viewport displays the rotate-device notice.
- [x] Canvas is not stretched to fill a non-16:9 viewport.
- [x] Pixel canvas scaling is configured for hard-edged presentation.

Structural production-browser checks passed at `960x540`, `844x390`, `1024x768`, and portrait `390x844`.

### Build gate

- [x] `npm ci` passes.
- [x] `npm run typecheck` passes.
- [x] `npm run build` passes.
- [x] built `dist/` serves successfully from a local static host.

## 3. Touch acceptance — M5.1/M5.2

Do not mark M5.1 complete until:

- [ ] touch produces the same normalized `InputState` consumed by keyboard driving;
- [ ] left/right steering works independently from throttle/brake;
- [ ] two simultaneous pointers can steer and accelerate/brake;
- [ ] releasing one pointer does not release another active control;
- [ ] route choice remains operable through normalized steering;
- [ ] pressed-state feedback is visible;
- [ ] controls remain usable in representative phone-wide and tablet-like landscape viewports.

Do not mark M5.2 complete until representative viewport tests include:

- [x] 16:9 landscape shell;
- [x] 19.5:9 or 20:9 landscape shell;
- [x] 4:3 landscape/tablet-like shell;
- [x] portrait orientation fallback;
- [x] no gameplay-coordinate distortion;
- [ ] no critical production HUD/touch-control clipping.

M5.2 therefore remains open until the touch and production HUD surfaces exist.

## 4. Player Batch A acceptance

The five player frames must pass the authoritative `Player-Sprite-Angle-Specification.md` checklist first.

### 4.1 256 x 256 source-format gate

The canonical player production source is **256 x 256 px per frame** with contact anchor approximately `(128,232)`.

Runtime integration satisfies:

- [x] `BootScene` queues all five canonical player texture keys;
- [x] `GameScene` renders a Phaser image instead of the procedural player placeholder;
- [x] initial player display box is `256 x 256`;
- [x] image origin is derived from source contact anchor `(128,232)`;
- [x] texture selection uses smoothed `visualSteer` presentation state;
- [x] presentation texture selection does not change road-space collision rules.

Production-size/visual acceptance requires:

- [x] every required player PNG is exactly `256 x 256`;
- [x] transparency is preserved;
- [ ] all five use compatible `(128,232)` contact registration;
- [ ] final files pass the full angle/identity/palette checklist.

**M5B registration blocker:** automated alpha-bound inspection plus representative 960x540 rendering demonstrates that the committed player exports do not currently place visible road-contact pixels near the frozen `Y=232` anchor. Measured visible alpha bounds are:

```text
hard_left  bottom ~201
left       bottom ~211
center     bottom ~213
right      bottom ~211
hard_right bottom ~202
```

The Center frame therefore ends roughly **19 px above** the canonical contact line, and representative gameplay visibly shows the vehicle floating above the road-contact position. Several steering frames also touch the horizontal canvas boundary. Do **not** hide this source defect through per-texture runtime offsets or per-state scale compensation; re-register/re-export the source family against the frozen 256x256 contract.

### 4.2 Gameplay visual acceptance

Runtime acceptance additionally requires:

- [x] binary keyboard steering visibly traverses moderate pose before hard pose;
- [x] releasing hard steering visibly traverses moderate pose before center;
- [x] pose selection does not affect physics/collision state;
- [ ] no threshold flicker is visible under human representative play;
- [ ] player anchor remains stable across all five textures;
- [ ] no unintended smoothing or obvious fractional-scale shimmer is visible with accepted final 256px sources;
- [ ] the player remains correctly grounded/readable over city, forest, mountain-pass and tunnel compositions.

The browser smoke recorded the actual texture sequence `Center -> Left -> Hard Left` under binary keyboard input and the reverse sequence on release. Player grounding remains blocking, so M5.6/M5.8 are not accepted yet.

Do not expand to seven yaw states or pitch families before this gate fails for a documented reason.

## 5. Traffic Batch A acceptance

Traffic production follows `Traffic-Sprite-Angle-Specification.md`.

### 5.1 Traffic source/family gate

Every production traffic visual must provide the complete five-yaw family:

```text
Hard Left -> Left -> Center -> Right -> Hard Right
```

For every shipping traffic visual:

- [x] all five PNGs are exact **`256 x 256`** transparent sources for taxi, hatchback, van and truck;
- [ ] all five use `(128,232)`-compatible road-contact registration;
- [x] canonical naming follows `traffic_<visual>_rear_<yaw>.png`;
- [ ] camera height/pitch/distance is visually approved as stable across each family;
- [ ] yaw progression is visually approved as monotonic and one vehicle rotating;
- [ ] rear-plane contraction/side exposure is visually approved as smooth;
- [ ] body model, wheelbase, lights, windows, livery and asymmetric details are fully reviewed across every family;
- [ ] right-side frames are confirmed not to be incorrect blind bitmap mirrors;
- [ ] no road, cast ground shadow, background or detached glow is confirmed across every frame;
- [x] source resolution remains `256 x 256` even though runtime display size is depth-projected.

The source-format smoke also confirms every vehicle frame remains at or below the documented 24-visible-color cap.

Traffic registration remains an acceptance risk. Measured visible-alpha bottoms vary materially across adjacent yaw states; examples include taxi `204..216`, hatchback `210..228`, van `230..238`, and truck `224..230`. These values are not automatically equivalent to tire contact, but the variance is large enough that final family registration must be corrected/visually approved rather than compensated by per-texture runtime offsets.

### 5.2 Traffic content count

Reduced minimum traffic content:

```text
3 visual identities x 5 yaw = 15 traffic frames
```

Standard initial traffic content:

```text
taxi + hatchback + van + truck
= 4 visual identities x 5 yaw
= 20 traffic frames
```

Acceptance:

- [x] at least three complete five-yaw traffic visual identities are integrated;
- [x] the standard four-identity set is integrated;
- [x] taxi/hatchback map only to existing `car` behavior;
- [x] van maps only to existing `van` behavior;
- [x] truck maps only to existing `truck` behavior;
- [x] no yaw state creates a new traffic AI/physics mode.

### 5.3 Runtime presentation and gameplay regression

- [x] traffic yaw selection derives from local projected road tangent rather than `roadX` position alone;
- [x] selected traffic yaw does not change longitudinal speed or lateral gameplay state;
- [x] selected traffic yaw does not change collision or near-miss envelopes;
- [ ] silhouettes are human-approved at collision and near-miss distances;
- [ ] final accepted sprite registration stays attached to projected road contact without visible bounce;
- [ ] projected scaling remains human-approved as crisp with no obvious texture bounce or smoothing;
- [x] traffic collision envelopes remain road-space gameplay data, not sprite/alpha bounds;
- [x] M3 collision/near-miss regression tests pass after five-yaw sprite integration.

Pure regression validation re-ran collision one-shot, near-miss one-shot, cargo damage and speed retention after the traffic rendering change. Representative browser renders also confirmed production traffic textures are projected in city, forest, mountain-pass and tunnel test views.

Do not expand traffic to pitch families or more than five yaw states without documented gameplay evidence.

## 6. Background acceptance

- [x] `bg_city_far` and `bg_city_mid` load at the frozen `2048 x 512` source size;
- [x] city far/mid authored layers create a readable depth stack in representative 960x540 rendering;
- [x] mid parallax moves faster than far parallax and remains presentation-only;
- [ ] natural zones reuse the compact shared background vocabulary after Batch B assets exist;
- [x] city outdoor backgrounds are suppressed outside the city, including inside tunnel;
- [x] no per-zone three-layer asset explosion is introduced.

Batch A intentionally leaves rural/forest/mountain-pass background replacement to M5C/Batch B; their M4 procedural placeholders remain active in the meantime.

## 7. Roadside sprite acceptance

- [ ] deterministic M4 placement remains stable between runs;
- [ ] authored landmarks retain stable positions;
- [ ] sprite-backed props render far-to-near;
- [ ] hill/crest clipping prevents props drawing through foreground terrain;
- [ ] bottom-center/documented pivots remain stable under perspective scaling;
- [ ] projected sprite objects are pooled/reused rather than allocated continuously per frame;
- [ ] all five zones remain distinguishable at gameplay speed with the shared prop inventory.

## 8. HUD/font acceptance

- [ ] debug-only `ZONE`, `BRANCH`, route percentage are removed from normal production HUD;
- [ ] timer, score, cargo and combo remain legible at 960x540;
- [ ] cargo state uses approved semantic colors;
- [ ] font is packaged locally;
- [ ] font redistribution license is documented/retained as required;
- [ ] no remote font dependency exists.

## 9. VFX/audio acceptance

### Collision

- [ ] feedback communicates impact without obscuring steering visibility;
- [ ] cargo/speed loss remains readable alongside visual/audio feedback;
- [ ] no damage-state sprite system is added by default.

### Near miss

- [ ] one-shot gameplay event produces one concise feedback event;
- [ ] combo feedback is readable without dominating road view.

### Audio

- [ ] audio assets are local/offline;
- [ ] first-user-interaction audio unlock is validated on representative browser/mobile runtime;
- [ ] music loop does not restart accidentally across temporary pause/resume;
- [ ] pause/resume stops/restores relevant audio without advancing simulation.

## 10. M5 completion acceptance

M5 is complete only when:

- [ ] keyboard and touch are production-usable;
- [ ] optional gamepad has either been added or explicitly skipped without delaying mobile completion;
- [ ] Batch A/B/C accepted assets are integrated;
- [ ] all five player production sources are exact `256 x 256` accepted exports with stable `(128,232)` contact registration;
- [ ] every shipping traffic visual has all five accepted `256 x 256` yaw frames with stable family registration;
- [ ] the normal runtime image count remains within the revised **~49–67 image** budget or a documented exception exists;
- [ ] font/music/SFX licensing is known and compatible with packaging;
- [ ] all five zone compositions remain visually coherent and distinguishable;
- [ ] pause/resume does not create simulation time jumps;
- [ ] production build remains fully local/offline;
- [ ] remaining subjective control/readability risks are handed to M7 human/device validation rather than claimed as automatically proven.
