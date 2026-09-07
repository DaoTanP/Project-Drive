# Development Workflow

## 1. Primary development loop

Gameplay development happens outside Unity whenever possible:

```text
edit TypeScript/assets
    -> Vite dev server
    -> browser playtest
    -> typecheck/lint/test
    -> iterate
```

Unity integration is a packaging/host validation step, not the normal inner loop.

## 2. Repository layout target

When implementation begins, prefer:

```text
Project-Drive/
├── Docs/
├── WebGame/
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── index.html
│   ├── src/
│   ├── public/
│   │   └── assets/
│   └── tests/          # only when tests add value
└── README.md
```

If Unity integration code later lives in this repository, place it under a clearly separate host/integration directory rather than mixing C# into the web-game source tree.

## 3. Bootstrap workflow

1. Initialize Vite + TypeScript project.
2. Add Phaser.
3. Commit lockfile.
4. Establish `dev`, `build`, `typecheck` and test commands.
5. Create the 12-file source skeleton only as files become needed; do not generate empty architecture layers for appearance.
6. Verify a production `dist/` build opens correctly in a local static host before Unity integration.

## 4. Feature implementation rule

Implement vertical slices rather than subsystem-complete layers.

Preferred sequence:

```text
road visible
 -> player moves
 -> playable short strip
 -> traffic + collision
 -> timer + fail/finish
 -> scoring/near miss
 -> full route + branch
 -> content/audio/polish
 -> Unity bridge
```

At every stage there should be a runnable build.

## 5. AI-assisted development workflow

For each task:

1. Read the relevant docs and current source before editing.
2. State the exact behavioral change and affected files.
3. Prefer modifying existing boundaries over adding abstractions.
4. Run typecheck/build/tests available for the changed code.
5. Playtest behavior that cannot be established by automated checks.
6. Record deviations from frozen decisions only when evidence requires them.

Do not accept generated code solely because it compiles. Verify gameplay state transitions and failure paths.

## 6. Branching

For meaningful implementation increments:

- branch from current `main`;
- keep each branch focused on one milestone or coherent vertical slice;
- validate locally;
- squash merge after acceptance when practical.

Documentation-only bootstrap may be committed directly when repository policy permits.

## 7. Commit discipline

Prefer commits that describe behavior or contract changes, for example:

- `feat: add pseudo-3d road projection`
- `feat: add traffic collision and near-miss scoring`
- `feat: add unity host bridge`
- `fix: clamp resume frame delta`
- `docs: freeze initial night courier scope`

Avoid mixing unrelated refactors with gameplay changes.

## 8. Asset workflow

The authoritative asset list is [`../01-Design/Asset-Inventory-and-Sprite-Requirements.md`](../01-Design/Asset-Inventory-and-Sprite-Requirements.md). Palette/value rules are in [`../01-Design/Art-Direction-and-Color-Palette.md`](../01-Design/Art-Direction-and-Color-Palette.md).

### Runtime structure

Export only build-ready files into:

```text
WebGame/public/assets/
├── player/
├── traffic/
├── props/
├── backgrounds/
├── fx/
├── ui/
├── fonts/
└── audio/
```

Source PSD/Aseprite/working files should stay outside runtime directories.

### Production sequence

1. Use geometric/placeholders until road projection, player control and traffic projection are stable.
2. Lock palette, silhouette, pivot and apparent pixel-density rules before final asset production.
3. Produce **Batch A** first: five player steering poses, at least three traffic visuals, far skyline and mid skyline.
4. Replace placeholders and validate readability at gameplay speed before producing the full prop set.
5. Produce **Batch B**: the reusable 12–15 prop/environment set plus any near parallax strips needed for the route.
6. Produce **Batch C** only after composition is stable: VFX particles, HUD icons, optional brake frames and low-cost visual variants.
7. Add audio after the gameplay events that trigger it are stable enough to tune.
8. Validate all final runtime files with network disabled before Unity packaging.

### Asset production rules

- do not create a sprite for geometry/text that is cheaper and clearer to render procedurally;
- do not add new gameplay behavior because concept art contains an extra vehicle/object;
- use runtime horizontal flip for directional props where valid;
- preserve predictable bottom-center pivots for road-grounded sprites;
- keep transparent bounds/padding consistent between variants;
- use nearest-neighbor-compatible pixel exports without unintended anti-aliasing;
- avoid remote runtime fonts, music, scripts or image dependencies;
- verify commercial-use licensing for fonts/audio/external source material before integration;
- do not introduce an atlas pipeline while assets are still changing heavily.

### Review checkpoint

Before producing an asset outside the documented inventory, ask:

1. Is it required by a current gameplay or presentation task?
2. Can an existing sprite be reused, flipped, tinted or recomposed?
3. Can the effect be rendered procedurally?
4. Does it push the initial visual budget materially beyond 34–49 unique images?

If the answer is primarily visual variety or hypothetical future content, defer it.

## 9. Build workflow

Development:

```text
npm run dev
```

Validation:

```text
npm run typecheck
npm run test     # once tests exist
npm run build
```

Production output:

```text
WebGame/dist/
```

The Unity packaging step copies/embeds only built runtime output, not `node_modules`, TypeScript source or source-art files.

## 10. Unity integration workflow

Do not begin native/WebView integration before a browser production build can complete a representative run.

Integration order:

1. open static `dist/` fullscreen in WebView;
2. verify offline asset loading;
3. implement `READY` / `INIT` handshake;
4. implement completion/abort messages;
5. implement pause/resume;
6. validate destruction and relaunch;
7. validate persistent high-score round trip.

## 11. Definition of done for a task

A task is done only when:

- behavior matches the relevant design/technical contract;
- TypeScript compiles without new errors;
- production build succeeds;
- required automated checks pass;
- affected gameplay has been manually exercised;
- new runtime assets meet documented palette/readability/pivot requirements;
- no known critical regression is introduced;
- docs are updated if a contract changed.

## 12. Scope-control checkpoint

Before adding a new file, dependency, manager, generalized interface, content pipeline or asset category, ask:

1. What current problem requires it?
2. Can the current 12-file boundary express the feature cleanly?
3. Is the complexity demonstrated by implementation or only predicted?
4. Does it directly improve shipping the initial minigame?

If the answer is primarily future flexibility, defer it.
