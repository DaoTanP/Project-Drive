# M1 Road / Player Acceptance Checklist

This checklist records the validation evidence required before Milestone 1 is merged.

## Automated

- [ ] `npm ci`
- [ ] `npm run typecheck`
- [ ] `npm run build`
- [ ] static `dist/` smoke test

## Behavioral review

- [ ] road projection remains continuous across segment boundaries;
- [ ] curves enter and leave without visible lateral snapping;
- [ ] hills use the same projection path and do not require a separate renderer;
- [ ] crest rejection prevents obviously hidden farther road geometry from drawing over nearer terrain;
- [ ] acceleration, coast, brake and steering remain frame-rate-independent under the fixed simulation step;
- [ ] large browser/WebView frame gaps are bounded rather than replayed as simulation time;
- [ ] vehicle speed tuning is independent from runtime segment length;
- [ ] M1 does not introduce traffic, multi-road rendering, physics engine or extra architecture layers.

Manual visual/readability acceptance should be performed in a real browser at 960x540 before considering the milestone fully playtested.
