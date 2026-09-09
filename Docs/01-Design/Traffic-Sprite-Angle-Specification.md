# Traffic Sprite Angle Specification

## 1. Purpose

This document is the authoritative production specification for **Night Courier** traffic-vehicle sprite families.

It standardizes every production traffic frame to a common `256 x 256` transparent source canvas and allows every traffic visual to use the complete five-state yaw family:

```text
Hard Left -> Left -> Center -> Right -> Hard Right
```

This is a presentation contract only. It does not add traffic AI states, change collision geometry, or change the existing `car` / `van` / `truck` gameplay classes.

Related authoritative documents:

- [`Asset-Inventory-and-Sprite-Requirements.md`](Asset-Inventory-and-Sprite-Requirements.md)
- [`Player-Sprite-Angle-Specification.md`](Player-Sprite-Angle-Specification.md)
- [`Art-Direction-and-Color-Palette.md`](Art-Direction-and-Color-Palette.md)
- [`../03-Technical/Technical-Design.md`](../03-Technical/Technical-Design.md)

## 2. Scope

The initial production traffic visuals are:

```text
city taxi        -> car behavior
compact hatchback -> car behavior
small delivery van -> van behavior
box truck          -> truck behavior
```

Each production traffic visual may use, and for final Batch A acceptance is expected to provide, the complete five-yaw family.

A visual that temporarily has only `Center` is a staging/integration asset, not a complete production traffic family.

Adding a yaw frame does **not** authorize:

- a new traffic behavior class;
- lane-change AI;
- steering physics;
- zone-specific traffic AI;
- sprite-bound collision;
- additional routes or vehicle mechanics.

## 3. Canonical source/export format

Every traffic frame uses:

- canvas: **exactly `256 x 256 px`**;
- file format: transparent PNG;
- one yaw state per file;
- canonical road-contact anchor approximately **`(128,232)`**;
- fixed camera, apparent scale and registration within one vehicle family;
- no road, floor, cast ground shadow, detached glow, text or decorative background;
- nearest-neighbor-friendly pixel construction compatible with the Night Courier visual system.

The common canvas and contact anchor are production/export contracts. They do **not** mean all traffic vehicles occupy the same silhouette width/height. Taxi, hatchback, van and truck retain class-appropriate proportions.

The source canvas also does **not** define a fixed runtime display size. Traffic remains pseudo-3D projected content and is scaled according to road depth and the existing traffic world-size/projection data.

## 4. Camera contract

Traffic uses the same general rear-biased pseudo-3D gameplay camera language as the player:

- camera is behind traffic moving in the same route direction as the player;
- camera is slightly elevated and gently downward-looking;
- rear face remains the dominant visible surface in every yaw state;
- camera height, pitch, distance and perspective strength do not change between yaw frames of one traffic visual;
- only apparent vehicle yaw changes.

Traffic frames are not showcase side views, isometric renders or independently composed concept-art angles.

## 5. Five-yaw contract

Use the same restrained yaw progression as the player family so vehicle orientation reads consistently across the game:

| State | Target yaw from Center |
|---|---:|
| `Hard Left` | approximately `-20° to -22°` |
| `Left` | approximately `-10° to -12°` |
| `Center` | `0°` |
| `Right` | approximately `+10° to +12°` |
| `Hard Right` | approximately `+20° to +22°` |

The sequence must read as one unchanged vehicle rotating progressively under one fixed camera.

Do not use large jumps such as `0° -> 20° -> 45°`.

When viewed from behind:

- a vehicle yawing left reveals progressively more of its right-hand side;
- a vehicle yawing right reveals progressively more of its left-hand side.

## 6. Naming contract

Use lowercase snake_case and encode both vehicle identity and yaw state explicitly.

Canonical pattern:

```text
traffic_<visual>_rear_<yaw>.png
```

Approved initial examples:

```text
traffic_taxi_rear_hard_left.png
traffic_taxi_rear_left.png
traffic_taxi_rear_center.png
traffic_taxi_rear_right.png
traffic_taxi_rear_hard_right.png

traffic_hatchback_rear_hard_left.png
traffic_hatchback_rear_left.png
traffic_hatchback_rear_center.png
traffic_hatchback_rear_right.png
traffic_hatchback_rear_hard_right.png

traffic_van_rear_hard_left.png
traffic_van_rear_left.png
traffic_van_rear_center.png
traffic_van_rear_right.png
traffic_van_rear_hard_right.png

traffic_truck_rear_hard_left.png
traffic_truck_rear_left.png
traffic_truck_rear_center.png
traffic_truck_rear_right.png
traffic_truck_rear_hard_right.png
```

Legacy-style names such as `traffic_taxi_rear.png` are not the canonical final naming contract once five-yaw traffic is integrated. A temporary alias is acceptable only during migration and should not become a second permanent asset convention.

## 7. Registration contract

All five frames of one traffic visual must preserve:

- canvas `256 x 256`;
- contact anchor around `(128,232)`;
- stable rear-tire/contact baseline;
- stable apparent vehicle scale;
- stable roof-height band for that vehicle;
- stable center of mass;
- consistent transparent padding.

Initial tolerance within one yaw family:

| Metric | Target |
|---|---:|
| Canvas | `256 x 256 px` |
| Anchor X | `128 px` |
| Primary road-contact Y | approximately `232 px` |
| Adjacent-state vertical drift | ideally `0 px`, maximum `4 px` |
| Adjacent-state horizontal registration drift | maximum about `4 px` unless perspective clearly requires otherwise |

These values are presentation registration, not collision geometry.

Cross-vehicle dimensions do not need to match. A truck should remain visually taller/larger than a compact car where the runtime projection/world-size data calls for it.

## 8. Silhouette progression

