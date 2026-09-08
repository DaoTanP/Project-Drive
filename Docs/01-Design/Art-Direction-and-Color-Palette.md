# Art Direction and Color Palette

## 1. Visual target

Night Courier uses a **late-1990s Japanese-inspired night-route** aesthetic that begins in dense urban/commercial roads and extends through rural, forested, mountain-pass and tunnel sections without breaking visual cohesion.

The route may move beyond the city, but the game remains one environment family. Shared road materials, infrastructure language, practical lighting, palette and pixel-art treatment must make every zone feel part of the same delivery journey.

The target is **not** generic 1980s synthwave. The game may borrow restrained neon accents, primarily in commercial/city sections, but it must avoid turning every surface or every zone into purple/pink/cyan lighting or recreating the visual fantasy associated with classic coastal supercar racers.

The visual identity is:

`dark cool night neutrals + practical Japanese roadside lighting + selective city neon + strong gameplay readability`

Reference philosophy:

- One-Dark-like cool neutral foundation for shadows, panels and inactive surfaces;
- realistic warm practical lights for lamps, brake lights, signs, shops and tunnel fixtures;
- restrained synthwave/cyberpunk accents for selected city/commercial signage and UI emphasis;
- Dracula-like semantic color separation may inform HUD states, but Dracula is not the world palette.

The authoritative zone-composition rules are defined in [`Environment-Zones-and-Roadside-Composition.md`](Environment-Zones-and-Roadside-Composition.md).

## 2. Master palette — Night Courier 20

The initial production palette is intentionally limited to the following 20 colors.

### Night / shadow ramp

| Token | Hex | Primary use |
|---|---|---|
| `NC-00` | `#080C18` | deepest night, outlines, maximum shadow |
| `NC-01` | `#0E1628` | far background, deep building/forest/tunnel shadow |
| `NC-02` | `#16223A` | building mass, vegetation/rock mass, dark roadside structures |
| `NC-03` | `#22334D` | asphalt/metal/rock shadow, near dark surfaces |
| `NC-04` | `#344A64` | lit blue-gray, secondary material separation |

### Neutral / material ramp

| Token | Hex | Primary use |
|---|---|---|
| `NC-05` | `#64748A` | medium gray-blue, metal/guardrail/vehicle shading |
| `NC-06` | `#9BAABC` | light metal, vehicle midtone, reflector support |
| `NC-07` | `#D5DCE5` | cool white, road markings, light vehicle body |
| `NC-08` | `#F5F3EA` | headlight/specular/tunnel-light white, maximum highlight |

### Practical lights

| Token | Hex | Primary use |
|---|---|---|
| `NC-09` | `#F4C95D` | sodium/street/tunnel light, illuminated signs |
| `NC-10` | `#FF914D` | amber indicators, warm highlights, caution lighting |
| `NC-11` | `#EB5548` | taillight, warning red, hero livery secondary |

### Neon accents

| Token | Hex | Primary use |
|---|---|---|
| `NC-12` | `#FF3B8D` | selective city/commercial neon pink |
| `NC-13` | `#B56CFF` | selective city/commercial violet |
| `NC-14` | `#22D3EE` | selective neon cyan, combo accent |
| `NC-15` | `#29A9E8` | electric blue, signage/navigation accent |

### Gameplay semantic colors

| Token | Hex | Primary use |
|---|---|---|
| `NC-16` | `#55E06F` | cargo good, success/start state |
| `NC-17` | `#D6F04B` | caution, medium cargo state |
| `NC-18` | `#FFCC33` | score/time emphasis, high-importance neutral-positive state |
| `NC-19` | `#FF455D` | danger, damage, failure/finish emphasis |

The palette is a production constraint, not a requirement that every sprite use all 20 colors.

## 3. Palette distribution

Global target scene distribution remains approximately:

- **70%** dark/cool neutrals;
- **20%** practical warm lighting and material highlights;
- **10%** neon/high-saturation accents at most.

Zone-specific guidance:

- `city`: may approach the full accent allowance;
- `rural`: practical warm points, very little neon;
- `forest`: predominantly dark neutral masses with sparse reflectors/lamps;
- `mountain-pass`: dark neutral/rock masses with amber/white caution cues;
- `tunnel`: dark enclosure + rhythmic practical white/amber lights, minimal neon.

Neon is an accent system, not ambient coverage.

## 4. Value hierarchy

At gameplay speed, value contrast is more important than hue variety.

Priority:

1. player vehicle — highest readability;
2. traffic/hazards — high readability;
3. road/lane structure — medium readability;
4. gameplay-relevant caution/route signage — medium to high when needed;
5. roadside props — medium to low depending on gameplay relevance;
6. distant background — lowest contrast.

The player must remain readable over every legal zone composition without relying on a permanent glow outline.

## 5. Player vehicle rule

The hero vehicle remains primarily **light neutral/white-gray with red/orange delivery accents**, dark tires/windows and restrained highlights.

Recommended player subset:

- `NC-00` / `NC-03` for outline, tires and deep shadow;
- `NC-05` / `NC-06` for material shading;
- `NC-07` / `NC-08` for body/highlights;
- `NC-10` / `NC-11` for indicators, taillights and delivery livery.

