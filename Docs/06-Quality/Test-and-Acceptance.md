# Test and Acceptance

## 1. Quality strategy

Night Courier is small enough that quality should come from focused automated checks plus repeated gameplay/lifecycle validation, not a large test framework.

Priorities:

1. deterministic pure rules where practical;
2. browser production-build correctness;
3. gameplay acceptance through manual playtest;
4. Unity/WebView lifecycle reliability;
5. representative mobile performance.

## 2. Automated checks

### Mandatory on meaningful changes
- TypeScript typecheck passes.
- Production Vite build passes.
- Existing automated tests pass.

### High-value unit-test candidates
Prefer testing pure functions/logic such as:
- perspective projection invariants;
- score calculation;
- rank thresholds;
- cargo clamping;
- near-miss state transitions;
- message validation/serialization.

Do not unit-test Phaser rendering internals merely to increase coverage.

## 3. Road / rendering acceptance

- Straight road remains visually centered at neutral steering.
- Positive/negative curves bend consistently and reverse correctly.
- Hills do not invert segment ordering or produce visible projection explosions.
- Nearby segments occlude farther segments correctly enough for the visual style.
- Traffic/props scale consistently with projected depth.
- Resizing the viewport does not change simulation coordinates or break HUD layout.

## 4. Driving acceptance

- Acceleration reaches but does not exceed configured max speed.
- Brake response is stronger than passive deceleration.
- Steering remains controllable at high speed.
- A large resume frame delta cannot teleport the player down the track.
- Input release reliably returns throttle/brake/steer toward neutral.

## 5. Collision / cargo acceptance

- Collision is based on gameplay/road space, not accidental screen overlap.
- One contact event cannot repeatedly drain cargo every frame without intended cooldown/separation behavior.
- Collision visibly reduces speed.
- Cargo condition never exceeds 100 or falls below 0.
- Collision resets near-miss combo.

## 6. Near-miss acceptance

- A vehicle can award at most one near miss per successful pass.
- A true collision does not also award a near miss for the same pass.
- A pass outside the proximity threshold does not award score.
- Combo increments on valid consecutive near misses and resets on collision.

## 7. Run lifecycle acceptance

- New run starts from clean state.
- Timer decreases only while gameplay is active.
- Timeout produces a controlled failure/result state.
- Destination produces a controlled completion/result state.
- Restart creates a clean state without stale traffic/score/timer values.
- A normal run lands near the 4–5 minute target after tuning.

## 8. Route acceptance

- Route choice is clearly readable before commitment.
- Player enters exactly one branch.
- Both branches reconnect/complete correctly.
- Riskier branch demonstrates materially higher traffic/risk or shorter duration.
- Safer branch remains viable rather than strictly inferior.

## 9. Host bridge acceptance

- `READY` is emitted once the game can safely accept `INIT`.
- Invalid/unsupported message versions are rejected safely.
- Missing required INIT fields use explicit defaults only where documented; otherwise fail cleanly.
- `PAUSE` stops run progression.
- `RESUME` does not apply elapsed background time as simulation delta.
- `GAME_COMPLETED` payload values are within documented ranges.
- Unity validates payload before save.
- WebView can be destroyed and recreated without duplicate callbacks or stale state.
- Second launch in the same Unity process behaves like the first.

## 10. Offline acceptance

Test with network unavailable:
- page loads;
- all scripts/styles load;
- all required sprites/audio load;
- full run can complete;
- Unity result round trip works.

No required runtime resource may originate from a CDN or public URL.

## 11. Performance acceptance

Exact budgets should be established on the actual target device rather than invented in advance. Initial acceptance is behavioral:

- no sustained visible frame pacing failure during representative traffic density;
- no progressive memory growth across repeated runs;
- no retained active WebView after exit;
- no large GC/allocation spikes caused by per-frame traffic churn;
- touch input remains responsive under representative load.

If profiling identifies a bottleneck, document measured evidence before adding optimization architecture.

## 12. Defect severity

- **P0:** crash, corrupt host state/save, impossible to exit, security-critical integration failure.
- **P1:** cannot complete a normal run, major input/rendering failure, repeated WebView lifecycle failure.
- **P2:** scoring/balance/visual defect with workaround or limited impact.
- **P3:** cosmetic/polish issue.

Release baseline: no known P0 or P1 defects.

## 13. Product acceptance checklist

A release candidate is acceptable when:

- [ ] Core controls are immediately understandable.
- [ ] One complete 4–5 minute run works.
- [ ] Cargo condition changes player risk decisions.
- [ ] Near-miss scoring creates intentional score-chasing behavior.
- [ ] Route split provides a meaningful but simple choice.
- [ ] Browser standalone build works.
- [ ] Offline Unity WebView build works.
- [ ] Result persists through Unity.
- [ ] Repeated launch/close cycle is stable.
- [ ] No deferred feature is necessary to explain or complete the core loop.
