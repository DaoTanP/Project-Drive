# Game Design Document

## 1. Product statement

**Night Courier** is a short-session pseudo-3D arcade racer. The player drives a compact delivery car through a late-night Japanese-inspired route that moves from dense city streets toward darker rural and mountain roads, balancing speed against cargo damage while building score through clean, close passes around traffic.

The game is intended to exist as an arcade-style minigame inside a larger Unity title while remaining independently playable in a desktop browser for development and QA.

## 2. Design goals

- Immediate readability: the player understands the objective and controls within seconds.
- Short replayable sessions: one complete run targets 4–5 minutes.
- Arcade over simulation: responsive handling, predictable rules and score chasing matter more than realism.
- Distinct from OutRun through delivery pressure, cargo condition and near-miss scoring rather than luxury-road-trip fantasy.
- Environmental pacing: a small route should still feel like a meaningful journey through clearly readable zones.
- Low production cost: mechanics and content must remain small enough for rapid AI-assisted development and iteration.

## 3. Player fantasy

The player is a late-night courier trying to complete a delivery before the deadline without destroying the cargo.

The intended tension is:

`drive faster -> gain time / scoring opportunities -> increase collision risk -> threaten cargo condition`

The route should also communicate physical progression:

`city -> outskirts/rural -> route split -> forest or mountain-pass/tunnel -> destination`

## 4. Core loop

1. Start delivery.
2. Accelerate into traffic.
3. Steer around vehicles and roadside hazards.
4. Earn near-miss score and combo by passing close without contact.
5. Preserve cargo condition.
6. Reach a route split and choose a risk profile.
7. Read changing roadside/environment cues as the route moves through different zones.
8. Reach the destination before time expires.
9. Calculate final score/rank.
10. Return result to Unity or restart in browser mode.

## 5. Controls

### Keyboard
- Left / Right: steer
- Up: accelerate
- Down: brake
- Escape: pause / exit flow as host permits

### Touch
- Left and Right steering zones/buttons
- Brake
- Accelerate

### Gamepad
Supported through the same normalized input contract when practical. It is not allowed to delay the first playable milestone.

## 6. Core state

The minimum meaningful run state is:

- speed
- lateral road position
- track position
- time remaining
- cargo condition
- score
- near-miss combo
- run status

Environment zone identity is authored route data/presentation state, not a new player gameplay resource.

## 7. Mechanics

### Driving
- One player vehicle.
- Arcade acceleration and braking.
- Lateral steering in normalized road space.
- No gears, drift system, handbrake, nitro or vehicle tuning.

### Traffic
- Small set of traffic vehicle variants driven by data rather than bespoke classes.
- Traffic exists primarily as avoidance and near-miss opportunities.
- No advanced traffic AI is required.

### Collision
A collision causes:
- immediate speed loss;
- cargo damage;
- near-miss combo reset;
- optional brief visual/audio impact feedback.

### Cargo condition
- Starts at 100%.
- Decreases on collision.
- Contributes to final score.
- The first version does not simulate cargo physics or package-specific behavior.

### Near miss
A clean close pass awards score and increments a combo multiplier. Collision resets the combo.

### Timer
The run must be completed before time reaches zero. Checkpoints may add time only if playtesting proves necessary; they are not required for the first playable milestone.

### Route choice
The initial game contains one meaningful branch:

- shorter / denser / riskier route;
- longer / safer route.

The preferred environmental mapping is:

- short/risky branch: `mountain-pass -> tunnel`;
- long/safer branch: `forest -> rural`.

The route split exists to create one strategic decision without building a navigation system or generalized multi-road renderer.

## 8. Scoring

Final score is derived from:

- accumulated driving score;
- near-miss and combo score;
- remaining time bonus;
- cargo-condition bonus;
- collision penalties where needed for tuning.

Exact coefficients are tuning data, not frozen design contracts.

## 9. Run structure

Target shape:

