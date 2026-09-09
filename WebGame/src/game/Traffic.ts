import type Phaser from 'phaser';

import type { Road, RoadObjectProjection } from './Road';

export type TrafficType = 'car' | 'van' | 'truck';

export const TRAFFIC_VISUAL_IDS = ['taxi', 'hatchback', 'van', 'truck'] as const;
export type TrafficVisualId = (typeof TRAFFIC_VISUAL_IDS)[number];

export const TRAFFIC_YAW_IDS = [
  'hard_left',
  'left',
  'center',
  'right',
  'hard_right',
] as const;
export type TrafficYawId = (typeof TRAFFIC_YAW_IDS)[number];
export type TrafficTextureKey = `traffic_${TrafficVisualId}_rear_${TrafficYawId}`;

export function trafficTextureKey(
  visual: TrafficVisualId,
  yaw: TrafficYawId,
): TrafficTextureKey {
  return `traffic_${visual}_rear_${yaw}`;
}

export const TRAFFIC_TEXTURE_KEYS = TRAFFIC_VISUAL_IDS.flatMap((visual) =>
  TRAFFIC_YAW_IDS.map((yaw) => trafficTextureKey(visual, yaw)),
) as readonly TrafficTextureKey[];

export const TRAFFIC_TEXTURE_PATHS = Object.fromEntries(
  TRAFFIC_TEXTURE_KEYS.map((key) => [key, `assets/traffic/${key}.png`]),
) as Record<TrafficTextureKey, string>;

export const TRAFFIC_SOURCE_SIZE = 256;
export const TRAFFIC_ANCHOR_X = 128;
export const TRAFFIC_ANCHOR_Y = 232;

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
  visual: TrafficVisualId;
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
  worldHeight: number;
}

type TrafficSpawn =
  | { type: 'car'; visual: 'taxi' | 'hatchback'; roadX: number }
  | { type: 'van'; visual: 'van'; roadX: number }
  | { type: 'truck'; visual: 'truck'; roadX: number };

const COLLISION_LONGITUDINAL = 260;
const NEAR_MISS_LONGITUDINAL = 560;
const NEAR_MISS_LATERAL_MARGIN = 0.3;
const RECYCLE_BEHIND_DISTANCE = 1200;
const INITIAL_SPAWN_DISTANCE = 4200;
const INITIAL_SPACING = 4200;
const RECYCLE_GAPS = [3600, 4400, 4000, 5000] as const;
const HEADING_SAMPLE_DISTANCE = 600;
const MODERATE_YAW_SLOPE = 0.07;
const HARD_YAW_SLOPE = 0.22;

const TUNING: Record<TrafficType, TrafficTuning> = {
  car: {
    speed: 1120,
    collisionLateral: 0.28,
    cargoDamage: 7,
    speedRetention: 0.68,
    worldHeight: 590,
  },
  van: {
    speed: 900,
    collisionLateral: 0.31,
    cargoDamage: 11,
    speedRetention: 0.58,
    worldHeight: 720,
  },
  truck: {
    speed: 720,
    collisionLateral: 0.34,
    cargoDamage: 16,
    speedRetention: 0.48,
    worldHeight: 800,
  },
};

const PATTERN: readonly TrafficSpawn[] = [
  { type: 'car', visual: 'taxi', roadX: -0.52 },
  { type: 'van', visual: 'van', roadX: 0.12 },
  { type: 'truck', visual: 'truck', roadX: 0.64 },
  { type: 'car', visual: 'hatchback', roadX: 0.48 },
  { type: 'car', visual: 'taxi', roadX: -0.08 },
  { type: 'van', visual: 'van', roadX: -0.62 },
  { type: 'truck', visual: 'truck', roadX: 0.06 },
  { type: 'car', visual: 'hatchback', roadX: 0.7 },
  { type: 'van', visual: 'van', roadX: 0.42 },
  { type: 'car', visual: 'taxi', roadX: -0.72 },
  { type: 'truck', visual: 'truck', roadX: -0.36 },
  { type: 'car', visual: 'hatchback', roadX: 0.24 },
];

export class Traffic {
  private readonly cars: TrafficCar[];
  private readonly stepResult: TrafficStepResult = {
    collisions: 0,
    cargoDamage: 0,
    speedRetention: 1,
    nearMisses: 0,
  };
  private readonly headingNear: RoadObjectProjection = createProjection();
  private readonly headingFar: RoadObjectProjection = createProjection();
  private recyclePatternIndex = PATTERN.length;
  private recycleGapIndex = 0;
  private gapScale = 1;

