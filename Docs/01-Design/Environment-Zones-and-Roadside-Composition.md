# Environment Zones and Roadside Composition

## 1. Purpose

This document defines how **Night Courier** changes roadside/environment presentation across the final route while remaining one coherent small-scope environment family.

The initial game uses five presentation zones:

- `city`;
- `rural`;
- `forest`;
- `mountain-pass`;
- `tunnel`.

These are **not five independent biome packs**. They share the same renderer, Night Courier 20 palette, prop vocabulary, traffic system and overall late-1990s Japanese-night setting. The goal is route readability and visual pacing through composition, density, silhouettes, curve/elevation profile and selective shared assets.

## 2. Core environment principle

Environment identity should come from:

```text
road geometry
+ background/parallax profile
+ deterministic roadside prop composition
+ prop density/spacing
+ practical lighting pattern
+ a small number of zone-signature silhouettes
```

not from unique gameplay systems or large zone-specific asset libraries.

`Road.ts` remains the owner of authored road-section semantics and the projection data required to place roadside objects. Do not introduce a `BiomeManager`, `EnvironmentSystem`, scene-per-zone architecture or a second renderer for these zones.

## 3. Recommended final-route visual structure

The initial route should use the zones approximately as follows:

```text
CITY opening
    ↓
RURAL transition / outskirts
    ↓
route decision
   /        \
  /          \
MOUNTAIN      FOREST
PASS           |
  |            |
TUNNEL       RURAL
  \            /
   \          /
    CITY destination fringe / depot
```

Design intent:

- the opening establishes the courier/city identity quickly;
- `rural` acts as a visual and spatial transition rather than an abrupt biome teleport;
- the short/risky branch is primarily `mountain-pass -> tunnel`;
- the long/safer branch is primarily `forest -> rural`;
- both branches return to a city-fringe/depot presentation for the delivery finish.

Exact durations remain M4 tuning data. The route must still target a total **4–5 minute** run.

## 4. Shared zone contract

Each authored road section may carry a lightweight zone identity:

```ts
type EnvironmentZone =
  | 'city'
  | 'rural'
  | 'forest'
  | 'mountain-pass'
  | 'tunnel';
```

Conceptually, a section profile may resolve:

```ts
interface EnvironmentProfile {
  propPool: readonly PropId[];
  density: number;
  backgroundProfile: BackgroundProfileId;
  lightingProfile: LightingProfileId;
}
```

These examples define data intent, not mandatory public interfaces or new files. The implementation stays compact inside the existing `Road.ts`/scene composition unless evidence later justifies extraction.

## 5. Placement model

Roadside placement must be deterministic. Reloading the same route/branch should produce the same prop layout unless the authored route changes.

Do not call unconstrained random generation every render frame.

Ambient placement should conceptually derive from stable inputs such as:

```text
segment index
+ route/branch id
+ zone id
+ stable seed
```

Two placement classes are enough:

### 5.1 Authored landmarks

Use explicit authored placements for high-value navigation/identity objects such as:

- route-choice signage;
- tunnel entrance/exit;
- major expressway gantry;
- delivery destination marker;
- distinctive convenience-store sign near a planned composition beat.

### 5.2 Deterministic ambient props

Use deterministic placement rules for repeated scenery such as:

- streetlights;
- guardrail posts;
- utility poles;
- trees/tree clusters;
- reflectors;
- small signs;
- rock/cliff clusters.

Ambient props may vary spacing and side within bounded rules, but must remain stable across runs.

## 6. Generic prop-placement attributes

A reusable prop rule may express only the attributes that materially affect composition:

- allowed zones;
- left / right / both side policy;
- offset from road edge;
- minimum/target longitudinal spacing;
- density weight;
- mirror allowed / disallowed;
- optional curve-side policy;
- optional landmark-only flag.

Do not build a general procedural-world grammar.

Useful curve-side policies are:

- `either`;
- `inside-curve`;
- `outside-curve`.

Chevron/caution boards should prefer `outside-curve` where it helps the player read an upcoming bend.

## 7. CITY zone

### Visual role

`city` establishes Night Courier's strongest identity: late-1990s Japanese-inspired commercial/expressway night driving.

### Composition

Use:

