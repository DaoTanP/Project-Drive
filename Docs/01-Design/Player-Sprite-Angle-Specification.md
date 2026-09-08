# Player Sprite Angle Specification

## 1. Purpose

This document is the authoritative production specification for the **Night Courier** player-car steering sprites.

It defines the visual progression, registration and measurable geometry for:

```text
Hard Left -> Left -> Center -> Right -> Hard Right
```

The specification is derived from the useful visual principles observed in the supplied **Turbo Out Run** vehicle sprite sheet: small discrete yaw increments, controlled contraction of the visible rear plane, progressive side exposure, wheel visibility as an orientation cue, and stable registration between frames.

Night Courier does **not** copy Turbo Out Run vehicle art, sprite dimensions or ROM/hardware constraints. The reference informs angle progression and sprite-animation reasoning only.

Related authoritative documents:

- [`Art-Direction-and-Color-Palette.md`](Art-Direction-and-Color-Palette.md)
- [`Asset-Inventory-and-Sprite-Requirements.md`](Asset-Inventory-and-Sprite-Requirements.md)

## 2. Production goal

All steering frames must read as **one unchanged vehicle rotating progressively under one fixed pseudo-3D gameplay camera**.

The player should perceive:

```text
same car + same camera + small yaw change
```

not:

```text
independently illustrated cars at unrelated three-quarter angles
```

Consistency has higher priority than added detail.

The current production phase uses exactly **one pitch family: FLAT**. The five steering sprites defined by this document are all flat-road gameplay sprites. `UPHILL` and `DOWNHILL` pitch families are documented only as a future extension and must not be generated, implemented or counted in the current asset budget unless later gameplay evidence explicitly justifies them.

The canonical player-frame resolution is now **256 x 256 px**. This is a presentation-resolution change only; it does not alter the yaw contract, physics, collision or five-frame scope.

## 3. Canonical sprite format

The initial player steering set uses:

- canvas: **256 x 256 px**;
- file format: transparent PNG;
- one state per file;
- nearest-neighbor-friendly true pixel construction;
- no ground, road, cast shadow, detached glow, text or decorative background;
- fixed visual registration across all five steering states.

The player sprite should maximize useful coverage inside the 256 x 256 canvas without touching or cropping at the canvas boundary.

The generic player-size guidance elsewhere in the asset inventory is secondary to this explicit steering-frame contract.

The previous 64 x 64 contract is retired. Its useful pixel guardrails are preserved by scaling them **4x** while keeping all normalized ratios and yaw values unchanged. Do not simply upscale a finished 64 px bitmap and call it a production 256 px master; the 256 px export must preserve intentional pixel construction and registration.

## 4. Camera contract

The camera is fixed and follows the classic pseudo-3D arcade-racer presentation:

- positioned behind the vehicle;
- slightly elevated;
- looking gently downward;
- rear face remains the dominant visible surface in every steering state;
- no camera yaw change between player steering frames;
- no camera-distance or perspective-strength change between frames.

Only the apparent vehicle yaw changes.

The steering frames are not orthographic side views, isometric views or showcase renders.

## 5. Reference hierarchy for asset generation

When producing or regenerating a state, references should be prioritized as follows.

### Center

1. approved rear-side and front-side hero-vehicle showcases for identity;
2. this specification for camera, registration and palette constraints.

Once approved, `player_rear_center` becomes the canonical gameplay master.

### Left / Right

1. `player_rear_center` as immutable gameplay geometry/registration master;
2. nearest same-direction showcase only when hidden detail must be resolved;
3. other showcase views as tertiary identity reference.

### Hard Left / Hard Right

1. corresponding moderate steering frame (`Left` or `Right`) as immediate angle-progression master;
2. `Center` as canonical geometry/scale/registration master;
3. showcase references only for resolving obscured vehicle details.

Do not average several conflicting reference angles equally. The nearest gameplay frame always has priority for continuity.

## 6. Measurement terminology

### 6.1 Rear Plane Width

The apparent horizontal width of the rear-facing hatch/bumper plane.

This is the strongest orientation measurement. It contracts as yaw increases.

### 6.2 Visible Side Exposure

The width of the side body surface revealed by yaw.

When the vehicle yaws left while viewed from behind, more of its **right-hand side** becomes visible. The inverse applies for right steering.

### 6.3 Wheel Visibility

The amount of each wheel/tire visible in the frame. Wheel appearance is a strong depth/orientation cue and must progress smoothly.

