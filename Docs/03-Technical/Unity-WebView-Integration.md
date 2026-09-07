# Unity / WebView Integration

## 1. Goal

Run Night Courier as a fullscreen offline web application hosted by Unity while keeping the game independently runnable in a normal browser.

The integration boundary is intentionally narrow and transport-agnostic.

## 2. Host flow

```text
Unity player interacts with arcade/minigame entry
    -> pause/freeze main gameplay as appropriate
    -> open/load WebMinigameHost
    -> create fullscreen WebView
    -> load packaged Night Courier entry point
    -> web game emits READY
    -> Unity sends INIT context
    -> player completes or exits run
    -> web game emits GAME_COMPLETED / GAME_ABORTED
    -> Unity validates and persists result
    -> destroy WebView
    -> unload host scene / resume main gameplay
```

An additive host scene is preferred when the main Unity scene is expensive to reload. This is an integration recommendation, not a requirement for the web game.

## 3. Offline packaging

The production web build is static output, conceptually:

```text
dist/
├── index.html
└── assets/
    ├── *.js
    ├── *.css
    ├── images/
    └── audio/
```

Unity packages this output as local application content.

The host must not assume every platform exposes packaged content as a normal filesystem directory. The WebView adapter may serve or expose it through a platform-appropriate local/virtual URL.

The web build must not require CDN scripts, remote fonts, remote analytics or runtime network fetches.

## 4. Message envelope

All cross-boundary messages use a versioned JSON envelope:

```json
{
  "version": 1,
  "type": "READY",
  "requestId": "optional-id",
  "payload": {}
}
```

`version` is mandatory. `requestId` is optional unless a future request/response interaction requires correlation.

## 5. Unity -> web messages

Initial contract:

### `INIT`
Provides launch context after the web runtime is ready.

Example:

```json
{
  "version": 1,
  "type": "INIT",
  "payload": {
    "difficulty": 1,
    "highScore": 18400,
    "settings": {
      "musicVolume": 0.8,
      "sfxVolume": 1.0
    }
  }
}
```

Only fields actually consumed by the first version should be implemented.

### `PAUSE`
Pause simulation/audio.

### `RESUME`
Resume without applying accumulated background delta.

### `EXIT_REQUEST`
Request a clean exit. The web game may acknowledge through `GAME_ABORTED`.

## 6. Web -> Unity messages

### `READY`
The page, bridge and required runtime initialization are ready to receive `INIT`.

### `GAME_STARTED`
Optional telemetry/lifecycle marker. It must not be required for gameplay correctness.

### `GAME_COMPLETED`
Example:

```json
{
  "version": 1,
  "type": "GAME_COMPLETED",
  "payload": {
    "score": 18400,
    "elapsedTimeMs": 248321,
    "cargoHealth": 92,
    "rank": "A"
  }
}
```

### `GAME_ABORTED`
User exited before completion.

### `ERROR`
Reports controlled initialization/runtime failures that the host should surface or log.

## 7. Persistence rule

Unity is authoritative for persistent state.

The web game may keep temporary in-memory state for the current run. Browser storage can be used only as a development convenience and must not be required for production progression correctness.

The host must validate result ranges before persisting them. A WebView message is input, not trusted internal state.

## 8. Browser fallback

`HostBridge.ts` detects whether a Unity/native transport is available.

In standalone browser mode:
- `ready()` may log/no-op;
- initial context uses development defaults;
- completion result is shown/logged locally;
- restart works without Unity.

This enables the primary gameplay iteration loop to run under Vite without opening Unity.

## 9. Lifecycle requirements

The host must:
- create at most one Night Courier WebView instance at a time;
- forward application pause/resume where applicable;
- destroy the WebView when the minigame closes rather than merely hiding it;
- avoid retaining stale bridge callbacks between launches.

The web game must:
- tolerate `INIT` arriving after page load;
- ignore duplicate/invalid lifecycle messages safely;
- not advance simulation while paused;
- provide a controlled exit path after fatal initialization failure.

## 10. Security / robustness

- Treat inbound JSON as untrusted input.
- Validate `version`, `type` and required payload fields.
- Reject unsupported protocol versions cleanly.
- Do not expose arbitrary JavaScript evaluation as the domain integration API.
- Keep message types explicit rather than allowing generic method invocation.
- Do not load arbitrary remote URLs inside the minigame WebView.

## 11. Integration acceptance

Integration is considered complete when the packaged web build can be launched offline from Unity, receives initialization data, completes a run, returns a validated result, closes without leaking an active WebView, and can be launched a second time in the same Unity session with identical behavior.