  constructor() {
    this.cars = PATTERN.map((spawn, index) =>
      createCar(spawn, INITIAL_SPAWN_DISTANCE + index * INITIAL_SPACING),
    );
  }

  get renderPoolSize(): number {
    return this.cars.length;
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
    images: readonly Phaser.GameObjects.Image[],
    road: Road,
    view: TrafficRenderView,
  ): void {
    this.cars.sort((left, right) => right.z - left.z);
    let imageIndex = 0;

    for (const car of this.cars) {
      if (imageIndex >= images.length) break;
      if (car.z < view.playerRouteDistance - RECYCLE_BEHIND_DISTANCE) continue;

      const roadPosition = view.roadPositionOffset + car.z;
      if (!road.projectObject(roadPosition, car.roadX, car.projection)) continue;

      const image = images[imageIndex];
      const yaw = this.yawForRoadTangent(road, roadPosition);
      if (renderCarSprite(image, car, yaw)) {
        imageIndex += 1;
      }
    }

    for (; imageIndex < images.length; imageIndex += 1) {
      images[imageIndex].setVisible(false);
    }
  }

  private yawForRoadTangent(road: Road, roadPosition: number): TrafficYawId {
    if (
      !road.projectObject(roadPosition, 0, this.headingNear) ||
      !road.projectObject(roadPosition + HEADING_SAMPLE_DISTANCE, 0, this.headingFar)
    ) {
      return 'center';
    }

    const verticalTravel = this.headingNear.y - this.headingFar.y;
    if (verticalTravel <= 1) return 'center';

    const slope = (this.headingFar.x - this.headingNear.x) / verticalTravel;
    if (slope <= -HARD_YAW_SLOPE) return 'hard_left';
    if (slope <= -MODERATE_YAW_SLOPE) return 'left';
    if (slope < MODERATE_YAW_SLOPE) return 'center';
    if (slope < HARD_YAW_SLOPE) return 'right';
    return 'hard_right';
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
    car.visual = spawn.visual;
    car.roadX = spawn.roadX;
    car.z = z;
    car.speed = TUNING[spawn.type].speed;
    car.nearMissArmed = false;
    car.passResolved = false;
  }
}

function createCar(spawn: TrafficSpawn, z: number): TrafficCar {
  return {
    type: spawn.type,
    visual: spawn.visual,
    roadX: spawn.roadX,
    z,
    speed: TUNING[spawn.type].speed,
    nearMissArmed: false,
    passResolved: false,
    projection: createProjection(),
  };
}

function createProjection(): RoadObjectProjection {
  return { x: 0, y: 0, cameraZ: 0, pixelsPerWorld: 0, clipY: 0 };
}

function renderCarSprite(
  image: Phaser.GameObjects.Image,
  car: TrafficCar,
  yaw: TrafficYawId,
): boolean {
  const tuning = TUNING[car.type];
  const p = car.projection;
  const projectedHeight = tuning.worldHeight * p.pixelsPerWorld;
  if (projectedHeight < 3) {
    image.setVisible(false);
    return false;
  }

  const scale = projectedHeight / TRAFFIC_ANCHOR_Y;
  if (!Number.isFinite(scale) || scale <= 0) {
    image.setVisible(false);
    return false;
  }

  const top = p.y - projectedHeight;
  const clipY = Math.min(p.y, p.clipY);
  if (clipY <= top) {
    image.setVisible(false);
    return false;
  }

  const cropHeight = clamp(
    TRAFFIC_ANCHOR_Y + (clipY - p.y) / scale,
    0,
    TRAFFIC_SOURCE_SIZE,
  );
  if (cropHeight <= 0) {
    image.setVisible(false);
    return false;
  }

  image
    .setTexture(trafficTextureKey(car.visual, yaw))
    .setOrigin(TRAFFIC_ANCHOR_X / TRAFFIC_SOURCE_SIZE, TRAFFIC_ANCHOR_Y / TRAFFIC_SOURCE_SIZE)
    .setPosition(p.x, p.y)
    .setScale(scale)
    .setCrop(0, 0, TRAFFIC_SOURCE_SIZE, cropHeight)
    .setVisible(true);

  return true;
}

function sweptAbsoluteMinimum(start: number, end: number): number {
  if (start === 0 || end === 0 || (start > 0 && end < 0) || (start < 0 && end > 0)) return 0;
  return Math.min(Math.abs(start), Math.abs(end));
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
