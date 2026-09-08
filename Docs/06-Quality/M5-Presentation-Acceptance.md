# M5 — Presentation and Production Acceptance

## 1. Purpose

This document defines acceptance evidence for M5 and separates implementation completion from visual/mobile/asset-production validation.

Do not mark production art complete because it merely loads or because runtime scaling makes a staging image appear usable.

## 2. M5A foundation acceptance

### Code/config

- [x] `Night Courier 20` is the canonical runtime token map.
- [x] Phaser production config enables pixel-art texture filtering.
- [x] Logical resolution remains `960 x 540` with aspect-preserving FIT scaling.
- [x] Presentation foundation did not change physics/gameplay rules.
- [x] No generic palette/assets/touch manager was added.

### Asset layout

- [x] `WebGame/public/assets/` uses only approved top-level category directories.
- [x] No source-art working files are stored in runtime directories.
- [x] No per-zone runtime directory hierarchy was introduced.

### Boot/load behavior

- [x] `BootScene` owns preload-stage status/error handling.
- [x] Required load failure prevents transition to `GameScene`.
- [x] Failed asset keys are visible enough for QA/debugging.
- [x] No fake production asset was added solely to exercise the queue.

### Browser/mobile shell

- [x] Landscape viewport displays normally.
- [x] Portrait mobile-like viewport displays rotate-device notice.
- [x] Canvas is not stretched to non-16:9 gameplay coordinates.
- [x] Pixel canvas scaling is configured for hard edges.

Structural checks passed at `960x540`, `844x390`, `1024x768` and portrait `390x844`.

### Build gate

- [x] `npm ci` passes.
- [x] `npm run typecheck` passes.
- [x] `npm run build` passes.
- [x] built `dist/` serves from a local static host.

## 3. Touch acceptance — M5.1/M5.2

M5.1 remains incomplete until:

- [ ] touch produces the same normalized `InputState` used by keyboard;
- [ ] steering works simultaneously with throttle/brake;
- [ ] independent multi-touch pointers are retained correctly;
- [ ] releasing one pointer does not release another control;
- [ ] route choice remains operable through normalized steering;
- [ ] visible pressed-state feedback exists;
- [ ] representative phone/tablet landscape viewports remain usable.

M5.2 remains incomplete until:

- [x] 16:9 landscape shell checked;
- [x] phone-wide landscape shell checked;
- [x] 4:3 tablet-like shell checked;
- [x] portrait fallback checked;
- [x] no gameplay-coordinate distortion;
- [ ] no critical production HUD/touch-control clipping.

## 4. Player Batch A — 256 x 256 acceptance

The authoritative source contract is now **256 x 256 px per steering frame**.

### Runtime integration

- [x] all five canonical texture keys are queued by `BootScene`;
- [x] `GameScene` uses a Phaser image instead of the procedural player placeholder;
- [x] initial runtime display box is `256 x 256`;
- [x] runtime origin uses the canonical source contact anchor `(128,232)`;
- [x] texture selection derives from smoothed `visualSteer`, separate from physics;
- [x] texture size/alpha bounds do not alter road-space collision logic.

### Production source files

The currently committed images are staging references and **do not yet pass** the production-size gate:

- `player_rear_center.png`: observed `1254 x 1254`;
- `player_rear_right.png`: observed `1254 x 1254`;
- `player_rear_left.png`: observed `1256 x 1256`;
- `player_rear_hard_left.png`: observed `1256 x 1256`;
- `player_rear_hard_right.png`: observed `1256 x 1256`.

Before player Batch A is accepted:

- [ ] every player PNG is exactly **256 x 256**;
- [ ] true transparency is preserved;
- [ ] canonical contact registration is compatible with `(128,232)`;
- [ ] the five files pass `Player-Sprite-Angle-Specification.md`;
- [ ] no file is accepted merely because a high-resolution staging image was downscaled at runtime.

### Gameplay visual acceptance

- [ ] binary keyboard/touch steering visibly traverses moderate pose before hard pose;
- [ ] releasing hard steering visibly traverses moderate pose before center;
- [ ] pose selection does not produce visible contact-line jumping;
- [ ] no threshold flicker is visible at representative frame rates;
- [ ] no unintended smoothing/fractional-scale shimmer is visible with final 256 px sources;
- [ ] player remains readable over city, forest, mountain-pass and tunnel compositions;
- [ ] adjacent states read as one rotating vehicle, not independently scaled illustrations.

Do not expand to seven yaw states or pitch families before this gate fails for a documented reason.

## 5. Traffic Batch A acceptance

- [ ] at least three production traffic visuals are integrated;
- [ ] visuals map only to `car`, `van`, `truck` behavior classes;
- [ ] silhouettes remain readable at collision/near-miss distances;
- [ ] sprite scale/anchor stays attached to projected road position;
- [ ] collision envelopes remain road-space data, not sprite bounds;
- [ ] M3 collision/near-miss regression tests pass after sprite integration.

## 6. Background acceptance

- [ ] city far/mid layers create depth without competing with player/traffic;
- [ ] parallax remains presentation-only;
- [ ] natural zones reuse compact shared backgrounds;
- [ ] outdoor backgrounds are suppressed/replaced in tunnel;
- [ ] no per-zone three-layer asset explosion occurs.

## 7. Roadside sprite acceptance

- [ ] deterministic M4 placement remains stable;
- [ ] authored landmarks retain stable positions;
- [ ] sprite-backed props render far-to-near;
- [ ] crest clipping prevents props drawing through terrain;
- [ ] documented pivots remain stable under perspective scaling;
- [ ] projected image objects are pooled/reused;
- [ ] all five zones remain distinguishable with shared inventory.

## 8. HUD/font acceptance

- [ ] debug-only `ZONE`, `BRANCH`, route percentage are removed from normal production HUD;
- [ ] timer, score, cargo and combo remain legible at 960x540;
- [ ] cargo uses approved semantic colors;
- [ ] font is packaged locally;
- [ ] redistribution license is documented/retained;
- [ ] no remote font dependency exists.

## 9. VFX/audio acceptance

### Collision

- [ ] feedback communicates impact without obscuring steering visibility;
- [ ] cargo/speed loss remains readable;
- [ ] no damage-state sprite system is added by default.

### Near miss

- [ ] one-shot gameplay event produces one concise feedback event;
- [ ] combo feedback does not dominate road view.

### Audio

- [ ] audio assets are local/offline;
- [ ] first-user-interaction audio unlock is validated;
- [ ] music loop does not accidentally restart across pause/resume;
- [ ] pause/resume restores relevant audio without simulation advancement.

## 10. M5 completion acceptance

M5 completes only when:

- [ ] keyboard and touch are production-usable;
- [ ] optional gamepad is added or explicitly skipped without delaying mobile completion;
- [ ] Batch A/B/C accepted assets are integrated;
- [ ] player production sprites are exact 256 x 256 exports;
- [ ] runtime image count remains inside budget or has a documented exception;
- [ ] font/music/SFX licensing is compatible with packaging;
- [ ] all five zone compositions remain coherent/distinct;
- [ ] pause/resume creates no simulation time jump;
- [ ] production build remains fully local/offline;
- [ ] subjective control/readability risks are handed to M7 human/device validation rather than claimed automatically.