- far/mid building silhouettes;
- convenience-store/commercial signs;
- streetlights at regular rhythm;
- overhead expressway signs/gantries;
- guardrails and utility infrastructure;
- billboards and occasional construction furniture;
- denser practical lighting;
- restrained neon accents.

### Density

Roadside density: **high**, but background contrast must remain below player/traffic readability.

### Geometry tendency

Prefer:

- mostly flat to mild elevation;
- medium-radius curves;
- longer sightlines on expressway-like pieces;
- occasional tighter urban bend only when readable.

This is guidance, not a separate road-physics mode.

### Signature silhouettes

At least two of the following should be visible during a representative city section:

- building strip/skyline;
- streetlight rhythm;
- expressway gantry;
- convenience/commercial sign.

## 8. RURAL zone

### Visual role

`rural` is the transition between dense city infrastructure and darker natural roads. It should feel like the courier has left the urban core without entering a completely different world.

### Composition

Use:

- sparse utility poles;
- guardrails;
- low vegetation/field-edge silhouettes;
- occasional small house/shed silhouette or roadside vending/store light when available;
- fewer signs;
- widely spaced lamps;
- larger negative-space gaps between props.

### Density

Roadside density: **low to medium**.

### Geometry tendency

Prefer:

- gentle curves;
- moderate open sightlines;
- mild rolling elevation;
- fewer visually noisy roadside objects.

### Reuse priority

`rural` should reuse city utility infrastructure and forest vegetation where possible. It must not require a large dedicated rural asset pack.

## 9. FOREST zone

### Visual role

`forest` creates the safer branch's darkest natural-road identity while keeping the road itself highly readable.

### Composition

Use:

- tree/tree-cluster sprites at several lateral offsets;
- dark vegetation masses;
- guardrail where needed;
- occasional reflector/caution sign;
- utility pole only near transitions;
- sparse practical lighting;
- distant ridge/tree-line background where useful.

### Density

Roadside silhouette density: **medium to high**, but local detail/contrast should be low enough that traffic remains dominant.

### Geometry tendency

Prefer:

- flowing medium curves;
- rolling elevation;
- longer safe lines than the mountain-pass branch;
- no unique forest gameplay mechanic.

### Readability rule

Do not place bright tree/foliage detail directly behind traffic silhouettes at the same value range. Forest backgrounds should remain dark and compressed in contrast.

## 10. MOUNTAIN-PASS zone

### Visual role

`mountain-pass` is the short/risky branch. Risk comes primarily from authored road geometry and sightline pressure, not a new hazard system.

### Composition

Use:

- guardrails;
- repeated chevrons/caution boards;
- rock/cliff silhouettes;
- sparse trees;
- reflectors;
- occasional tunnel warning/sign element;
- very sparse street lighting.

### Density

Roadside prop density: **medium**. The important feature is stronger silhouette mass and directional signage rather than many small props.

### Geometry tendency

Prefer:

- tighter curves;
- stronger elevation changes;
- shorter sightlines;
- readable S-curves;
- more frequent outside-of-curve chevrons.

Do not change vehicle physics, collision rules or input model for the pass.

### Cliff-side rule

A cliff/rock wall may be represented through a reusable near-side rock strip/cluster or repeated projected sprites. Do not build arbitrary 3D terrain.

## 11. TUNNEL zone

### Visual role

`tunnel` is an enclosed high-speed contrast beat on the risky branch. It should feel materially different from open road while using the same road simulation/projection.

### Entry/exit

Tunnel portals are authored landmarks. The player should see an approach cue before the enclosed section begins.

Recommended transition:

```text
mountain-pass
-> tunnel warning/sign
-> portal
-> enclosed tunnel rhythm
-> exit brightness cue
-> open-road zone
```

### Interior composition

Use:

- procedural dark side-wall bands/quads aligned from projected road edges where practical;
- a dark ceiling/upper-frame enclosure treatment;
- repeating wall/ceiling lights;
- reflectors or emergency/caution signs;
- optional service recess/utility panel as a reused prop;
- reduced or disabled normal outdoor parallax while inside.

The tunnel must **not** require a full 3D mesh, raycast system or separate scene.

### Lighting

Tunnel readability is driven by rhythmic practical lights and strong road/vehicle separation. Neon should be minimal or absent.

### Geometry tendency

The tunnel may contain:

- one or two readable bends;
- mild elevation;
- no abrupt geometry that becomes unreadable due to enclosure.

