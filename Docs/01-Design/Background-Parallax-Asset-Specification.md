# Background and Parallax Asset Specification

## 1. Purpose

This document is the authoritative production specification for Night Courier background/parallax image assets.

It complements:

- `Asset-Inventory-and-Sprite-Requirements.md` for total asset inventory and budgets;
- `Environment-Zones-and-Roadside-Composition.md` for zone composition/reuse rules;
- `Art-Direction-and-Color-Palette.md` for palette, contrast and value hierarchy.

Where this document gives an exact source resolution for a named background asset, that exact contract overrides generic approximate parallax-size guidance elsewhere in the docs.

## 2. City background stack — frozen production baseline

The initial city background stack uses exactly two required authored layers:

```text
bg_city_far
bg_city_mid
```

`bg_city_near` remains optional and must not be commissioned unless gameplay composition proves that projected roadside props cannot provide sufficient near-city depth.

### 2.1 `bg_city_far`

Hard production contract:

```text
filename: bg_city_far.png
source size: 2048 x 512 px
horizontal loop: seamless X
role: distant skyline / horizon city mass
```

Art requirements:

- low detail;
- low local contrast;
- subdued saturation;
- distant skyline and optional mountain/ridge silhouette;
- sparse practical lights;
- no foreground roadside objects;
- no road or traffic;
- avoid highly memorable hero landmarks that expose repetition when tiled.

Alpha is optional for `bg_city_far`. It may be opaque if the approved sky treatment is intentionally baked into the far layer, or transparent if runtime sky color is preferred.

### 2.2 `bg_city_mid`

Hard production contract:

```text
filename: bg_city_mid.png
source size: 2048 x 512 px
format: RGBA PNG
horizontal loop: seamless X
role: mid-distance urban building/infrastructure strip
```

`2048 x 768` was an exploration size only and is retired as the production target. Do not author or re-export the final `bg_city_mid` at 768 px height unless a later gameplay-composite test demonstrates a concrete lack of vertical headroom.

`bg_city_mid` must remain transparent outside the city/infrastructure silhouettes. Do not replace transparency with black and do not bake a sky into this layer.

Recommended vertical composition on the 512 px canvas:

```text
Y = 0
| transparent headroom
| occasional tallest towers begin roughly around Y = 90–160
| normal high-rise tops mostly around Y = 170–260
| primary mid-city mass occupies the lower half
| building/infrastructure baseline around Y = 480–500
| small transparent safety margin
Y = 512
```

These Y ranges are composition guidance, not per-building pixel-locks. The important production rule is that the layer uses the canvas efficiently and does not leave a large unused transparent band below the city strip.

Art requirements:

- clearly closer/larger than `bg_city_far`, but still background;
- medium detail only;
- compact low-rise and mid-rise city blocks;
- restrained high-rise silhouettes;
- rooftop HVAC/water tanks/antennae/billboard frames where useful;
- optional elevated rail/expressway silhouette integrated into the city mass;
- sparse warm/cool window lights;
- dark unlit windows and building masses dominate;
- no readable text or logos;
- no giant hero landmark;
- no road, vehicles, pedestrians or near-road foreground props;
- no baked streetlights, guardrails, chevrons, tunnel portals or other projected roadside content;
- no painterly blur, bloom, photorealistic texture or excessive neon/cyberpunk treatment.

The elevated rail/expressway may run across substantial portions of the strip, but should not become a perfectly uniform uninterrupted horizontal band. Building masses may partially occlude it to reduce mechanical repetition.

## 3. Visual hierarchy

The intended attention hierarchy is:

```text
player
> traffic
> projected roadside props / gameplay signage
> bg_city_mid primary building mass
> bg_city_mid rear silhouettes
> bg_city_far
```

`bg_city_mid` may use more contrast and larger silhouettes than `bg_city_far`, but it must not compete with player/traffic readability at gameplay speed.