### 6.4 Registration

The fixed relationship between the vehicle and the 256 x 256 canvas: tire-contact line, roof-height band, center of mass and transparent bounds.

## 7. Master registration contract

Use these initial production targets for all five states:

| Metric | Target |
|---|---:|
| Canvas | `256 x 256 px` |
| Anchor X | `128 px` |
| Anchor Y | `232 px` |
| Tire-contact line | approximately `Y = 232` |
| Roof highest pixel | approximately `Y = 44-48` |
| Total sprite height | approximately `184-192 px` |
| Typical overall silhouette width | approximately `216-232 px` |
| Allowed vertical drift between adjacent states | ideally `0 px`, maximum `4 px` |
| Allowed horizontal registration drift between adjacent states | maximum `4 px` unless perspective requires otherwise |

These are production registration targets rather than collision geometry.

Tolerance for hand-authored/generated pixel geometry is generally **+/-4 px** unless a stricter rule is stated below.

The bottom contact registration is more important than perfectly identical outer bounding-box width.

Runtime uses the same contact registration through normalized origin `(0.5, 0.90625)`, derived from `(128,232)` on the 256 x 256 source canvas.

## 8. Angle progression

The initial five-state steering set uses a deliberately small arcade progression:

| State | Target yaw from Center |
|---|---:|
| `Hard Left` | approximately `-20° to -22°` |
| `Left` | approximately `-10° to -12°` |
| `Center` | `0°` |
| `Right` | approximately `+10° to +12°` |
| `Hard Right` | approximately `+20° to +22°` |

Do not use large jumps such as `0° -> 20° -> 45°`.

The difference between `Left` and `Hard Left` should be comparable to, or slightly smaller than, the difference between `Center` and `Left`. The same rule applies on the right.

## 9. Center specification

`player_rear_center` is the master frame.

### 9.1 Visual intent

- neutral driving state;
- rear face nearly square to the camera;
- visually symmetric except for real vehicle-design asymmetries;
- no intentional left/right yaw.

### 9.2 Rear Plane Width

Normalized baseline:

```text
Center = 1.00
```

Practical target on the 256 x 256 canvas:

- approximately **136-144 px** for the dominant rear plane.

### 9.3 Side exposure

- near zero intentional side exposure;
- approximately **0-8 px** per side where camera perspective naturally reveals body depth.

### 9.4 Wheels

- left and right rear tire footprints visually balanced;
- front wheels should not be meaningfully visible;
- rear wheel/tire contact points define the registration baseline.

### 9.5 Rear elements

- rear glass, bumper and taillight composition should read nearly symmetric;
- plate remains centered on the rear plane;
- spoiler/hatch geometry establishes the canonical shape used by every later frame.

## 10. Left specification

`player_rear_left` is the moderate-left steering state.

### 10.1 Angle

- target yaw: **10-12° left from Center**.

### 10.2 Rear Plane Width

Target:

```text
0.88-0.90 x Center
```

If Center is 144 px, a practical target is approximately **124-128 px**.

### 10.3 Visible side exposure

Because the car yaws left under a fixed rear camera, reveal more of the **right-hand side**.

Targets:

- right-side body/beltline exposure: approximately **40-48 px**;
- right-side lower-body exposure: approximately **48-56 px**;
- opposite-side exposure: approximately **4-12 px** or visually negligible.

### 10.4 Wheels

- right rear wheel becomes more visible than in Center;
- right front wheel begins to appear;
- right front wheel visible width target: approximately **16-24 px**;
- left rear wheel remains visible but slightly perspective-compressed;
- left front wheel remains hidden or only an incidental `4 px` sliver.

### 10.5 Side glass / livery

- right-side glass strip target: approximately **32-40 px**;
- courier stripe begins to read on the side surface;
- cat logo may begin to appear, but should not suddenly become a full side-view graphic.

### 10.6 Registration

`Center <-> Left` must not visibly jump vertically. Keep the same tire-contact Y and apparent overall vehicle scale.

## 11. Hard Left specification

`player_rear_hard_left` is the maximum-left initial steering state.

### 11.1 Angle

- target yaw: **20-22° left from Center**;
- approximately one controlled step farther than `Left`;
- still rear-dominant, never a side-view showcase.

### 11.2 Rear Plane Width

Target:

```text
0.74-0.78 x Center
```

If Center is 144 px, a practical target is approximately **108-112 px**.