### Occlusion

Tunnel wall/enclosure drawing may use the same projected segment information as the road. It is a presentation extension of the road renderer, not generalized 3D world geometry.

## 12. Zone transitions

Transitions should normally blend over several authored sections rather than switch every visual property in one frame.

Recommended rules:

- change background first or gradually reduce the previous background;
- crossfade/replace ambient prop pools over a short distance;
- keep shared props such as guardrails/utility infrastructure across the boundary;
- introduce the next zone's signature prop before its maximum density;
- avoid changing palette, geometry difficulty and prop density all at the exact same segment unless it is a deliberate tunnel portal beat.

`rural` is the preferred bridge between `city` and `forest`/`mountain-pass`.

## 13. Background/parallax strategy

Do not author one complete three-layer background set per zone.

Prefer a compact shared set such as:

- city far skyline;
- city mid/near building strip;
- distant mountain/ridge silhouette reused by rural/forest/mountain-pass;
- vegetation/field/tree-line strip reused by rural/forest;
- optional near rock/forest strip used selectively;
- no normal outdoor parallax inside tunnel.

The initial target is approximately **5–7 background/parallax images** total, not 15–25.

## 14. Shared prop vocabulary target

The five zones should normally be covered by approximately **15–18 unique roadside/environment prop images**.

High-value shared vocabulary:

1. streetlight;
2. guardrail/post;
3. utility pole;
4. tree/tree cluster;
5. rock/cliff cluster or strip;
6. chevron/caution board;
7. small direction/caution sign;
8. expressway gantry/sign;
9. convenience/commercial sign;
10. billboard;
11. traffic cone;
12. construction barricade;
13. utility box/crate;
14. tunnel portal/sign element;
15. tunnel light/reflector element;
16. delivery destination marker;
17. optional low field/vegetation cluster;
18. optional small rural structure silhouette.

The last two are optional unless playtesting shows rural/forest identity is insufficient without them.

## 15. Zone-to-prop matrix

| Prop | City | Rural | Forest | Mountain pass | Tunnel |
|---|:---:|:---:|:---:|:---:|:---:|
| streetlight | high | sparse | rare | rare | tunnel lights instead |
| guardrail | medium | medium | medium | high | optional |
| utility pole | medium | high | transition only | rare | no |
| tree/cluster | rare | medium | high | medium | no |
| rock/cliff | no | rare | low | high | portal only |
| chevron/caution | low | low | medium | high | medium |
| expressway gantry | high | rare | no | no | rare |
| commercial sign | high | sparse | no | no | no |
| billboard | medium | sparse | no | no | no |
| construction props | medium | rare | no | rare | rare |
| tunnel portal/sign | no | no | no | approach | landmark |
| tunnel light/reflector | no | no | no | no | high |
| destination marker | finish | finish | no | no | no |

Density labels are composition guidance, not exact spawn probabilities.

## 16. Route-choice readability

The player should understand that the two branches differ before committing.

The route-choice approach should use at least two channels:

1. UI/sign language: left/right route choice and risk profile;
2. environmental preview: darker/tighter mountain/tunnel cues versus more open forest/rural cues.

Do not add a minimap solely for this decision.

## 17. Scope guardrails

The zone system does **not** authorize:

- five independent biome asset packs;
- unique traffic AI per zone;
- unique vehicle handling per zone;
- procedural terrain generation;
- arbitrary 3D buildings/trees/rocks;
- weather per zone;
- day/night variants;
- scene loading per zone;
- a general-purpose prop grammar/editor;
- simultaneous multiple-road rendering solely for scenery.

If a requested visual cannot be achieved through the shared road projection, limited backgrounds, reusable projected props and simple procedural geometry, it requires explicit scope review.

## 18. Acceptance criteria

The environment composition is successful when:

- a player can distinguish `city`, `rural`, `forest`, `mountain-pass` and `tunnel` within a few seconds without reading a label;
- the five zones still look like parts of one Night Courier route and palette rather than five unrelated games;
- route branches are visually distinct before and after the decision;
- player/traffic readability remains stronger than background detail in every zone;
- prop placement is deterministic and does not visibly pop/re-roll at frame boundaries;
- tunnel entry/interior/exit is readable without a separate 3D scene;
- total asset count remains inside the revised small-scope inventory unless a concrete readability problem justifies more content.
