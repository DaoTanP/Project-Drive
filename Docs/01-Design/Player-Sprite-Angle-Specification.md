# Player Sprite Angle Specification

## 1. Purpose

This document is the authoritative production specification for the **Night Courier** player-car steering sprites.

The current gameplay family is:

```text
Hard Left -> Left -> Center -> Right -> Hard Right
```

The useful principles remain small discrete yaw increments, controlled contraction of the rear plane, progressive side/wheel exposure and stable registration under one fixed pseudo-3D camera.

The resolution contract is now **256 x 256 px per frame**. This is an art-resolution/presentation change only. It does not change player physics, collision envelopes, route behavior, the five-state yaw contract or the current FLAT-only pitch scope.

Related authoritative documents:

- [`Art-Direction-and-Color-Palette.md`](Art-Direction-and-Color-Palette.md)
- [`Asset-Inventory-and-Sprite-Requirements.md`](Asset-Inventory-and-Sprite-Requirements.md)

## 2. Production goal

Every frame must read as:

```text
same vehicle
+ same fixed camera
+ same apparent scale
+ one controlled yaw change
```

not as independently illustrated cars at unrelated three-quarter angles.

Consistency has higher priority than added detail.

Current production remains exactly one pitch family:

```text
FLAT x 5 yaw states = 5 required player frames
```

`UPHILL` and `DOWNHILL` remain deferred and must not be generated or implemented unless representative gameplay proves the FLAT family insufficient.

## 3. Canonical sprite format

All five production steering frames use:

- canvas: **256 x 256 px**;
- file format: transparent PNG;
- one steering state per file;
- nearest-neighbor-friendly hard-edged construction;
- no road, floor, cast ground shadow, detached glow, text or decorative background;
- fixed registration across all five states;
- controlled transparent padding;
- no sprite content touching/cropping against the canvas edge.

The canonical filenames remain:

```text
player_rear_hard_left.png
player_rear_left.png
player_rear_center.png
player_rear_right.png
player_rear_hard_right.png
```

Do not add `_flat` to current filenames merely to anticipate a future pitch family.

### 3.1 Resolution migration rule

The previous 64 x 64 production contract is retired. Its useful geometric ratios are preserved at 4x pixel resolution.

Conceptually:

```text
old 64 px measurement x 4 = current 256 px guardrail
```

Do not upscale a finished 64 px frame merely to satisfy file dimensions. The 256 px frame must be authored/exported as the production master so silhouette, line work and controlled pixel clusters remain intentional at the new resolution.

## 4. Camera contract

The camera is fixed:

- behind the vehicle;
- slightly elevated;
- gently downward-looking;
- same camera height/pitch/distance for all frames;
- rear face remains the dominant visual plane;
- only vehicle yaw changes between steering states.

The frames are not side views, isometric views or showcase camera orbits.

## 5. Reference hierarchy

### Center

1. approved hero-vehicle references for identity;
2. this specification for gameplay camera, registration and palette.

Once accepted, `player_rear_center` is the gameplay master.

### Left / Right

1. `Center` for geometry, camera, scale and registration;
2. nearest same-direction identity reference only when hidden details need resolution.

### Hard Left / Hard Right

1. corresponding moderate steering frame as immediate progression reference;
2. `Center` for canonical scale/registration;
3. showcase references only for hidden identity details.

Do not average conflicting reference angles equally.

## 6. Measurement terminology

**Rear Plane Width** — apparent horizontal width of the rear-facing hatch/bumper plane.

**Visible Side Exposure** — amount of side body revealed by yaw. Yawing left under the fixed rear camera reveals more of the vehicle's right-hand side; the inverse applies on the right.

**Wheel Visibility** — amount of front/rear tire visible and therefore a strong orientation cue.

**Registration** — fixed relation between vehicle pixels and the 256 x 256 canvas: tire-contact line, roof band, center of mass and transparent bounds.

## 7. Master 256 px registration contract

