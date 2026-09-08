import type Phaser from 'phaser';

import type { Road, RoadObjectProjection } from './Road';

export type TrafficType = 'car' | 'van' | 'truck';

export interface TrafficStepResult {
  collisions: number;
  cargoDamage: number;
  speedRetention: number;
  nearMisses: number;
}

export interface TrafficRenderView {
  roadPositionOffset: number;
  playerRouteDistance: number;
}

interface TrafficCar {
  type: TrafficType;
  roadX: number;
  z: number;
  speed: number;
  nearMissArmed: boolean;
  passResolved: boolean;
  projection: RoadObjectProjection;
}

interface TrafficTuning {
  speed: number;
  collisionLateral: number;
  cargoDamage: number;
  speedRetention: number;
  worldWidth: number;
  worldHeight: number;
  color: number;
  windowColor: number;
}

const COLLISION_LONGITUDINAL = 260;
const NEAR_MISS_LONGITUDINAL = 560;
const NEAR_MISS_LATERAL_MARGIN = 0.3;
const RECYCLE_BEHIND_DISTANCE = 1200;
const INITIAL_SPAWN_DISTANCE = 4200;
const INITIAL_SPACING = 4200;
const RECYCLE_GAPS = [3600, 4400, 4000, 5000] as const;

const TRAFFIC_TUNING: Record<TrafficType, TrafficTuning> = {
  car: {
    speed: 1120,
    collisionLateral: 0.28,
    cargoDamage: 7,
    speedRetention: 0.68,
    worldWidth: 420,
    worldHeight: 590,
    color: 0x4f9da6,
    windowColor: 0xbad8dc,
  },
  van: {
    speed: 900,
    collisionLateral: 0.31,
    cargoDamage: 11,
    speedRetention: 0.58,
    worldWidth: 500,
    worldHeight: 720,
    color: 0xd7a652,
    windowColor: 0xe8d8ad,
  },
  truck: {
    speed: 720,
    collisionLateral: 0.34,
    cargoDamage: 16,
    speedRetention: 0.48,
    worldWidth: 560,
    worldHeight: 800,
    color: 0xc6626a,
    windowColor: 0xe4a4aa,
  },
};

const SPAWN_PATTERN: readonly { type: TrafficType; roadX: number }[] = [
  { type: 'car', roadX: -0.52 },
  { type: 'van', roadX: 0.12 },
  { type: 'truck', roadX: 0.64 },
  { type: 'car', roadX: 0.48 },
  { type: 'car', roadX: -0.08 },
  { type: 'van', roadX: -0.62 },
  { type: 'truck', roadX: 0.06 },
  { type: 'car', roadX: 0.7 },
  { type: 'van', roadX: 0.42 },
  { type: 'car', roadX: -0.72 },
  { type: 'truck', roadX: -0.36 },
  { type: 'car', roadX: 0.24 },
];

export class Traffic {
  private readonly cars: TrafficCar[];
  private readonly stepResult: TrafficStepResult = {
    collisions: 0,
    cargoDamage: 0,
    speedRetention: 1,
    nearMisses: 0,
  };
  private recyclePatternIndex = SPAWN_PATTERN.length;
  private recycleGapIndex = 0;

  constructor() {
    this.cars = SPAWN_PATTERN.map((spawn, index) =>
      createTrafficCar(
        spawn.type,
        spawn.roadX,
        INITIAL_SPAWN_DISTANCE + index * INITIAL_SPACING,
      ),
    );
  }

  update(
    dt: number,
    playerPreviousDistance: number,
    playerCurrentDistance: number,
    playerRoadX: number,
  ): TrafficStepResult {
    const safeDt = Number.isFinite(dt) ? Math.max(0, dt) : 0;
    const result = this.stepResult;

    result.collisions = 0;
    result.cargoDamage = 0;
    result.speedRetention = 1;
    result.nearMisses = 0;

    let spawnCursor = this.cars.reduce((furthest, car) => Math.max(furthest, car.z), 0);

    for (const car of this.cars) {
      const previousZ = car.z;
      car.z += car.speed * safeDt;

      const relativeBefore = previousZ - playerPreviousDistance;
      const relativeAfter = car.z - playerCurrentDistance;
      const lateralDistance = Math.abs(playerRoadX - car.roadX);
      const tuning = TRAFFIC_TUNING[car.type];
      const sweptDistance = sweptAbsoluteMinimum(relativeBefore, relativeAfter);

      if (!car.passResolved) {
        if (
          sweptDistance <= COLLISION_LONGITUDINAL &&
          lateralDistance <= tuning.collisionLateral
        ) {
          car.passResolved = true;
          result.collisions += 1;
          result.cargoDamage += tuning.cargoDamage;
          result.speedRetention = Math.min(result.speedRetention, tuning.speedRetention);
        } else {
          const nearMissLateral = tuning.collisionLateral + NEAR_MISS_LATERAL_MARGIN;

          if (
            sweptDistance <= NEAR_MISS_LONGITUDINAL &&
            lateralDistance > tuning.collisionLateral &&
            lateralDistance <= nearMissLateral
          ) {
            car.nearMissArmed = true;
          }

          if (relativeBefore > 0 && relativeAfter <= 0) {
            if (car.nearMissArmed) {
              result.nearMisses += 1;
            }

            car.passResolved = true;
          }
        }
      }

      if (relativeAfter < -RECYCLE_BEHIND_DISTANCE) {
        spawnCursor += this.nextRecycleGap();
        this.recycleCar(car, spawnCursor);
      }
    }

    return result;
  }

