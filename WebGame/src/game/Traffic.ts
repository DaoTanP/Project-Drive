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

const TUNING: Record<TrafficType, TrafficTuning> = {
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

const PATTERN: readonly { type: TrafficType; roadX: number }[] = [
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
  private recyclePatternIndex = PATTERN.length;
  private recycleGapIndex = 0;
  private gapScale = 1;

  constructor() {
    this.cars = PATTERN.map((spawn, index) =>
      createCar(spawn.type, spawn.roadX, INITIAL_SPAWN_DISTANCE + index * INITIAL_SPACING),
    );
  }

  setGapScale(scale: number): void {
    this.gapScale = Number.isFinite(scale) ? clamp(scale, 0.65, 1.5) : 1;
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
      const tuning = TUNING[car.type];
      const lateral = Math.abs(playerRoadX - car.roadX);
      const swept = sweptAbsoluteMinimum(relativeBefore, relativeAfter);

      if (!car.passResolved) {
        if (swept <= COLLISION_LONGITUDINAL && lateral <= tuning.collisionLateral) {
          car.passResolved = true;
          result.collisions += 1;
          result.cargoDamage += tuning.cargoDamage;
          result.speedRetention = Math.min(result.speedRetention, tuning.speedRetention);
        } else {
          if (
            swept <= NEAR_MISS_LONGITUDINAL &&
            lateral > tuning.collisionLateral &&
            lateral <= tuning.collisionLateral + NEAR_MISS_LATERAL_MARGIN
          ) {
            car.nearMissArmed = true;
          }

          if (relativeBefore > 0 && relativeAfter <= 0) {
            if (car.nearMissArmed) result.nearMisses += 1;
            car.passResolved = true;
          }
        }
      }

      if (relativeAfter < -RECYCLE_BEHIND_DISTANCE) {
        spawnCursor += this.nextGap();
        this.recycle(car, spawnCursor);
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
      if (car.z < view.playerRouteDistance - RECYCLE_BEHIND_DISTANCE) continue;
      if (
        road.projectObject(view.roadPositionOffset + car.z, car.roadX, car.projection)
      ) {
        drawCar(graphics, car);
      }
    }
  }

  private nextGap(): number {
    const base = RECYCLE_GAPS[this.recycleGapIndex % RECYCLE_GAPS.length];
    this.recycleGapIndex += 1;
    return base * this.gapScale;
  }

  private recycle(car: TrafficCar, z: number): void {
    const spawn = PATTERN[this.recyclePatternIndex % PATTERN.length];
    this.recyclePatternIndex += 1;
    car.type = spawn.type;
    car.roadX = spawn.roadX;
    car.z = z;
    car.speed = TUNING[spawn.type].speed;
    car.nearMissArmed = false;
    car.passResolved = false;
  }
}

function createCar(type: TrafficType, roadX: number, z: number): TrafficCar {
  return {
    type,
    roadX,
    z,
    speed: TUNING[type].speed,
    nearMissArmed: false,
    passResolved: false,
    projection: { x: 0, y: 0, cameraZ: 0, pixelsPerWorld: 0, clipY: 0 },
  };
}

function drawCar(graphics: Phaser.GameObjects.Graphics, car: TrafficCar): void {
  const tuning = TUNING[car.type];
  const p = car.projection;
  const width = tuning.worldWidth * p.pixelsPerWorld;
  const height = tuning.worldHeight * p.pixelsPerWorld;
  if (width < 2 || height < 3) return;

  const left = p.x - width * 0.5;
  const top = p.y - height;
  const bottom = Math.min(p.y, p.clipY);
  const visibleHeight = bottom - top;
  if (visibleHeight <= 0) return;

  if (bottom > top + height * 0.72) {
    const shadowTop = top + height * 0.72;
    graphics.fillStyle(0x10131b, 0.9);
    graphics.fillRect(
      left - width * 0.04,
      shadowTop,
      width * 1.08,
      Math.min(height * 0.2, bottom - shadowTop),
    );
  }

  graphics.fillStyle(tuning.color, 1);
  graphics.fillRect(left, top, width, visibleHeight);

  const windowTop = top + height * 0.18;
  const windowBottom = Math.min(bottom, top + height * 0.48);
  if (windowBottom > windowTop) {
    graphics.fillStyle(tuning.windowColor, 1);
    graphics.fillRect(left + width * 0.18, windowTop, width * 0.64, windowBottom - windowTop);
  }

  if (bottom > top + height * 0.72) {
    graphics.fillStyle(0xe8d79a, 1);
    const lamp = Math.max(1, width * 0.08);
    graphics.fillRect(left + width * 0.12, bottom - lamp * 1.5, lamp, lamp);
    graphics.fillRect(left + width * 0.8, bottom - lamp * 1.5, lamp, lamp);
  }
}

function sweptAbsoluteMinimum(start: number, end: number): number {
  if (start === 0 || end === 0 || (start > 0 && end < 0) || (start < 0 && end > 0)) return 0;
  return Math.min(Math.abs(start), Math.abs(end));
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