### 11.3 Visible side exposure

Reveal more of the **right-hand side** than in `Left`:

- right-side body/beltline exposure: approximately **60-72 px**;
- right-side lower-body exposure: approximately **68-80 px**;
- opposite-side exposure: approximately **0-8 px**.

### 11.4 Wheels

- right rear wheel is the most visually exposed wheel;
- right front wheel becomes clearly visible but remains smaller/less dominant than the right rear wheel;
- right front wheel visible width target: approximately **28-36 px**;
- left rear wheel remains visible but compressed;
- left front wheel remains hidden or at most a negligible sliver.

### 11.5 Side glass / livery

- right-side glass target: approximately **52-64 px**;
- side stripe and door area are more readable than in `Left`;
- logo visibility increases progressively rather than appearing/disappearing discontinuously.

### 11.6 Registration

`Left <-> Hard Left` must preserve the same tire-contact Y, roof-height band and approximate center of mass. Perspective may alter silhouette width, but it must not look like the car changes size.

## 12. Quantitative left-side progression

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

The numbers are guardrails for consistent production, not a requirement to distort an otherwise correct sprite to satisfy arithmetic exactly.

## 13. Right and Hard Right

`Right` and `Hard Right` use the **geometric mirror** of the left-side measurements:

- `Right`: approximately `+10° to +12°`;
- `Hard Right`: approximately `+20° to +22°`;
- left-hand side exposure increases progressively;
- left-front-wheel visibility follows the `16-24 px` then `28-36 px` progression;
- rear-plane contraction uses the same normalized ratios.

However, do **not** runtime-flip the final player bitmap as the production solution.

The approved hero car contains asymmetric identity details such as exhaust placement and potentially asymmetric livery/body details. `Right` and `Hard Right` therefore remain separately authored/generated frames using mirrored angle metrics while preserving the car's real left/right details.

## 14. Silhouette progression rule

The family should visually behave like:

```text
Center:
rear plane = widest
side exposure = minimal
front wheel = hidden

Left/Right:
rear plane = slightly narrower
near-side surface = modestly exposed
near-side front wheel = just visible

Hard Left/Hard Right:
rear plane = narrower again
near-side surface = clearly exposed
near-side front wheel = visible but subordinate to rear wheel
```

The rear must remain the largest/strongest visual plane even at hard steering.

## 15. Livery and logo continuity

The red-orange courier stripe and cat-logo visibility must change only because of perspective.

For the left family:

```text
Center < Left < Hard Left
```

for visibility of right-side livery/door details.

The inverse applies to the right family.

Do not redraw the stripe into a new shape, relocate the logo, change logo proportions or make the logo suddenly fully visible at the moderate steering state.

## 16. Vehicle-identity locks

Across every steering frame, preserve the same:

- body model and proportions;
- roofline and hatch shape;
- spoiler shape;
- rear-window dimensions;
- taillight configuration;
- bumper thickness/design;
- license-plate proportions and color;
- wheel design and tire diameter;
- mirror design;
- exhaust side and shape;
- door/window proportions;
- courier stripe geometry;
- cat-logo identity;
- outline thickness;
- pixel density;
- shading language;
- lighting direction/intensity.

Perspective compression is permitted. Redesign is not.

## 17. Pixel-art and palette constraints

Player steering frames use:

- crisp hard pixel edges;
- intentional pixel clusters;
- stepped diagonals;
- limited shading bands;
- no accidental bilinear/soft anti-aliasing;
- no painterly gradients or high-frequency detail noise.

The authoritative palette remains **Night Courier 20**.

Per player frame, use a **hard maximum of 24 visible colors** excluding transparency. The expected normal case is at or below the 20-color master palette. Additional derived shades within the 24-color hard cap require a concrete readability/material reason and must remain consistent across the frame family.

Do not generate new intermediate anti-alias colors merely because the angle changed.

Increasing source resolution to 256 x 256 does not authorize additional palette complexity.

## 18. Lighting contract

All steering states use identical neutral nighttime arcade lighting:

- same highlight direction;
- same shadow direction;
- same material brightness hierarchy;
- same taillight intensity for equivalent non-braking states;
- no angle-specific environmental reflections;
- no external glow outside the sprite silhouette.

An independently generated frame must not reveal itself through a different lighting treatment.

## 19. Brake variants

Brake-light states are optional polish after the five steering states are accepted.