Do not recolor the hero vehicle per environment zone. Its stable light body is intentionally distinct from city, forest, mountain and tunnel backgrounds.

## 6. Sprite color budgets

Individual assets should generally use a smaller subset of the master palette:

- player vehicle: roughly 6–9 colors;
- traffic vehicle: roughly 5–8 colors;
- roadside prop: roughly 4–7 colors;
- background cluster/strip: roughly 4–8 colors;
- UI icon: roughly 2–5 colors.

This is guidance, not a hard per-file validator. The purpose is visual cohesion and readable pixel clusters.

## 7. Background and depth rules

Depth is reinforced through contrast and saturation in addition to geometric scaling.

- far layer: narrow value range, reduced saturation, mostly `NC-01`..`NC-04`;
- mid layer: normal material colors with selective practical lights;
- near layer/gameplay objects: full allowed contrast and saturation;
- neon in distant city layers should be dimmed rather than using the same maximum-intensity color as foreground signage;
- forest/ridge silhouettes should be compressed into dark values rather than individually detailed;
- tunnel normally disables outdoor parallax and replaces it with enclosure rhythm.

Do not create a unique hue ramp for every zone or depth layer. Reuse the master palette and choose different subsets/compositions.

## 8. Environment lighting rules

The world should contain ordinary practical lighting, not only neon.

Expected sources include:

- amber/sodium streetlights;
- white headlights;
- red vehicle taillights;
- yellow/white shop illumination;
- green/blue expressway signs;
- rural roadside lamps or reflectors;
- mountain caution/reflector lighting;
- white/amber tunnel fixtures;
- limited cyan/pink/violet commercial neon in city sections.

Wet-road reflections may reuse source colors at reduced value/saturation. They should not turn the entire road into a saturated neon mirror.

## 9. Zone visual signatures

Each zone must be distinguishable primarily by silhouette and composition, not by a completely different palette.

### City

- building/skyline mass;
- streetlight rhythm;
- gantries/signage;
- commercial lights;
- higher roadside density.

### Rural

- larger negative space;
- utility poles;
- sparse vegetation/field edge;
- occasional warm roadside light;
- fewer signs.

### Forest

- layered dark tree masses;
- low-detail vegetation silhouettes;
- guardrail/reflector rhythm;
- very sparse practical lights.

### Mountain pass

- rock/cliff mass;
- guardrail;
- repeated chevrons/caution signs;
- strong elevation/curve silhouette;
- sparse trees/lights.

### Tunnel

- enclosed dark side/upper frame;
- rhythmic white/amber fixtures;
- repeating reflectors/signs;
- minimal exterior color noise.

## 10. HUD semantic mapping

HUD uses dark neutral containers and high-value text with semantic accent colors.

Default mappings:

- score emphasis: `NC-18`;
- timer normal: `NC-18` or `NC-08`;
- cargo good: `NC-16`;
- cargo caution: `NC-17`;
- cargo danger/damage: `NC-19`;
- near-miss/combo: `NC-14` with optional `NC-12` for high combo emphasis;
- route-choice/navigation: `NC-15` / `NC-18` as needed;
- pause/inactive controls: neutral ramp.

Avoid assigning a different neon hue to every HUD widget merely for decoration.

## 11. Road rendering

Road surface, lanes, shoulders and curves are primarily procedural geometry/colors, not pre-rendered road sprites.

Use the neutral/shadow ramp for asphalt and infrastructure. Lane markings use high-value neutral colors. Roadside lighting and signs introduce controlled color accents.

Tunnel wall/ceiling enclosure may also use simple procedural projected geometry where practical. It remains part of the existing road presentation, not a separate 3D environment renderer.

## 12. Pixel-art consistency

The game targets `960 x 540` logical resolution.

Asset authoring must maintain a consistent apparent pixel density across vehicles, props and UI. Do not mix visibly incompatible pixel scales or anti-aliased illustration with hard-edged pixel sprites.

Preferred production behavior:

- nearest-neighbor scaling for pixel assets;
- no automatic smoothing that softens sprite pixels;
- integer-aligned positioning where visually important and practical;
- avoid subpixel shimmer on HUD and player vehicle;
- use deliberate clusters rather than high-frequency single-pixel noise.

## 13. What is explicitly rejected

The initial art direction rejects:

- pure Dracula as a world palette;
- pure One Dark as the full game palette;
- unrestricted generic synthwave purple/pink/cyan coverage;
- assigning a completely different master palette to each zone;
- rainbow neon on every prop/UI element;
- large uncontrolled color counts per sprite;
- realistic full-color digital painting mixed with pixel sprites;
- background contrast strong enough to compete with player/traffic readability;
- five visually unrelated biome packs.

## 14. Change discipline

The Night Courier 20 palette is the initial authoritative color baseline for all five zones.

Small value/saturation corrections discovered during actual sprite production are allowed when they preserve token purpose and overall hierarchy. Adding/replacing master colors should require a concrete production problem such as:

- missing material separation;
- poor gameplay readability;
- inaccessible semantic state distinction;
- severe banding/loss of form in important sprites.

Do not expand the palette merely to add environmental variety. Zone distinction should first be solved through composition, silhouette, density and lighting profile.
