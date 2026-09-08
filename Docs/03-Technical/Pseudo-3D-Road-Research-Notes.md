# Pseudo-3D Road Research Notes

## Purpose

This note records the technical reasoning extracted from two primary references:

- Jake Gordon — `JavaScript Racer`: https://jakesgordon.com/writing/javascript-racer/
- Lou Gorenfeld — `Pseudo-3D Page`: https://www.extentofthejam.com/pseudo/

The goal is **not** to port either codebase. These references are used to understand proven pseudo-3D racer ideas, trade-offs and failure modes before implementing Night Courier independently in Phaser + TypeScript.

## Reference policy

Accepted use:

- mathematical/algorithmic ideas;
- coordinate-space reasoning;
- road-segment representation concepts;
- curve/elevation/occlusion strategies;
- fixed-step simulation reasoning;
- data-oriented traffic lookup ideas;
- implementation-order lessons and known pitfalls.

Explicitly not adopted:

- source-file layout;
- global-state organization;
- function/class names;
- helper APIs;
- exact control flow;
- magic constants;
- demo-specific speed/segment constraints;
- original assets, music or sprites;
- source-code blocks copied into Night Courier.

Night Courier's implementation remains governed by its own architecture and TypeScript contracts.

## 1. Technique selection

Lou Gorenfeld describes several pseudo-3D families, including raster/scanline road distortion and segment-based projection. For Night Courier, the most appropriate baseline is **projected road segments**.

Why:

- supports curves and hills with one coherent representation;
- road width/elevation remain consistent under perspective;
- integrates naturally with sprite-based traffic and roadside props;
- does not require full 3D scene complexity;
- maps cleanly to Phaser Graphics + Sprite rendering;
- easier to reason about and test than scanline/Z-map distortion for this scope.

Rejected as primary renderer:

- raster/Z-map road rendering;
- full 3D mesh/rotation pipeline;
- generalized multiple-road renderer at initial scope.

## 2. Road as longitudinal segments

The core idea is to divide the road into small fixed-length runtime segments along track distance.

Each runtime segment has two endpoints and enough data to derive:

- depth relative to camera;
- projected horizontal center;
- projected vertical position;
- projected road width;
- curve contribution;
- elevation;
- clipping/occlusion information.

This representation is useful because the same segment index can support:

- projection;
- visible-range queries;
- traffic/prop placement;
- collision lookahead;
- hill occlusion;
- route progress.

Night Courier keeps compact authored sections separate from these runtime segments so designers do not author hundreds of individual projection units.

## 3. Coordinate-space reasoning

The useful conceptual pipeline is:

```text
world / track space
    -> camera-relative space
    -> perspective projection
    -> screen space
```

Authoritative gameplay values should stay out of screen space.

Examples:

- player lateral position is road-relative;
- traffic longitudinal position is track-relative;
- collision uses lateral/longitudinal envelopes;
- projected sprite size/position is visual output only.

This avoids gameplay rules changing merely because perspective scale changes.

## 4. Perspective projection

For each visible road endpoint:

1. subtract camera position from world position;
2. derive a perspective scale from camera depth divided by endpoint depth;
3. use that scale to project horizontal center, vertical elevation and road width into screen coordinates.

Night Courier only needs a constrained road-camera model. It does not need arbitrary scene-object rotation or a generic 3D transform stack.

## 5. Curves through accumulated displacement

A practical pseudo-3D curve does not need true rotated road geometry.

The important idea is to accumulate lateral displacement while walking visible segments:

```text
segment curve contribution
    -> changes lateral displacement rate
    -> accumulated rate changes projected road-center offset
```

This produces the visual impression of the road bending away from the camera.

Important continuity detail:

The accumulation should account for the camera/player's fractional progress through the current base segment. Otherwise the projected curve can visibly shift when crossing from one segment index to the next.

## 6. Curve authoring and easing

Track authoring should treat a bend as phases rather than a discontinuous curvature value:

```text
enter curve
    -> hold curvature
    -> leave curve
```

The transition is eased between zero and target curvature.

Benefits:

- smoother visual steering;
- easier track tuning;
- fewer abrupt camera/road changes;
- S-bends can be composed from simple sections;
- no spline/editor framework required.

This belongs inside simple road-section compilation, not a separate track-authoring system.

## 7. Hills through elevation

Projected-segment roads allow hills to use actual elevation values on road endpoints.

The same perspective projection naturally converts elevation into screen-space vertical displacement.

Therefore hills should not require a separate rendering path.

Implementation sequence remains:

```text
straight road
    -> curves
    -> hills
```

Curves should be stable before adding vertical complexity.

