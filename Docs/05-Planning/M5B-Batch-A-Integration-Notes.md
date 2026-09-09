# M5B — Batch A Integration Notes

## Scope completed in this slice

- preload and source-dimension validation for all 27 standard Batch A images;
- player five-pose runtime path retained at 256x256 with canonical `(128,232)` source origin;
- four traffic identities (`taxi`, `hatchback`, `van`, `truck`) integrated into the existing `car | van | truck` simulation types;
- traffic five-yaw presentation selected from local projected road tangent, without new AI/physics state;
- traffic switched from procedural rectangles to a fixed pool of projected Phaser images with crest crop;
- `bg_city_far` and `bg_city_mid` integrated as authored 2048x512 parallax layers;
- M4 procedural city backdrop suppressed only while authored city layers are active; natural/tunnel placeholders remain until Batch B.

## Validation evidence

Temporary branch-only workflows were used and removed before PR:

- asset contract: 27/27 files present; player/traffic 256x256; city backgrounds 2048x512; alpha/transparency present; all vehicle frames <=24 visible colors;
- production browser: player binary input traversed `Center -> Left -> Hard Left` and back through `Left`; 12-object traffic sprite pool rendered production texture keys; city mid parallax moved faster than far; city backgrounds were suppressed in rural/forest/mountain-pass/tunnel; representative 960x540 screenshots were reviewed;
- M3 regression: collision one-shot, near-miss one-shot, cargo damage and speed retention remained unchanged after traffic presentation integration;
- standard WebGame typecheck/build/static-output CI passed on the runtime integration branch.

## Blocking production-art issue

M5B runtime integration is usable, but M5.6/M5.8 are **not accepted** yet because the committed vehicle families do not consistently satisfy the frozen source-registration contract.

The player source uses canonical road-contact anchor `(128,232)`, but measured visible alpha bottoms are approximately:

```text
hard_left  201
left       211
center     213
right      211
hard_right 202
```

Representative gameplay therefore shows the Center player visibly floating about 19 source/display pixels above the intended contact position. Several steering frames also touch a horizontal canvas edge.

Traffic alpha bounds also vary materially by yaw family (especially taxi/hatchback hard-yaw states), so final traffic registration/bounce acceptance remains open.

Do not solve these source defects through per-texture runtime offsets or per-state scale compensation. Re-register/re-export the source PNG families against the frozen 256x256 `(128,232)` contract, then rerun M5.6/M5.8 visual acceptance.