If produced, brake variants must derive from the accepted steering geometry. Do not regenerate a new vehicle pose solely to obtain brighter brake lights.

Preferred initial variants remain:

- center brake;
- moderate left brake;
- moderate right brake.

Hard-steering brake variants are not required unless playtesting demonstrates a visible gap.

## 20. Asset-generation sequence

Recommended production order:

```text
1. Center
2. Left from Center
3. Hard Left from Left + Center
4. Right from Center
5. Hard Right from Right + Center
```

Do not generate all five independently with equal reference weighting.

For each new state, validate registration against `Center` before proceeding to the next state.

## 21. Acceptance checklist

A player steering frame is accepted only when:

- [ ] it is a transparent `256 x 256` PNG;
- [ ] the fixed camera perspective matches the approved Center frame;
- [ ] tire-contact registration is within the documented tolerance;
- [ ] roof height and apparent vehicle scale remain stable;
- [ ] rear-plane contraction follows the expected progression;
- [ ] side exposure follows the expected progression;
- [ ] wheel visibility changes progressively rather than jumping;
- [ ] livery/logo visibility is perspective-driven and continuous;
- [ ] asymmetric vehicle details remain on their real side;
- [ ] palette use follows Night Courier 20 and the frame remains at or below the 24-color hard cap;
- [ ] no road, floor, ground shadow, background, text or external glow is present;
- [ ] alternating adjacent frames reads as one car rotating, not as two different cars.

## 22. Scope guard

The initial release remains a **five-steering-frame FLAT player set**.

Do not expand immediately to:

- seven or fifteen yaw states;
- `UPHILL` or `DOWNHILL` player pitch families;
- any other multiple vertical/pitch sprite families;
- manually authored distance/mipmap variants for the player;
- rollover/spin/crash rotation sprite sequences.

If five states visibly snap during representative gameplay, first verify angle progression and registration against this spec. Only then consider seven states as a measured polish expansion.

If road-grade presentation later makes the single FLAT family visibly incorrect, first validate whether road projection/camera logic can solve the problem without new vehicle art. Only after representative gameplay demonstrates a persistent visual mismatch should the deferred pitch-family guidance in Section 25 become eligible for production.

## 23. Master consistency checklist

Use this checklist after every generated or manually edited player sprite. It is the production review gate for both an individual frame and the complete five-frame steering family.

### 23.1 File and format

- [ ] File is PNG.
- [ ] Canvas is exactly `256 x 256 px`.
- [ ] Background is true transparency, not a baked checkerboard or solid-color substitute.
- [ ] Vehicle fits completely inside the canvas.
- [ ] No sprite pixel touches or is cropped by a canvas edge.
- [ ] Transparent padding is controlled and comparable with neighboring states.
- [ ] No road, floor, environment, skyline, text, UI, border or decorative background is present.
- [ ] No cast ground shadow or detached external glow is present.

### 23.2 Same-car identity

- [ ] Body model is recognizably identical to `Center`.
- [ ] Roofline is unchanged except for valid perspective compression.
- [ ] Rear hatch and rear-window shapes belong to the same underlying geometry.
- [ ] Spoiler shape and placement are consistent.
- [ ] Bumper design and thickness are consistent.
- [ ] Taillight count, shape family and placement remain consistent.
- [ ] Wheel design and tire diameter remain consistent.
- [ ] Mirror design remains consistent where visible.
- [ ] License-plate shape, color and physical location remain consistent.
- [ ] Exhaust remains on its correct physical side and uses the same shape.
- [ ] Courier stripe follows the same underlying livery geometry.
- [ ] Cat-logo identity, scale logic and physical placement remain consistent.
- [ ] No state appears to be a different hatchback/coupe variant or a separately redesigned concept render.

### 23.3 Camera and viewpoint

- [ ] Camera remains behind the vehicle.
- [ ] Camera remains slightly elevated and gently downward-looking.
- [ ] Camera height appears unchanged from `Center`.
- [ ] Camera pitch appears unchanged from `Center`.
- [ ] Camera distance/apparent perspective strength appears unchanged.
- [ ] Rear face remains the dominant visual plane in every state.
- [ ] No steering state becomes a true side view.
- [ ] No steering state becomes a dramatic showcase rear-three-quarter render.
- [ ] The angle change reads as vehicle yaw under a fixed camera, not camera orbit around the vehicle.

### 23.4 State-specific angle progression

#### Center