  render(
    graphics: Phaser.GameObjects.Graphics,
    road: Road,
    view: TrafficRenderView,
  ): void {
    graphics.clear();

    this.cars.sort((left, right) => right.z - left.z);

    for (const car of this.cars) {
      if (car.z < view.playerRouteDistance - RECYCLE_BEHIND_DISTANCE) {
        continue;
      }

      const projected = road.projectObject(
        view.roadPositionOffset + car.z,
        car.roadX,
        car.projection,
      );

      if (!projected) {
        continue;
      }

      drawTrafficPlaceholder(graphics, car);
    }
  }

  private nextRecycleGap(): number {
    const gap = RECYCLE_GAPS[this.recycleGapIndex % RECYCLE_GAPS.length];
    this.recycleGapIndex += 1;
    return gap;
  }

  private recycleCar(car: TrafficCar, z: number): void {
    const spawn = SPAWN_PATTERN[this.recyclePatternIndex % SPAWN_PATTERN.length];
    const tuning = TRAFFIC_TUNING[spawn.type];

    this.recyclePatternIndex += 1;
    car.type = spawn.type;
    car.roadX = spawn.roadX;
    car.z = z;
    car.speed = tuning.speed;
    car.nearMissArmed = false;
    car.passResolved = false;
  }
}

function createTrafficCar(type: TrafficType, roadX: number, z: number): TrafficCar {
  return {
    type,
    roadX,
    z,
    speed: TRAFFIC_TUNING[type].speed,
    nearMissArmed: false,
    passResolved: false,
    projection: {
      x: 0,
      y: 0,
      cameraZ: 0,
      pixelsPerWorld: 0,
      clipY: 0,
    },
  };
}

function sweptAbsoluteMinimum(start: number, end: number): number {
  if (start === 0 || end === 0 || (start > 0 && end < 0) || (start < 0 && end > 0)) {
    return 0;
  }

  return Math.min(Math.abs(start), Math.abs(end));
}

function drawTrafficPlaceholder(
  graphics: Phaser.GameObjects.Graphics,
  car: TrafficCar,
): void {
  const tuning = TRAFFIC_TUNING[car.type];
  const projection = car.projection;
  const width = tuning.worldWidth * projection.pixelsPerWorld;
  const height = tuning.worldHeight * projection.pixelsPerWorld;

  if (width < 2 || height < 3) {
    return;
  }

  const left = projection.x - width * 0.5;
  const top = projection.y - height;
  const clippedBottom = Math.min(projection.y, projection.clipY);
  const visibleHeight = clippedBottom - top;

  if (visibleHeight <= 0) {
    return;
  }

  const shadowTop = top + height * 0.72;
  const shadowBottom = Math.min(clippedBottom, shadowTop + height * 0.2);

  if (shadowBottom > shadowTop) {
    graphics.fillStyle(0x10131b, 0.9);
    graphics.fillRect(
      left - width * 0.04,
      shadowTop,
      width * 1.08,
      shadowBottom - shadowTop,
    );
  }

  graphics.fillStyle(tuning.color, 1);
  graphics.fillRect(left, top, width, visibleHeight);

  const windowTop = top + height * 0.18;
  const windowBottom = Math.min(clippedBottom, top + height * 0.48);

  if (windowBottom > windowTop) {
    graphics.fillStyle(tuning.windowColor, 1);
    graphics.fillRect(
      left + width * 0.18,
      windowTop,
      width * 0.64,
      windowBottom - windowTop,
    );
  }

  if (clippedBottom > top + height * 0.72) {
    graphics.fillStyle(0xe8d79a, 1);
    const lampSize = Math.max(1, width * 0.08);
    graphics.fillRect(left + width * 0.12, clippedBottom - lampSize * 1.5, lampSize, lampSize);
    graphics.fillRect(
      left + width * 0.8,
      clippedBottom - lampSize * 1.5,
      lampSize,
      lampSize,
    );
  }
}
