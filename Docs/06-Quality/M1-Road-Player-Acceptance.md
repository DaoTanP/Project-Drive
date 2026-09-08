# M1 Road / Player Acceptance Checklist

This checklist records the validation evidence for Milestone 1.

## Automated

- [x] `npm ci`
- [x] `npm run typecheck`
- [x] `npm run build`
- [x] static `dist/` smoke test
- [x] headless 960x540 production-canvas smoke test
- [x] headless motion smoke covering throttle, steering, curve and hill states

## Behavioral review

- [x] road projection remains stable across the exercised segment ranges;
- [ ] curves enter and leave without perceptible lateral snapping during a human playtest;
- [x] hills use the same projection path and do not require a separate renderer;
- [x] crest rejection prevents obviously hidden farther road geometry from drawing over nearer terrain in the exercised hill state;
- [x] acceleration, coast, brake and steering are advanced only by the fixed simulation step rather than render-frame delta;
- [x] large browser/WebView frame gaps are bounded rather than replayed as simulation time;
- [x] vehicle speed tuning is independent from runtime segment length;
- [x] M1 does not introduce traffic, multi-road rendering, physics engine or extra architecture layers.

## Visual evidence

Temporary CI-only browser harnesses exercised the production build at 960x540 and captured:

- initial straight-road state at 0 km/h;
- throttle + steering state at approximately 153 km/h with non-zero `roadX`;
- full-speed state with a visible curved section;
- full-speed state inside the authored hill section.

The harnesses were removed from the feature branch after validation and are not runtime/project dependencies.

## Remaining manual acceptance

A real human browser playtest is still required to judge **control feel** and whether curve transitions have any perceptible snap while moving continuously. This is a subjective acceptance item, not an unimplemented M1 feature.