- [ ] Intentional yaw is effectively `0°`.
- [ ] Rear plane is at its widest baseline.
- [ ] Intentional side exposure is approximately `0-8 px` per side.
- [ ] Front wheels are not meaningfully visible.
- [ ] Rear-tire footprints are visually balanced, allowing only real vehicle asymmetry.

#### Left

- [ ] Yaw is approximately `10-12°` left from Center.
- [ ] Right-hand side is the increasingly visible side.
- [ ] Rear-plane width is approximately `0.88-0.90 x Center`.
- [ ] Visible right-side body is approximately `40-48 px` at the beltline/door area.
- [ ] Right-front-wheel visibility is approximately `16-24 px`.
- [ ] Right-side glass visibility is approximately `32-40 px`.
- [ ] State remains much closer to Center than to a showcase side view.

#### Hard Left

- [ ] Yaw is approximately `20-22°` left from Center.
- [ ] Right-hand side exposure increases one controlled step beyond Left.
- [ ] Rear-plane width is approximately `0.74-0.78 x Center`.
- [ ] Visible right-side body is approximately `60-72 px` at the beltline/door area.
- [ ] Right-front-wheel visibility is approximately `28-36 px`.
- [ ] Right-side glass visibility is approximately `52-64 px`.
- [ ] Rear still dominates; the state has not become a side/back showcase image.

#### Right

- [ ] Yaw is approximately `10-12°` right from Center.
- [ ] Left-hand side is the increasingly visible side.
- [ ] Rear-plane width is approximately `0.88-0.90 x Center`.
- [ ] Visible left-side body is approximately `40-48 px` at the beltline/door area.
- [ ] Left-front-wheel visibility is approximately `16-24 px`.
- [ ] Left-side glass visibility is approximately `32-40 px`.
- [ ] State remains much closer to Center than to a showcase side view.

#### Hard Right

- [ ] Yaw is approximately `20-22°` right from Center.
- [ ] Left-hand side exposure increases one controlled step beyond Right.
- [ ] Rear-plane width is approximately `0.74-0.78 x Center`.
- [ ] Visible left-side body is approximately `60-72 px` at the beltline/door area.
- [ ] Left-front-wheel visibility is approximately `28-36 px`.
- [ ] Left-side glass visibility is approximately `52-64 px`.
- [ ] Rear still dominates; the state has not become a side/back showcase image.

The pixel numbers above are production guardrails with the general `+/-4 px` tolerance defined earlier. Do not distort a visually correct frame merely to satisfy a single metric in isolation.

### 23.5 Registration and frame stability

- [ ] Canvas registration is compatible with anchor target approximately `(128, 232)`.
- [ ] Tire-contact line remains approximately `Y = 232`.
- [ ] Roof highest pixel remains approximately in the `Y = 44-48` band.
- [ ] Total sprite height remains approximately `184-192 px`.
- [ ] Adjacent-state vertical drift is ideally `0 px` and never exceeds `4 px` without documented justification.
- [ ] Adjacent-state horizontal registration drift is no more than about `4 px` unless perspective clearly requires it.
- [ ] Apparent vehicle scale does not grow/shrink while steering.
- [ ] Center of mass remains visually stable.
- [ ] Alternating `Center <-> Left`, `Left <-> Hard Left`, `Center <-> Right` and `Right <-> Hard Right` does not create visible popping or bouncing.

### 23.6 Wheel-visibility continuity

- [ ] Center shows rear wheels as the primary wheel cues and hides front wheels.
- [ ] Left reveals the right front wheel slightly.
- [ ] Hard Left reveals the right front wheel more clearly than Left.
- [ ] Right reveals the left front wheel slightly.
- [ ] Hard Right reveals the left front wheel more clearly than Right.
- [ ] Near-side front wheel remains less dominant than the corresponding near-side rear wheel.
- [ ] Far-side front wheel remains hidden or only incidentally visible.
- [ ] Wheelbase does not visibly change between states.
- [ ] Wheel/tire design does not drift between states.

### 23.7 Asymmetry and non-mirroring

- [ ] `Right` is not merely a bitmap-flipped `Left`.
- [ ] `Hard Right` is not merely a bitmap-flipped `Hard Left`.
- [ ] Exhaust remains on the same physical side across all states.
- [ ] Non-symmetric livery breaks remain physically correct.
- [ ] Logo placement follows the real vehicle side rather than artificial bitmap symmetry.
- [ ] Any real taillight/body asymmetry remains physically correct.
- [ ] Geometric angle symmetry does not override actual vehicle identity.