- city opening: ~60–90 s;
- rural/outskirts transition and route choice;
- branch section: ~90 s;
- short/risky branch uses mountain-pass and tunnel presentation;
- long/safer branch uses forest and rural presentation;
- final city-fringe/depot approach: ~60–90 s;
- result screen.

Total target: 4–5 minutes.

Exact zone durations are tuning data. Not every zone must occupy the same amount of time.

## 10. Environment zones

The initial route uses five presentation zones:

- `city`;
- `rural`;
- `forest`;
- `mountain-pass`;
- `tunnel`.

They are one coherent environment family, not five separate biome packs. They share the same renderer, palette, traffic logic and most roadside assets.

Environment identity should come primarily from:

- road geometry and sightlines;
- prop type/density/spacing;
- background/parallax selection;
- practical-lighting rhythm;
- a small number of signature silhouettes.

Detailed zone composition, transition and prop-placement rules are authoritative in [`Environment-Zones-and-Roadside-Composition.md`](Environment-Zones-and-Roadside-Composition.md).

## 11. Initial content and asset budget

The initial release deliberately uses a small authored asset set. Pseudo-3D projection, parallax, composition and reuse provide visual richness instead of a large content library.

Runtime target:

- 1 player vehicle with **5 required steering poses** and up to 3 optional brake-light variants;
- 3 traffic gameplay classes (`car`, `van`, `truck`) represented by approximately **4–6 visual images**; taxi and hatchback may share the `car` behavior;
- approximately **15–18 reusable roadside/environment prop sprites** shared across all five zones;
- approximately **5–7 background/parallax images** shared across zones; tunnel normally disables outdoor parallax;
- approximately **4–6 small VFX textures**;
- approximately **5–8 HUD/gameplay icons**;
- 1 pixel/bitmap font family where practical;
- 1 route with 1 branch;
- 1 music track;
- approximately 8 SFX;
- minimal HUD: timer, score, cargo, combo.

The normal total visual budget is approximately **38–53 unique runtime images**, or roughly **49–74 frames/images** after steering, brake and FX variants are counted.

Road geometry, lane markings, simple tunnel enclosure geometry, simple HUD bars/text, flashes, fades and other simple shapes remain procedural rather than sprite-authored.

The authoritative inventory, production batches, naming, pivots and explicit deferred assets are defined in [`Asset-Inventory-and-Sprite-Requirements.md`](Asset-Inventory-and-Sprite-Requirements.md).

## 12. Visual direction baseline

The visual target is a **late-1990s Japanese-inspired night route**, beginning in a dense urban/commercial environment and extending into rural, forested and mountain-road areas while preserving one coherent palette and material language.

The world uses:

- dark cool neutrals as the dominant field;
- practical warm lighting from streetlights, headlights, taillights, commercial interiors and tunnel fixtures;
- restrained cyan/pink/violet neon mainly in city/commercial areas rather than across every zone;
- a light neutral/white-gray hero delivery vehicle with red/orange accents for strong gameplay readability;
- lower contrast/saturation in distant scenery and maximum readable contrast on player/traffic objects.

The authoritative color baseline is the custom **Night Courier 20** palette defined in [`Art-Direction-and-Color-Palette.md`](Art-Direction-and-Color-Palette.md).

Pure Dracula, pure One Dark and unrestricted generic synthwave palettes are references only and are not approved as full-game world palettes.

## 13. Explicit non-goals

The initial version does not include:

- open world;
- garage or car selection;
- upgrades;
- career/progression tree;
- police pursuit system;
- realistic vehicle physics;
- damage simulation;
- procedural city/terrain generation;
- independent biome packs with separate gameplay systems;
- multiplayer;
- backend services;
- monetization systems;
- complex story presentation.

## 14. Success criteria

The game succeeds if a first-time player can finish or fail a run without instructions beyond the visible controls, understands why score changes, feels a meaningful risk/reward trade-off between speed and cargo preservation, can visually distinguish the five route zones without explicit labels, understands that the two branches present different risk/readability profiles, and voluntarily retries to improve score or route execution.
