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

## 3. Canonical sprite format

The initial player steering set uses:

- canvas: **64 x 64 px**;
- file format: transparent PNG;
- one state per file;
- nearest-neighbor-friendly true pixel construction;
- no ground, road, cast shadow, detached glow, text or decorative background;
- fixed visual registration across all five steering states.

The player sprite should maximize useful coverage inside the 64 x 64 canvas without touching or cropping at the canvas boundary.

The generic player-size guidance elsewhere in the asset inventory is secondary to this explicit steering-frame contract.

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

The fixed relationship between the vehicle and the 64 x 64 canvas: tire-contact line, roof-height band, center of mass and transparent bounds.

## 7. Master registration contract

Use these initial production targets for all five states:

| Metric | Target |
|---|---:|
| Canvas | `64 x 64 px` |
| Anchor X | `32 px` |
| Anchor Y | `58 px` |
| Tire-contact line | approximately `Y = 58` |
| Roof highest pixel | approximately `Y = 11-12` |
| Total sprite height | approximately `46-48 px` |
| Typical overall silhouette width | approximately `54-58 px` |
| Allowed vertical drift between adjacent states | ideally `0 px`, maximum `1 px` |
| Allowed horizontal registration drift between adjacent states | maximum `1 px` unless perspective requires otherwise |

These are production registration targets rather than collision geometry.

Tolerance for hand-authored/generated pixel geometry is generally **+/-1 px** unless a stricter rule is stated below.

The bottom contact registration is more important than perfectly identical outer bounding-box width.

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

Practical target on the 64 x 64 canvas:

- approximately **34-36 px** for the dominant rear plane.

### 9.3 Side exposure

- near zero intentional side exposure;
- approximately **0-2 px** per side where camera perspective naturally reveals body depth.

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

If Center is 36 px, a practical target is approximately **31-32 px**.

### 10.3 Visible side exposure

Because the car yaws left under a fixed rear camera, reveal more of the **right-hand side**.

Targets:

- right-side body/beltline exposure: approximately **10-12 px**;
- right-side lower-body exposure: approximately **12-14 px**;
- opposite-side exposure: approximately **1-3 px** or visually negligible.

### 10.4 Wheels

- right rear wheel becomes more visible than in Center;
- right front wheel begins to appear;
- right front wheel visible width target: approximately **4-6 px**;
- left rear wheel remains visible but slightly perspective-compressed;
- left front wheel remains hidden or only an incidental `1 px` sliver.

### 10.5 Side glass / livery

- right-side glass strip target: approximately **8-10 px**;
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

If Center is 36 px, a practical target is approximately **27-28 px**.

### 11.3 Visible side exposure

Reveal more of the **right-hand side** than in `Left`:

- right-side body/beltline exposure: approximately **15-18 px**;
- right-side lower-body exposure: approximately **17-20 px**;
- opposite-side exposure: approximately **0-2 px**.

### 11.4 Wheels

- right rear wheel is the most visually exposed wheel;
- right front wheel becomes clearly visible but remains smaller/less dominant than the right rear wheel;
- right front wheel visible width target: approximately **7-9 px**;
- left rear wheel remains visible but compressed;
- left front wheel remains hidden or at most a negligible sliver.

### 11.5 Side glass / livery

- right-side glass target: approximately **13-16 px**;
- side stripe and door area are more readable than in `Left`;
- logo visibility increases progressively rather than appearing/disappearing discontinuously.

### 11.6 Registration

`Left <-> Hard Left` must preserve the same tire-contact Y, roof-height band and approximate center of mass. Perspective may alter silhouette width, but it must not look like the car changes size.

## 12. Quantitative left-side progression

| Metric | Center | Left | Hard Left |
|---|---:|---:|---:|
| yaw | `0°` | `10-12°` | `20-22°` |
| normalized rear-plane width | `1.00` | `0.88-0.90` | `0.74-0.78` |
| practical rear-plane width | `34-36 px` | `31-32 px` | `27-28 px` |
| visible right-side body | `0-2 px` | `10-12 px` | `15-18 px` |
| visible right-side lower body | `0-2 px` | `12-14 px` | `17-20 px` |
| visible right-front-wheel width | `0 px` | `4-6 px` | `7-9 px` |
| visible side-glass width | `0-2 px` | `8-10 px` | `13-16 px` |
| plate perspective shift | `0 px` | maximum about `1 px` | maximum about `2 px` |

The numbers are guardrails for consistent production, not a requirement to distort an otherwise correct sprite to satisfy arithmetic exactly.

## 13. Right and Hard Right

`Right` and `Hard Right` use the **geometric mirror** of the left-side measurements:

- `Right`: approximately `+10° to +12°`;
- `Hard Right`: approximately `+20° to +22°`;
- left-hand side exposure increases progressively;
- left-front-wheel visibility follows the `4-6 px` then `7-9 px` progression;
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

- [ ] it is a transparent `64 x 64` PNG;
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

The initial release remains a **five-steering-frame** player set.

Do not expand immediately to:

- seven or fifteen yaw states;
- multiple vertical/pitch sprite families;
- manually authored distance/mipmap variants for the player;
- rollover/spin/crash rotation sprite sequences.

If five states visibly snap during representative gameplay, first verify angle progression and registration against this spec. Only then consider seven states as a measured polish expansion.