### 23.8 Pixel-art construction

- [ ] Edges are crisp and nearest-neighbor friendly.
- [ ] Pixel clusters are intentional rather than noisy.
- [ ] Diagonals use deliberate stepped construction.
- [ ] Shading uses controlled bands/clusters rather than soft gradients.
- [ ] Outline thickness is consistent with Center.
- [ ] No bilinear softness, blur or painterly edge treatment is present.
- [ ] No unnecessary micro-detail appears in one state but not its neighbors.
- [ ] No angle-specific dithering/noise is introduced unless already part of the approved family style.
- [ ] Sprite remains readable at native gameplay scale, not only when zoomed in.

### 23.9 Palette and lighting

- [ ] Frame follows the approved Night Courier color system.
- [ ] Visible color count excluding transparency is **24 or fewer**.
- [ ] Body remains in the approved light neutral / cool-gray family.
- [ ] Glass/tires/outlines remain in the approved dark cool family.
- [ ] Warm red/orange/yellow accents remain restrained and consistent.
- [ ] No angle introduces an unrelated hue family.
- [ ] No extra anti-alias/intermediate colors are generated simply because of perspective.
- [ ] Highlight direction is consistent across the family.
- [ ] Shadow direction and value hierarchy are consistent across the family.
- [ ] Equivalent non-braking states use consistent taillight intensity.
- [ ] No state contains unique environmental reflection or external glow.

### 23.10 Gameplay readability

- [ ] Hero vehicle remains clearly distinguishable against representative dark-road/night-city backgrounds.
- [ ] Rear silhouette reads immediately at gameplay speed.
- [ ] Yellow plate remains a stable identifying cue where visible.
- [ ] Taillights remain readable without becoming oversized noise.
- [ ] Spoiler/roof/hatch silhouette remains recognizable.
- [ ] Livery remains readable without overpowering body shape.
- [ ] Each steering state is distinguishable from its neighbor without requiring a dramatic angle jump.
- [ ] The five-state family reads as animation frames rather than five separate illustrations.

### 23.11 Full-family sequence review

Review the five frames in this order:

```text
Hard Left -> Left -> Center -> Right -> Hard Right
```

Then review both short sequences repeatedly:

```text
Center -> Left -> Hard Left -> Left -> Center
Center -> Right -> Hard Right -> Right -> Center
```

The complete set passes only when:

- [ ] angular progression is monotonic and visually even;
- [ ] rear-plane contraction is progressive rather than erratic;
- [ ] side exposure increases/decreases progressively;
- [ ] wheel visibility changes progressively;
- [ ] roof/contact registration remains stable;
- [ ] livery/logo visibility changes only through perspective;
- [ ] lighting and palette remain consistent;
- [ ] no frame is visually more detailed, sharper, softer, brighter or larger than its neighbors without a justified perspective reason;
- [ ] the sequence reads as one vehicle rotating continuously under one fixed camera.

## 24. Review outcome classification

Use these outcomes when reviewing generated sprites.

### PASS

Accept when all mandatory identity, camera, registration, palette/format and progression checks pass, and any metric deviation is within normal pixel tolerance without harming animation continuity.

### SOFT FAIL — edit/re-touch preferred

Use when the underlying frame is correct but needs limited correction, for example:

- yaw slightly too weak/strong;
- side exposure off by roughly `4-8 px`;
- registration off by `4 px`;
- one wheel cue needs simplification;
- a few pixel clusters or palette entries need cleanup;
- color count exceeds the cap only because of removable accidental shades.

Prefer targeted pixel editing over full regeneration when identity and geometry are already stable.

### HARD FAIL — regenerate or reconstruct

Reject when any of the following occurs:

- vehicle identity materially changes;
- camera angle/pitch/distance changes;
- frame becomes a side/showcase view rather than gameplay steering state;
- apparent vehicle scale or vertical registration changes strongly;
- wheelbase/body proportions materially change;
- exhaust/livery/asymmetric details appear on the wrong physical side;
- bitmap mirroring produces false vehicle identity;
- background, ground shadow or detached glow is baked into the asset;
- sprite is soft/anti-aliased/painterly rather than production pixel art;
- palette/style materially diverges from neighboring states;
- adjacent-frame swapping reads as two different illustrations rather than one rotating car.

## 25. Deferred pitch-family geometry guidance

