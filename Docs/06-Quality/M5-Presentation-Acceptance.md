# M5 — Presentation and Production Acceptance

## 1. Purpose

This document defines acceptance evidence for M5. It separates implementation completion from visual, mobile and asset-production validation.

Do not mark a production-art task complete because an asset merely loads or because a placeholder screenshot looks plausible.

## 2. M5A foundation acceptance

### Code/config

- [ ] `Night Courier 20` is represented once as named runtime tokens matching `NC-00` through `NC-19`.
- [ ] Phaser production config enables pixel-art texture filtering.
- [ ] Logical resolution remains `960 x 540` with aspect-preserving FIT scaling.
- [ ] No physics/gameplay rules changed as part of presentation foundation.
- [ ] No runtime source module was added solely for palette/assets/touch abstraction.

### Asset layout

- [ ] `WebGame/public/assets/` contains only the approved top-level category directories.
- [ ] No source-art working files are stored in runtime directories.
- [ ] No zone-specific runtime directory hierarchy was introduced.

### Boot/load behavior

- [ ] `BootScene` has a preload-stage status/error boundary.
- [ ] Required asset load failure prevents transition to `GameScene`.
- [ ] Failure state lists failed asset keys clearly enough for QA/debugging.
- [ ] M5A does not add fake production assets solely to populate the queue.

### Browser/mobile shell

- [ ] Landscape viewport displays the game normally.
- [ ] Portrait mobile-like viewport displays the rotate-device notice.
- [ ] Canvas is not stretched to fill a non-16:9 viewport.
- [ ] Pixel canvas scaling is configured for hard-edged presentation.

### Build gate

- [ ] `npm ci` passes.
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` passes.
- [ ] built `dist/` serves successfully from a local static host.

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

- [ ] 16:9 landscape;
- [ ] 19.5:9 or 20:9 landscape;
- [ ] 4:3 landscape/tablet-like viewport;
- [ ] portrait orientation fallback;
- [ ] no gameplay-coordinate distortion;
- [ ] no critical HUD/control clipping.

## 4. Player Batch A acceptance

The five player frames must pass the authoritative `Player-Sprite-Angle-Specification.md` checklist first.

Runtime acceptance additionally requires:

- [ ] binary keyboard/touch steering visibly traverses moderate pose before hard pose;
- [ ] releasing hard steering visibly traverses moderate pose before center;
- [ ] pose selection does not affect physics/collision state;
- [ ] no threshold flicker is visible at representative frame rates;
- [ ] player anchor remains stable across all five textures;
- [ ] no unintended smoothing or obvious fractional-scale shimmer is visible;
- [ ] the player remains readable over city, forest, mountain-pass and tunnel compositions.

Do not expand to seven yaw states or pitch families before this gate fails for a documented reason.

## 5. Traffic Batch A acceptance

- [ ] at least three production traffic visuals are integrated;
- [ ] visuals map only to existing `car`, `van`, `truck` behavior classes;
- [ ] silhouettes remain readable at collision and near-miss distances;
- [ ] sprite scale/anchor stays attached to projected road position;
- [ ] traffic collision envelopes remain road-space gameplay data, not sprite bounds;
- [ ] M3 collision/near-miss regression tests still pass after sprite integration.

## 6. Background acceptance

- [ ] city far/mid layers create depth without competing with traffic/player contrast;
- [ ] parallax remains presentation-only;
- [ ] natural zones reuse the compact shared background vocabulary;
- [ ] outdoor backgrounds are suppressed/replaced inside tunnel;
- [ ] no per-zone three-layer asset explosion occurs.

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
- [ ] runtime image count remains within the approved budget or a documented exception exists;
- [ ] font/music/SFX licensing is known and compatible with packaging;
- [ ] all five zone compositions remain visually coherent and distinguishable;
- [ ] pause/resume does not create simulation time jumps;
- [ ] production build remains fully local/offline;
- [ ] remaining subjective control/readability risks are handed to M7 human/device validation rather than claimed as automatically proven.