| Metric | Target |
|---|---:|
| Canvas | `256 x 256 px` |
| Gameplay anchor X | `128 px` |
| Gameplay anchor Y | `232 px` |
| Tire-contact line | approximately `Y = 232` |
| Roof highest pixel | approximately `Y = 44-48` |
| Total occupied vehicle height | approximately `184-192 px` |
| Typical overall silhouette width | approximately `216-232 px` |
| Adjacent-state vertical drift | ideally `0 px`, maximum `4 px` |
| Adjacent-state horizontal registration drift | maximum about `4 px` unless perspective clearly requires otherwise |

General pixel-measurement tolerance is approximately **+/-4 px** unless a stricter rule is stated.

The bottom tire-contact registration and apparent scale are more important than identical outer bounding-box width.

Runtime uses the source anchor ratio:

```text
originX = 128 / 256 = 0.5
originY = 232 / 256 = 0.90625
```

Sprite alpha bounds do not define gameplay collision.

## 8. Angle progression

| State | Target yaw from Center |
|---|---:|
| `Hard Left` | approximately `-20° to -22°` |
| `Left` | approximately `-10° to -12°` |
| `Center` | `0°` |
| `Right` | approximately `+10° to +12°` |
| `Hard Right` | approximately `+20° to +22°` |

Do not introduce a large jump such as `0° -> 20° -> 45°`.

## 9. Center specification

`player_rear_center` is the master frame.

- rear plane nearly square to camera;
- no intentional left/right yaw;
- visually symmetric except for real vehicle asymmetry;
- rear wheels define tire-contact baseline;
- front wheels are not meaningfully visible.

### 9.1 Rear Plane Width

Normalized baseline:

```text
Center = 1.00
```

Practical 256 px target:

- dominant rear plane: approximately **136-144 px**.

### 9.2 Side exposure

- approximately **0-8 px** per side where camera perspective naturally reveals body depth.

## 10. Left specification

`player_rear_left` is the moderate-left state.

- yaw: approximately **10-12° left**;
- rear-plane width: `0.88-0.90 x Center`;
- practical rear-plane width when Center is 144 px: approximately **124-128 px**;
- visible right-side body/beltline: approximately **40-48 px**;
- visible right-side lower body: approximately **48-56 px**;
- opposite-side exposure: approximately **4-12 px** or visually negligible;
- right-front-wheel visible width: approximately **16-24 px**;
- left-front wheel hidden or at most an incidental **4 px** sliver;
- right-side glass strip: approximately **32-40 px**.

`Center <-> Left` must preserve tire-contact Y and apparent scale.

## 11. Hard Left specification

`player_rear_hard_left` is the maximum-left initial state.

- yaw: approximately **20-22° left**;
- still rear-dominant, never side-view;
- rear-plane width: `0.74-0.78 x Center`;
- practical rear-plane width when Center is 144 px: approximately **108-112 px**;
- visible right-side body/beltline: approximately **60-72 px**;
- visible right-side lower body: approximately **68-80 px**;
- opposite-side exposure: approximately **0-8 px**;
- right-front-wheel visible width: approximately **28-36 px**;
- right-side glass: approximately **52-64 px**.

`Left <-> Hard Left` must preserve tire-contact Y, roof-height band and center of mass.

## 12. Quantitative progression

| Metric | Center | Left | Hard Left |
|---|---:|---:|---:|
| yaw | `0°` | `10-12°` | `20-22°` |
| normalized rear-plane width | `1.00` | `0.88-0.90` | `0.74-0.78` |
| practical rear-plane width | `136-144 px` | `124-128 px` | `108-112 px` |
| visible right-side body | `0-8 px` | `40-48 px` | `60-72 px` |
| visible right-side lower body | `0-8 px` | `48-56 px` | `68-80 px` |
| visible right-front-wheel width | `0 px` | `16-24 px` | `28-36 px` |
| visible side-glass width | `0-8 px` | `32-40 px` | `52-64 px` |
| plate perspective shift | `0 px` | maximum about `4 px` | maximum about `8 px` |

These are production guardrails, not arithmetic that overrides a visually coherent frame.

