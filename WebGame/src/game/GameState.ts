export type RunOutcome = 'completed' | 'timeout';

export interface RunConfig {
  timeLimitSeconds: number;
  destinationDistance: number;
}

export interface GameState {
  elapsedSeconds: number;
  timeRemaining: number;
  routeDistance: number;
  destinationDistance: number;
  finished: boolean;
  outcome: RunOutcome | null;
}

export interface RunPerformance {
  score: number;
  cargoHealth: number;
  nearMisses: number;
  collisionCount: number;
  bestCombo: number;
}

export interface RunResult extends RunPerformance {
  outcome: RunOutcome;
  elapsedSeconds: number;
  timeRemaining: number;
  routeDistance: number;
  destinationDistance: number;
}

const EMPTY_PERFORMANCE: RunPerformance = {
  score: 0,
  cargoHealth: 100,
  nearMisses: 0,
  collisionCount: 0,
  bestCombo: 1,
};

export function createGameState(config: RunConfig): GameState {
  if (!Number.isFinite(config.timeLimitSeconds) || config.timeLimitSeconds <= 0) {
    throw new Error('Run time limit must be a positive finite number.');
  }

  if (!Number.isFinite(config.destinationDistance) || config.destinationDistance <= 0) {
    throw new Error('Destination distance must be a positive finite number.');
  }

  return {
    elapsedSeconds: 0,
    timeRemaining: config.timeLimitSeconds,
    routeDistance: 0,
    destinationDistance: config.destinationDistance,
    finished: false,
    outcome: null,
  };
}

export function advanceGameState(
  state: GameState,
  dt: number,
  distanceDelta: number,
): void {
  if (state.finished) {
    return;
  }

  const safeDt = Number.isFinite(dt) ? Math.max(0, dt) : 0;
  const safeDistance = Number.isFinite(distanceDelta) ? Math.max(0, distanceDelta) : 0;

  state.elapsedSeconds += safeDt;
  state.timeRemaining = Math.max(0, state.timeRemaining - safeDt);
  state.routeDistance = Math.min(
    state.destinationDistance,
    state.routeDistance + safeDistance,
  );

  if (state.routeDistance >= state.destinationDistance) {
    state.finished = true;
    state.outcome = 'completed';
    return;
  }

  if (state.timeRemaining <= 0) {
    state.finished = true;
    state.outcome = 'timeout';
  }
}

export function createRunResult(
  state: GameState,
  performance: RunPerformance = EMPTY_PERFORMANCE,
): RunResult {
  if (!state.finished || state.outcome === null) {
    throw new Error('Cannot create a run result before the run has finished.');
  }

  return {
    outcome: state.outcome,
    elapsedSeconds: state.elapsedSeconds,
    timeRemaining: state.timeRemaining,
    routeDistance: state.routeDistance,
    destinationDistance: state.destinationDistance,
    score: Math.max(0, Math.floor(performance.score)),
    cargoHealth: clamp(performance.cargoHealth, 0, 100),
    nearMisses: Math.max(0, Math.floor(performance.nearMisses)),
    collisionCount: Math.max(0, Math.floor(performance.collisionCount)),
    bestCombo: Math.max(1, Math.floor(performance.bestCombo)),
  };
}

function clamp(value: number, minimum: number, maximum: number): number {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.min(maximum, Math.max(minimum, value));
}
