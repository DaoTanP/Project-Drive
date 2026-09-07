# Project Drive

`Project-Drive` hosts the design and implementation documentation for **Night Courier**, a small pseudo-3D arcade racing minigame intended to run as an offline fullscreen web game inside a Unity host.

## Documentation

Start at [`Docs/README.md`](Docs/README.md).

## Baseline

- Game: **Night Courier**
- Genre: pseudo-3D arcade racer / delivery run
- Session target: 4–5 minutes
- Web stack: Phaser 4 + TypeScript + Vite
- Runtime: standalone browser during development; offline fullscreen WebView when hosted by Unity
- Integration: versioned JSON bridge
- Persistence: Unity is authoritative
- Architecture target: 12 TypeScript source files for the initial implementation

The project intentionally prioritizes a small, shippable minigame over framework generality or premature extensibility.