## 13. Right and Hard Right

`Right` and `Hard Right` use geometric mirror measurements of the left family:

- `Right`: approximately `+10° to +12°`;
- `Hard Right`: approximately `+20° to +22°`;
- left-side body/glass exposure increases progressively;
- left-front-wheel visibility follows the `16-24 px` then `28-36 px` progression;
- rear-plane ratios remain `0.88-0.90` then `0.74-0.78`.

Do **not** runtime-flip final player bitmaps. The hero car contains asymmetric physical/livery details, so right-side frames remain separately authored.

## 14. Silhouette progression

```text
Center
rear plane = widest
side exposure = minimal
front wheel = hidden

Left / Right
rear plane = moderately narrower
near-side surface = modestly exposed
near-side front wheel = just visible

Hard Left / Hard Right
rear plane = narrower again
near-side surface = clearly exposed
near-side front wheel = visible but subordinate to rear wheel
```

The rear remains the strongest visual plane even at hard steering.

## 15. Identity locks

Across all five frames preserve:

- body model/proportions;
- roofline/hatch/spoiler;
- rear window and bumper structure;
- taillight configuration;
- plate proportions/color;
- wheel design and tire diameter;
- mirrors and exhaust side;
- door/window proportions;
- courier stripe geometry;
- cat-logo identity;
- outline/pixel-density language;
- shading language;
- lighting direction/intensity.

Perspective compression is allowed. Redesign is not.

## 16. Livery and asymmetry

Livery/logo visibility changes only because of perspective.

For the left family:

```text
Center < Left < Hard Left
```

for right-side livery visibility. The inverse applies on the right.

Exhaust, asymmetric livery breaks and other physical asymmetry must remain on their real side.

## 17. Pixel-art and palette constraints

Frames use:

- crisp hard edges;
- intentional clusters;
- controlled stepped diagonals;
- limited shading bands;
- no accidental bilinear/soft anti-aliasing;
- no painterly gradient/noise treatment.

The authoritative palette remains **Night Courier 20**.

Per frame:

- normal target: at or below the 20-color master palette;
- hard maximum: **24 visible colors excluding transparency**;
- additional derived shades require a concrete material/readability reason;
- no new intermediate anti-alias colors merely because yaw changes.

Increasing source resolution to 256 x 256 does **not** authorize increasing palette complexity.

## 18. Lighting contract

Every steering state uses the same neutral nighttime arcade lighting:

- same highlight direction;
- same shadow direction;
- same material value hierarchy;
- same equivalent taillight intensity;
- no angle-specific environmental reflections;
- no external glow outside the sprite silhouette.

## 19. Brake variants

Brake-light variants remain optional polish after the five steering frames pass.

Preferred optional set:

- center brake;
- moderate left brake;
- moderate right brake.

Do not regenerate vehicle geometry solely to create brighter brake lights.

## 20. Production sequence

```text
1. Center
2. Left from Center
3. Hard Left from Left + Center
4. Right from Center
5. Hard Right from Right + Center
```

For each new state, validate registration against Center before proceeding.

## 21. Runtime presentation contract

The five source textures are **256 x 256** production frames.

Initial runtime presentation also uses a `256 x 256` display box at the `960 x 540` logical resolution. This display size is presentation tuning and may later be adjusted based on gameplay readability without changing source asset resolution.

The player is placed using the canonical contact anchor `(128, 232)` rather than the geometric center of the canvas.

Steering texture selection is driven by a separate smoothed presentation value (`visualSteer`), not by changing physics state:

| `visualSteer` | Texture |
|---|---|
| `<= -0.68` | `player_rear_hard_left` |
| `-0.68 .. -0.18` | `player_rear_left` |
| `-0.18 .. +0.18` | `player_rear_center` |
| `+0.18 .. +0.68` | `player_rear_right` |
| `>= +0.68` | `player_rear_hard_right` |

Binary keyboard/touch input should therefore visibly traverse moderate frames on the way to and from hard steering.

Collision continues to use road-space gameplay envelopes; texture resolution, display size and transparent padding do not modify collision rules.

