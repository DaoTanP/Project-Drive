# M1 Road / Player Slice

## Goal

Deliver the first playable Night Courier driving slice: a procedural pseudo-3D road that supports curves and hills, plus frame-rate-independent keyboard driving.

## Implementation boundaries

The milestone remains inside the existing architecture:

- `GameScene.ts` owns frame orchestration and the fixed-step accumulator;
- `Road.ts` owns authored road sections, runtime segments, projection and procedural road drawing;
- `Player.ts` owns arcade speed/lateral movement;
- `Input.ts` normalizes keyboard controls.

No additional runtime subsystem is introduced.

## Algorithmic baseline

Implementation follows the project-specific contracts in `Docs/03-Technical/Technical-Design.md` and uses `Docs/03-Technical/Pseudo-3D-Road-Research-Notes.md` only as reasoning support.

Key decisions:

- author sections compactly, then compile them to fixed-length projection segments;
- maintain gameplay in road/track space and derive screen coordinates;
- use accumulated lateral displacement for curves rather than full 3D rotation;
- use authored endpoint elevation for hills;
- reject road geometry hidden behind nearer hill crests;
- run gameplay at a bounded fixed 60 Hz simulation step inside Phaser's render loop;
- keep vehicle balance independent from road segment length.

## Validation rule

Typecheck/build/static-host validation is necessary but not sufficient for visual acceptance. A real-browser playtest remains required to judge curve continuity, hill readability and control feel.
