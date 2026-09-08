export type RunOutcome = 'completed' | 'timeout';
export type RouteBranch = 'risky' | 'safe';
export type ResultRank = 'S' | 'A' | 'B' | 'C' | 'D';

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
  drivingScore: number;
  timeBonus: number;
  cargoBonus: number;
  rank: ResultRank;
  branch: RouteBranch | null;
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
  drivingScore: 0,
  timeBonus: 0,
  cargoBonus: 0,
  rank: 'D',
  branch: null,
  cargoHealth: 100,
  nearMisses: 0,
  collisionCount: 0,
  bestCombo: 1,
};

export function createGameState(config: RunConfig): GameState {
  assertPositiveFinite(config.timeLimitSeconds, 'Run time limit');
  assertPositiveFinite(config.destinationDistance, 'Destination distance');

  return {
    elapsedSeconds: 0,
    timeRemaining: config.timeLimitSeconds,
    routeDistance: 0,
    destinationDistance: config.destinationDistance,
    finished: false,
    outcome: null,
  };
}

export function setDestinationDistance(state: GameState, destinationDistance: number): void {
  assertPositiveFinite(destinationDistance, 'Destination distance');
  if (state.finished) return;

  state.destinationDistance = destinationDistance;
  if (state.routeDistance >= state.destinationDistance) {
    state.routeDistance = state.destinationDistance;
    state.finished = true;
    state.outcome = 'completed';
  }
}

export function advanceGameState(
  state: GameState,
  dt: number,
  distanceDelta: number,
): void {
  if (state.finished) return;

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
    score: nonNegativeInt(performance.score),
    drivingScore: nonNegativeInt(performance.drivingScore),
    timeBonus: nonNegativeInt(performance.timeBonus),
    cargoBonus: nonNegativeInt(performance.cargoBonus),
    rank: performance.rank,
    branch: performance.branch,
    cargoHealth: clamp(performance.cargoHealth, 0, 100),
    nearMisses: nonNegativeInt(performance.nearMisses),
    collisionCount: nonNegativeInt(performance.collisionCount),
    bestCombo: Math.max(1, Math.floor(performance.bestCombo)),
  };
}

function assertPositiveFinite(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${label} must be a positive finite number.`);
  }
}

function nonNegativeInt(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

function clamp(value: number, minimum: number, maximum: number): number {
  if (!Number.isFinite(value)) return minimum;
  return Math.min(maximum, Math.max(minimum, value));
}