This section records the production geometry learned from classic arcade-racer pitch families so the decision does not need to be rediscovered later. It is **not part of the current production asset scope**.

### 25.1 Current status

Current production is locked to:

```text
FLAT only
x
5 yaw states
=
5 required player steering frames
```

The existing names remain authoritative:

```text
player_rear_hard_left
player_rear_left
player_rear_center
player_rear_right
player_rear_hard_right
```

Do not rename them to include `_flat` merely to anticipate a future system.

Do not produce `UPHILL` or `DOWNHILL` sprites now. Do not add runtime pitch-state selection, pitch-family loading, extra player atlas slots or expanded asset-budget counts now.

### 25.2 Pitch semantics

If pitch families are approved later, Night Courier will define pitch by **vehicle/chassis orientation relative to the fixed rear gameplay camera**, not by an inferred Turbo Out Run row name.

The semantic convention is:

- `FLAT`: neutral chassis pitch, canonical gameplay family;
- `UPHILL`: vehicle points uphill / nose-up relative to FLAT;
- `DOWNHILL`: vehicle points downhill / nose-down relative to FLAT.

The source arcade sheet demonstrates that discrete pitch families can improve road-grade readability, but it does not establish authoritative names or exact physical pitch values for Night Courier.

### 25.3 Effective visual pitch targets

If activated later, use these as restrained art targets rather than physics values:

| Family | Effective visual pitch |
|---|---:|
| `UPHILL` | approximately `+6° to +8°` nose-up |
| `FLAT` | `0°` |
| `DOWNHILL` | approximately `-6° to -8°` nose-down |
| practical hard limit | approximately `+/-10°` |

Do not map road slope degrees directly 1:1 to sprite pitch. The sprite family exists to preserve visual readability at `256 x 256`, not to simulate continuous rigid-body rotation.

### 25.4 Fixed-camera and registration contract

All future pitch families must preserve the same camera used by FLAT:

- same rear-camera position;
- same camera elevation;
- same downward camera pitch;
- same camera distance;
- same perspective strength;
- same apparent vehicle scale.

The primary rear tire/contact anchor remains the registration authority:

| Metric | Target |
|---|---:|
| Canvas | `256 x 256 px` |
| Anchor X | approximately `128 px` |
| Primary rear tire/contact Y | approximately `232 px` |
| Pitch-to-pitch rear-contact drift | ideal `0 px`, maximum `4 px` |
| Preferred total silhouette height | `184-192 px` |
| Absolute future pitch-family tolerance | `180-196 px` |

Pitch must be expressed by re-authored projected geometry. Do **not** translate the complete sprite vertically to sell uphill/downhill motion.

### 25.5 Geometric pitch cues

At this scale, use three primary cues:

1. projected top-surface exposure;
2. rear-plane vertical exposure;
3. front-versus-rear axle vertical relationship when a near-side front wheel is visible.

Do not add extra deformation systems unless these three cues are insufficient in gameplay.

#### Projected top-surface exposure

Normalize FLAT to `1.00`.

With the fixed rear camera convention above:

| Family | Top-surface exposure | Practical 256 px change |
|---|---:|---:|
| `UPHILL` | approximately `0.75-0.85 x FLAT` | about `-8 to -12 px` |
| `FLAT` | `1.00` | baseline |
| `DOWNHILL` | approximately `1.15-1.25 x FLAT` | about `+8 to +12 px` |

Relevant top surfaces include roof, spoiler top and other upward-facing body planes that remain readable at the current yaw.

#### Rear-plane vertical exposure

Normalize FLAT rear-plane vertical exposure to `1.00`.

| Family | Rear-plane vertical exposure | Practical 256 px change |
|---|---:|---:|
| `UPHILL` | approximately `1.06-1.10 x FLAT` | about `+8 to +12 px` |
| `FLAT` | `1.00` | baseline |
| `DOWNHILL` | approximately `0.90-0.94 x FLAT` | about `-8 to -12 px` |

These values describe screen-space exposure, not physical panel dimensions. If both top exposure and rear-plane height grow together, the asset is probably scaling rather than pitching and should be rejected.

#### Axle relationship

For yaw states where the near-side front wheel is visible:

- `UPHILL`: front axle/wheel center should project approximately `4-8 px` higher than its FLAT counterpart;
- `FLAT`: canonical baseline;
- `DOWNHILL`: front axle/wheel center should project approximately `4-8 px` lower than its FLAT counterpart.