## 8. Hill occlusion

A critical lesson from projected-road implementations is that hills require explicit visibility handling.

Road geometry can be traversed from near to far while maintaining the highest currently visible screen-space road boundary. Farther segments fully hidden behind a nearer crest can be skipped.

Projected sprites are then drawn from far to near, with a clipping boundary derived from the nearer road surface so vehicles/props can disappear progressively behind a crest.

This is sufficient for the arcade illusion and does not justify a generic occlusion system.

## 9. Render order

The useful model is not simply "draw everything back-to-front".

For Night Courier:

```text
road polygons
    near -> far
    with crest/max-visible-Y rejection

sprites / roadside objects
    far -> near
    clipped against road/crest boundary where needed
```

This distinction should remain explicit because road visibility and sprite overlap solve different problems.

## 10. Fixed-step simulation

Jake Gordon's tutorial uses a fixed simulation step under a render loop. The reasoning remains applicable even though Night Courier runs inside Phaser.

Night Courier should:

- receive render-frame delta from Phaser;
- clamp abnormal wall-clock gaps;
- accumulate time;
- advance gameplay in fixed steps;
- bound catch-up work after stalls/backgrounding;
- render once from the current state.

Why:

- more stable road progression;
- consistent steering/acceleration behavior;
- easier collision and near-miss reasoning;
- less frame-rate-dependent tuning.

This remains a small `GameScene` concern, not a new timing subsystem.

## 11. Avoid demo-specific segment/speed coupling

Some simple racer demos rely on the vehicle moving no more than roughly one road segment per simulation step because that simplifies lookup/collision assumptions.

Night Courier must not turn this into a design invariant.

Road tessellation and vehicle balance should remain independently tunable.

If later traffic collision can be skipped at high speed, preferred solutions include:

- bounded simulation substeps;
- swept longitudinal overlap checks;
- checking all crossed segment ranges.

Do not solve it by arbitrarily limiting vehicle speed to segment size.

## 12. Traffic indexing idea

A useful data-oriented idea is to associate traffic with the road segment/range currently containing it while keeping traffic ownership inside `Traffic.ts`.

Potential benefits:

- efficient visible-traffic queries;
- nearby collision candidates;
- look-ahead behavior;
- reduced scanning of irrelevant traffic.

This should only be introduced when M3 needs it. It is an indexing strategy, not a reason to merge Road and Traffic responsibilities.

## 13. Route branches

Lou's discussion includes more advanced multi-road/fork techniques. Those techniques are informative but exceed the current requirement.

Night Courier initially needs one choice between two route continuations. The simplest acceptable design is:

```text
reach branch decision
    -> choose branch
    -> select next authored road-section sequence
    -> continue using the same projected road
```

A simultaneously rendered multi-road fork is deferred unless playtesting proves the branch unreadable without it.

## 14. Phaser mapping

The references frequently use raw Canvas rendering. Night Courier should translate only the rendering concepts into Phaser, not their renderer implementation.

Expected ownership:

- one/few reusable Phaser Graphics objects for procedural road geometry;
- Phaser Sprites for player, traffic and roadside art;
- runtime road segments remain plain TypeScript data, not one Phaser GameObject per segment;
- Phaser handles the browser/game lifecycle while our code owns the constrained simulation/projection rules.

## 15. Implementation-order lesson

The safest vertical progression is:

1. runtime road representation;
2. segment lookup;
3. straight-road perspective projection;
4. straight road drawing;
5. curves and fractional-segment continuity;
6. player input/motion;
7. fixed-step simulation robustness;
8. hills and crest occlusion;
9. traffic/props only after projection is stable.

This keeps debugging surfaces isolated and matches Night Courier's existing milestone philosophy.

## 16. What this research changes

It strengthens and clarifies existing decisions rather than expanding scope:

- projected segments are the renderer baseline;
- authored road sections compile to runtime segments;
- curve accumulation uses fractional-base-segment continuity;
- curve entry/exit uses simple easing;
- hills are elevation on the same projected road model;
- road and sprite rendering have different traversal order;
- hills require crest clipping/occlusion;
- gameplay simulation uses a bounded fixed step;
- vehicle tuning is not coupled to segment length;
- route branching remains simple unless evidence requires richer geometry.

## 17. What this research does not change

No change to:

- Phaser 4 + TypeScript + Vite;
- 12-file architecture target;
- custom arcade physics/math;
- one-route/one-branch initial content scope;
- Unity/WebView host boundary;
- asset budget;
- no React/ECS/general racing framework policy.

These references reduce uncertainty in M1; they do not justify additional architecture.