## 4. Seamless-loop acceptance

Both city layers must loop horizontally.

Do not approve an asset by inspecting only one left/right junction. Validate at least:

```text
[ image ][ image ]
```

and preferably:

```text
[ image ][ image ][ image ]
```

Check:

- building baseline continuity;
- skyline height/density continuity;
- infrastructure height continuity;
- value and light-density continuity;
- absence of abrupt edge brightness changes;
- absence of a unique landmark positioned near the seam;
- repetition readability over multiple loops.

A technically seamless junction can still fail if the repeated composition is immediately recognizable during parallax motion.

## 5. Pixel-art and export rules

- preserve crisp nearest-neighbor-friendly edges;
- avoid unintended anti-aliasing;
- avoid soft painterly gradients inside the authored silhouettes;
- preserve consistent apparent pixel density with the Night Courier vehicle/prop art;
- keep transparent bounds intentional;
- do not vertically stretch a generated image simply to fill the target canvas;
- when converting an exploratory `2048 x 768` source to the frozen `2048 x 512` contract, recompose/crop/re-export deliberately rather than anisotropically resizing 768 -> 512.

## 6. Runtime behavior

The source resolutions above do not imply that backgrounds are rendered 1:1 to the 960 x 540 logical viewport.

Runtime is responsible for:

- positioning layers against the gameplay horizon/profile;
- repeating them horizontally;
- applying different lateral parallax rates;
- keeping the far layer slower than the mid layer;
- suppressing/replacing outdoor parallax inside the tunnel.

Exact parallax rates are runtime tuning and are not baked into the asset contract.

## 7. Relationship to projected roadside props

Background layers provide city mass and depth only.

The following normally remain projected roadside assets rather than baked into `bg_city_mid`:

- streetlights;
- guardrails;
- utility poles close to the road;
- overhead route/expressway signs that must align to road position;
- convenience/commercial signs near the road;
- chevrons/caution boards;
- construction props;
- tunnel portal/sign elements;
- destination marker.

This separation is required so curves, hills, crest clipping and route-relative placement remain visually coherent.

## 8. Initial shared background inventory

The full initial route still targets approximately 5–7 shared background/parallax images total:

```text
required:
- bg_city_far          2048 x 512, seamless X
- bg_city_mid          2048 x 512, seamless X, RGBA transparent
- bg_ridge_far         shared by rural / forest / mountain-pass
- bg_vegetation_mid    shared by rural / forest

optional only if validated need exists:
- bg_city_near
- bg_forest_rock_near
- destination/depot landmark layer
```

Do not create a separate far/mid/near triplet for every environment zone.

## 9. `bg_city_mid` production acceptance

`bg_city_mid` is production-ready only when all of the following pass:

- [ ] exact `2048 x 512` source dimensions;
- [ ] RGBA transparency preserved outside silhouettes;
- [ ] horizontally seamless over at least two adjacent copies;
- [ ] repetition remains acceptable over three adjacent copies;
- [ ] city baseline uses the lower canvas efficiently, normally around Y `480–500`;
- [ ] no large unused transparent band remains below the city strip;
- [ ] medium-distance scale reads clearly against `bg_city_far`;
- [ ] rear towers are lower-contrast than the primary mid-city mass;
- [ ] window lights remain restrained and irregular;
- [ ] elevated infrastructure does not become an overly uniform stripe;
- [ ] no road/vehicle/foreground roadside content is baked into the layer;
- [ ] no readable text/logos or dominant hero landmark;
- [ ] gameplay composite preserves player/traffic/roadside-prop readability;
- [ ] nearest-neighbor presentation shows no unintended smoothing or obvious shimmer.

## 10. Scope rule

The frozen `2048 x 512` city dimensions are a production decision for the current Night Courier route, not a generalized engine requirement.

Do not add resolution-selection infrastructure, background asset metadata systems or per-zone background managers solely because future tracks might use different dimensions.