Do not force a literal tire-contact pixel below the canvas. Preserve the rear contact anchor and express the cue through wheel-center/body geometry when necessary.

### 25.6 Secondary geometry guardrails

Rear glass and hatch geometry may support pitch readability, but they are secondary to the three primary cues.

A useful future starting range is:

| Metric | `UPHILL` | `FLAT` | `DOWNHILL` |
|---|---:|---:|---:|
| rear-glass projected height | approximately `1.04-1.08` | `1.00` | approximately `0.92-0.96` |
| rear hatch/rear face | slightly expanded | baseline | slightly compressed |
| top-surface visibility | reduced | baseline | increased |

At `256 x 256`, rear-glass change should normally be only about `4 px`. Do not sacrifice vehicle identity to satisfy a theoretical ratio.

Taillights, yellow plate and other semantic identifiers keep a minimum readable cluster even when perspective would mathematically shrink them. Gameplay readability outranks projection purity.

### 25.7 Pitch and yaw are independent axes

If pitch families are added later, every family must use the same yaw contract:

```text
Hard Left   -20° to -22°
Left        -10° to -12°
Center       0°
Right       +10° to +12°
Hard Right  +20° to +22°
```

Corresponding yaw states across pitch families should preserve the existing rear-plane **width** and side-exposure metrics within approximately `+/-4 px` where perspective permits.

Pitch must not fake stronger or weaker steering. For example, `uphill_left` must still read as the same yaw strength as `flat_left`.

### 25.8 Future production dependency order

If gameplay evidence later approves pitch-family production, do not generate fifteen independent illustrations.

Use:

```text
accepted FLAT five-state family
        |
        +-> UPHILL CENTER from FLAT CENTER
        |      -> validate pitch geometry
        |      -> derive corresponding yaw states
        |
        +-> DOWNHILL CENTER from FLAT CENTER
               -> validate pitch geometry
               -> derive corresponding yaw states
```

For a pitched yaw frame, reference priority should be:

1. corresponding accepted FLAT yaw state for yaw/identity/registration;
2. corresponding pitched `CENTER` for pitch geometry;
3. FLAT `CENTER` for canonical scale;
4. showcase art only for hidden physical details.

Never mechanically rotate, shear or perspective-warp the accepted FLAT PNG as the final production solution. Such transforms may be used only as temporary construction guides before pixel-level re-authoring.

### 25.9 Activation gate

The pitch-family extension is eligible only if representative gameplay demonstrates a persistent problem such as:

- hills/crests make the FLAT car appear visibly detached from road orientation;
- road-grade transitions cause a strong visual contradiction that projection/camera tuning cannot solve;
- playtesting shows the player vehicle needs discrete pitch cues to remain spatially readable.

Do **not** activate the extension because the reference game contains more sprites or because additional art can be generated.

Until that gate is met, `FLAT` remains the only production family and the five-state steering contract remains unchanged.

## 26. Runtime integration and current migration status

The five production texture keys are:

```text
player_rear_hard_left
player_rear_left
player_rear_center
player_rear_right
player_rear_hard_right
```

Initial runtime display uses a `256 x 256` image box at the `960 x 540` logical resolution and the contact origin derived from `(128,232)`.

`GameScene` owns a separate smoothed `visualSteer` presentation value. Initial texture bands are:

| `visualSteer` | Texture |
|---|---|
| `<= -0.68` | `player_rear_hard_left` |
| `-0.68 .. -0.18` | `player_rear_left` |
| `-0.18 .. +0.18` | `player_rear_center` |
| `+0.18 .. +0.68` | `player_rear_right` |
| `>= +0.68` | `player_rear_hard_right` |

This presentation value does not modify `Player.roadX`, speed, cargo or collision envelopes.

The five PNGs committed immediately before this 256 px contract are **staging references**, not accepted production exports. Their observed canvases are currently inconsistent:

- `player_rear_center.png`: `1254 x 1254`;
- `player_rear_right.png`: `1254 x 1254`;
- `player_rear_left.png`: `1256 x 1256`;
- `player_rear_hard_left.png`: `1256 x 1256`;
- `player_rear_hard_right.png`: `1256 x 1256`.

Runtime may temporarily load and scale them to validate texture-selection behavior. Batch A player acceptance remains pending until all five are explicitly authored/exported at exactly **256 x 256**, preserve the canonical registration, and pass the full-family visual review.

Do not silently resample the staging PNGs and declare them final without review.