## 22. Acceptance checklist

A production player frame is accepted only when:

- [ ] PNG canvas is exactly **256 x 256 px**;
- [ ] background is true transparency;
- [ ] fixed gameplay camera matches Center;
- [ ] tire-contact registration is compatible with anchor `(128,232)`;
- [ ] roof/contact band and apparent scale remain stable;
- [ ] adjacent-state drift remains inside documented tolerance;
- [ ] rear-plane contraction follows the expected progression;
- [ ] side exposure and wheel visibility progress monotonically;
- [ ] livery/logo changes are perspective-driven;
- [ ] asymmetric details remain physically correct;
- [ ] Night Courier 20 / <=24-color rule is respected;
- [ ] no road, floor, cast ground shadow, background, text or external glow exists;
- [ ] neighboring frame swaps read as one rotating car rather than separate illustrations;
- [ ] nearest-neighbor runtime rendering remains crisp at gameplay scale.

Review sequences repeatedly:

```text
Hard Left -> Left -> Center -> Right -> Hard Right

Center -> Left -> Hard Left -> Left -> Center
Center -> Right -> Hard Right -> Right -> Center
```

## 23. Review outcome classification

### PASS

All mandatory identity, camera, format, registration, palette and progression checks pass.

### SOFT FAIL

Targeted edit preferred when core geometry is correct but, for example:

- yaw is slightly weak/strong;
- side exposure is off by roughly `4-8 px`;
- registration is off by roughly `4 px`;
- one wheel cue/pixel cluster needs cleanup;
- accidental shades exceed the color cap.

### HARD FAIL

Regenerate/reconstruct when:

- vehicle identity changes;
- camera pitch/distance changes;
- frame becomes side/showcase view;
- apparent scale/contact registration changes strongly;
- body/wheelbase proportions change;
- asymmetry appears on the wrong side;
- bitmap mirroring falsifies vehicle identity;
- background/ground shadow/glow is baked in;
- image is soft/painterly/anti-aliased rather than production-ready;
- adjacent swapping reads as separate cars.

## 24. Current repository migration status

The five player PNGs committed immediately before this resolution change are **staging references**, not accepted 256 px production exports.

Their observed source canvases are currently inconsistent:

- `player_rear_center.png`: `1254 x 1254`;
- `player_rear_right.png`: `1254 x 1254`;
- `player_rear_left.png`: `1256 x 1256`;
- `player_rear_hard_left.png`: `1256 x 1256`;
- `player_rear_hard_right.png`: `1256 x 1256`.

Runtime may load and scale these staging images during integration, but Batch A player acceptance remains pending until all five are explicitly re-exported/authored at exactly **256 x 256** with consistent registration.

Do not silently resample the mismatched staging PNGs and declare them accepted without visual review.

## 25. Deferred pitch-family guidance

This remains future-only.

If representative gameplay later demonstrates that one FLAT family cannot read road grade correctly, the possible expansion is:

```text
UPHILL x 5 yaw states
FLAT   x 5 yaw states
DOWNHILL x 5 yaw states
```

Activation requires gameplay evidence, not availability of art-generation capacity.

If activated later:

- all pitch families use the same **256 x 256** canvas;
- yaw state and pitch state remain independent concepts;
- vehicle identity/camera distance/pixel density remain locked;
- road-contact registration must remain stable enough to avoid vertical popping;
- `FLAT` remains the canonical geometry master;
- pitch families change chassis pitch, not camera orbit;
- physics/road grade do not derive from which bitmap is visible.

Until that gate is explicitly passed, do not add pitch-state runtime selection, extra asset slots or extra player-frame budget.

## 26. Scope guard

The resolution increase does not expand content scope.

Do not add by default:

- seven/fifteen yaw states;
- uphill/downhill frames;
- crash/spin/rollover sequences;
- manual distance/mipmap variants;
- player sprite atlasing solely because source frames are larger;
- sprite-bound collision;
- a player Animator/state-machine subsystem solely for five textures.
