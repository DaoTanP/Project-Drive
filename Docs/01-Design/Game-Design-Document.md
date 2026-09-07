# Game Design Document

## 1. Product statement

**Night Courier** is a short-session pseudo-3D arcade racer. The player drives a compact delivery car through a neon urban night route, balancing speed against cargo damage while building score through clean, close passes around traffic.

The game is intended to exist as an arcade-style minigame inside a larger Unity title while remaining independently playable in a desktop browser for development and QA.

## 2. Design goals

- Immediate readability: the player understands the objective and controls within seconds.
- Short replayable sessions: one complete run targets 4–5 minutes.
- Arcade over simulation: responsive handling, predictable rules and score chasing matter more than realism.
- Distinct from OutRun through delivery pressure, cargo condition and near-miss scoring rather than luxury-road-trip fantasy.
- Low production cost: mechanics and content must remain small enough for rapid AI-assisted development and iteration.

## 3. Player fantasy

The player is a late-night courier trying to complete a delivery before the deadline without destroying the cargo.

The intended tension is:

`drive faster -> gain time / scoring opportunities -> increase collision risk -> threaten cargo condition`

## 4. Core loop

1. Start delivery.
2. Accelerate into traffic.
3. Steer around vehicles and roadside hazards.
4. Earn near-miss score and combo by passing close without contact.
5. Preserve cargo condition.
6. Reach a route split and choose a risk profile.
7. Reach the destination before time expires.
8. Calculate final score/rank.
9. Return result to Unity or restart in browser mode.

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

The route split exists to create one strategic decision without building a navigation system.

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

- opening section: ~60–90 s;
- route choice;
- branch section: ~90 s;
- final section: ~60–90 s;
- result screen.

Total target: 4–5 minutes.

## 10. Initial content budget

- 1 player vehicle
- 1 night-city visual theme
- 3 traffic vehicle visual variants
- approximately 10–15 roadside prop variants
- 1 route with 1 branch
- 1 music track
- approximately 8 SFX
- minimal HUD: timer, score, cargo, combo

## 11. Explicit non-goals

The initial version does not include:

- open world;
- garage or car selection;
- upgrades;
- career/progression tree;
- police pursuit system;
- realistic vehicle physics;
- damage simulation;
- procedural city generation;
- multiplayer;
- backend services;
- monetization systems;
- complex story presentation.

## 12. Success criteria

The game succeeds if a first-time player can finish or fail a run without instructions beyond the visible controls, understands why score changes, feels a meaningful risk/reward trade-off between speed and cargo preservation, and voluntarily retries to improve score or route execution.