Within one traffic visual:

```text
Center:
rear plane = widest
side exposure = minimal
near-side front wheel = hidden/minimal

Left / Right:
rear plane = moderately contracted
near-side body = moderately exposed
near-side front wheel = slightly visible where vehicle geometry allows

Hard Left / Hard Right:
rear plane = contracted one step farther
near-side body = clearly exposed
rear face still dominates
```

Do not let `Hard Left` or `Hard Right` become a true side view.

## 9. Vehicle identity locks

Across all five yaw states of one traffic visual, preserve:

- body model and proportions;
- roofline/body-height class;
- wheelbase and tire diameter;
- window layout;
- bumper and lamp design;
- mirrors where visible;
- taxi roof sign where applicable;
- delivery/cargo-box geometry where applicable;
- livery, logo and plate placement;
- exhaust and other asymmetric details;
- outline thickness;
- pixel density;
- shading language;
- lighting direction/intensity.

Perspective compression is allowed. Redesign is not.

## 10. Mirroring policy

Five production files are preferred for every traffic visual.

Do not assume `Right` can always be produced by bitmap-flipping `Left`. Taxi signage, plate placement, door/livery details, exhausts and body asymmetries may make a raw mirror incorrect.

A mirrored construction guide is acceptable during art production, but final exported right-side frames must preserve the real physical identity of the vehicle.

## 11. Palette and pixel-art constraints

Traffic uses the Night Courier palette/value hierarchy and remains visually subordinate to the hero vehicle.

Requirements:

- crisp hard pixel edges;
- no accidental bilinear/soft anti-aliasing;
- controlled stepped diagonals and pixel clusters;
- consistent material shading across the yaw family;
- no angle-specific environmental reflection;
- no detached external glow;
- hard maximum of **24 visible colors per frame** excluding transparency unless a later documented material/readability exception is approved.

Traffic must remain readable at collision/near-miss distances without competing with the player for the highest foreground contrast.

## 12. Runtime yaw-selection semantics

Traffic yaw is presentation state, not AI state.

Conceptually:

```text
traffic route position
+ local projected road tangent / relative heading
+ optional real lateral-motion heading if that mechanic ever exists
    -> traffic visual-yaw value
    -> select one of five authored textures
```

Do not derive traffic yaw from `roadX` position alone. A car being on the left side of the road does not mean it is yawing left.

The initial implementation may quantize a presentation value into the same five semantic bands used by player presentation, but traffic does not need to share the player's input-driven smoothing algorithm.

Pose selection must not modify:

- `TrafficType`;
- longitudinal speed;
- road-space `roadX`;
- collision envelope;
- near-miss envelope/state;
- traffic density/recycle logic.

## 13. Projection and collision separation

Traffic source images are decorative/rendering data.

The authoritative runtime relationship remains:

```text
traffic simulation state
    -> road-space collision / near miss
    -> projection
    -> choose visual yaw
    -> render selected 256px source texture at projected screen scale
```

Do not derive collision from alpha bounds, canvas bounds or the currently selected yaw texture.

The `256 x 256` canvas exists for art consistency and stable pivots; traffic gameplay dimensions remain explicit road/world-space data.

## 14. Production dependency order

For each traffic visual, produce in this order:

```text
1. Center
2. Left from Center
3. Hard Left from Left + Center
4. Right from Center
5. Hard Right from Right + Center
```

Validate the family before moving to another vehicle visual.

Recommended Batch A order:

```text
taxi family
-> hatchback family
-> van family
-> truck family
```

This catches camera/registration problems before twenty frames have been finalized.

## 15. Batch A count

Minimum reduced traffic content:

```text
3 traffic visual identities x 5 yaw frames = 15 traffic frames
```

Standard initial production target:

```text
4 traffic visual identities x 5 yaw frames = 20 traffic frames
```

The four recommended identities are taxi, hatchback, van and truck.

Do not add extra color/livery traffic identities before these complete yaw families are accepted. Prefer tinting or later low-cost variants only after the base families are stable.

## 16. Acceptance checklist

A traffic visual is production-ready only when all five of its frames satisfy:

- [ ] exact `256 x 256` transparent PNG;
- [ ] canonical contact anchor is compatible with `(128,232)`;
- [ ] fixed rear gameplay camera is consistent across the family;
- [ ] yaw progression is monotonic `HL -> L -> C -> R -> HR`;
- [ ] rear-plane contraction and side exposure progress smoothly;
- [ ] apparent scale and road-contact registration remain stable;
- [ ] body model, wheelbase, lamps, windows, livery and asymmetric details remain the same vehicle;
- [ ] right-side frames are physically correct rather than blindly mirrored;
- [ ] palette/value hierarchy remains subordinate to the player;
- [ ] visible color count remains at or below the documented cap unless explicitly approved;
- [ ] no road, ground shadow, background, text or external glow is baked into the sprite;
- [ ] nearest-neighbor display remains crisp at representative projected sizes;
- [ ] texture switching does not cause visible bounce/popping;
- [ ] traffic collision and near-miss behavior remains identical regardless of selected yaw frame.

A `Center`-only traffic visual may be used temporarily for integration, but it does not pass final Batch A traffic acceptance.

## 17. Explicit non-goals

The five-yaw traffic contract does not authorize:

- traffic pitch families (`UPHILL` / `DOWNHILL`);
- more than five yaw states;
- traffic steering/turn animation mechanics;
- new AI behavior classes;
- lane-changing systems;
- damaged traffic sprite families;
- per-zone traffic sprite packs;
- physics or collision derived from sprite geometry;
- a generic vehicle animation framework.

If later gameplay introduces genuine lateral traffic motion, the existing five-yaw family should be reused first before expanding art scope.
