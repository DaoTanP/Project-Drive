import type Phaser from 'phaser';

import type { RouteBranch } from './GameState';

export type EnvironmentZone =
  | 'city'
  | 'rural'
  | 'forest'
  | 'mountain-pass'
  | 'tunnel';

type LandmarkId = 'route-choice' | 'tunnel-entry' | 'tunnel-exit' | 'destination';
type PropKind =
  | 'light'
  | 'rail'
  | 'pole'
  | 'tree'
  | 'rock'
  | 'chevron'
  | 'sign'
  | 'reflector';

export interface RoadSectionSpec {
  enter: number;
  hold: number;
  leave: number;
  curve: number;
  elevationDelta: number;
  zone: EnvironmentZone;
  landmarkAtStart?: LandmarkId;
}

interface ProjectedPoint {
  cameraZ: number;
  scale: number;
  x: number;
  y: number;
  halfWidth: number;
}

interface RoadPoint {
  worldY: number;
  worldZ: number;
  screen: ProjectedPoint;
}

interface RoadSegment {
  index: number;
  curve: number;
  zone: EnvironmentZone;
  landmark: LandmarkId | null;
  p1: RoadPoint;
  p2: RoadPoint;
  clipY: number;
  projectionFrame: number;
}

export interface RoadRenderView {
  playerPosition: number;
  playerRoadX: number;
  viewportWidth: number;
  viewportHeight: number;
}

export interface RoadObjectProjection {
  x: number;
  y: number;
  cameraZ: number;
  pixelsPerWorld: number;
  clipY: number;
}

interface ZoneStyle {
  groundA: number;
  groundB: number;
  rumbleA: number;
  rumbleB: number;
  spacing: number;
  propOffset: number;
  props: readonly PropKind[];
}

const SEGMENT_LENGTH = 200;
const DRAW_DISTANCE = 180;
const ROAD_HALF_WORLD_WIDTH = 1800;
const CAMERA_HEIGHT = 900;
const CAMERA_TRAILING_DISTANCE = 900;
const CAMERA_DEPTH = 1 / Math.tan(Math.PI / 4);
const NEAR_CLIP = 20;
const CURVE_WORLD_SCALE = 8;
const LANE_COUNT = 3;
const ROUTE_START_POSITION = 1200;
const BRANCH_PROMPT_LEAD_DISTANCE = 24000;

const NC = {
  n0: 0x080c18,
  n1: 0x0e1628,
  n2: 0x16223a,
  n3: 0x22334d,
  n4: 0x344a64,
  metal: 0x64748a,
  lightMetal: 0x9baabc,
  lane: 0xd5dce5,
  white: 0xf5f3ea,
  lamp: 0xf4c95d,
  amber: 0xff914d,
  red: 0xeb5548,
  cyan: 0x22d3ee,
  blue: 0x29a9e8,
  green: 0x55e06f,
  score: 0xffcc33,
} as const;

const ROAD_A = NC.n3;
const ROAD_B = NC.n2;

const ZONE_STYLE: Record<EnvironmentZone, ZoneStyle> = {
  city: {
    groundA: NC.n1,
    groundB: NC.n2,
    rumbleA: NC.red,
    rumbleB: NC.lamp,
    spacing: 10,
    propOffset: 1.35,
    props: ['light', 'sign', 'rail', 'light'],
  },
  rural: {
    groundA: NC.n1,
    groundB: NC.n2,
    rumbleA: NC.metal,
    rumbleB: NC.lightMetal,
    spacing: 16,
    propOffset: 1.55,
    props: ['pole', 'tree', 'rail', 'reflector'],
  },
  forest: {
    groundA: NC.n0,
    groundB: NC.n1,
    rumbleA: NC.n4,
    rumbleB: NC.lightMetal,
    spacing: 7,
    propOffset: 1.62,
    props: ['tree', 'tree', 'rail', 'reflector'],
  },
  'mountain-pass': {
    groundA: NC.n1,
    groundB: NC.n2,
    rumbleA: NC.score,
    rumbleB: NC.white,
    spacing: 9,
    propOffset: 1.42,
    props: ['rock', 'chevron', 'rail', 'tree'],
  },
  tunnel: {
    groundA: NC.n0,
    groundB: NC.n1,
    rumbleA: NC.n4,
    rumbleB: NC.lightMetal,
    spacing: 5,
    propOffset: 1.22,
    props: ['light', 'reflector', 'light'],
  },
};

// 1600 segments -> branch at roughly 100 s of clean max-speed driving.
const COMMON: readonly RoadSectionSpec[] = [
  s('city', 30, 240, 30, 0.05, 0),
  s('city', 35, 250, 35, 0.38, 160),
  s('city', 30, 220, 30, -0.32, -120),
  s('rural', 35, 230, 35, 0.16, 220),
  s('rural', 30, 220, 30, -0.2, -180),
  s('rural', 20, 80, 20, 0, 0, 'route-choice'),
];

// 1400 segments: short/risky branch.
const RISKY: readonly RoadSectionSpec[] = [
  s('mountain-pass', 35, 240, 35, 0.82, 620),
  s('mountain-pass', 30, 240, 30, -1.0, -420),
  s('mountain-pass', 25, 190, 25, 0.9, 360),
  s('tunnel', 20, 240, 20, 0.2, 60, 'tunnel-entry'),
  s('tunnel', 20, 229, 20, -0.24, -60),
  s('tunnel', 0, 1, 0, 0, 0, 'tunnel-exit'),
];

// 1700 segments: long/safer branch.
const SAFE: readonly RoadSectionSpec[] = [
  s('forest', 40, 320, 40, 0.3, 260),
  s('forest', 40, 340, 40, -0.34, -180),
  s('forest', 40, 300, 40, 0.24, 140),
  s('rural', 25, 200, 25, -0.16, -120),
  s('rural', 25, 200, 25, 0.14, 80),
];

// 900 playable segments, then destination + 400-segment render tail.
const FINAL: readonly RoadSectionSpec[] = [
  s('city', 30, 240, 30, -0.18, -120),
  s('city', 30, 240, 30, 0.26, 80),
  s('city', 30, 240, 30, 0, 0),
  s('city', 0, 1, 0, 0, 0, 'destination'),
  s('city', 30, 340, 30, 0, 0),
];

const COMMON_LENGTH = segmentCount(COMMON) * SEGMENT_LENGTH;

export class Road {
  private segments: RoadSegment[] = [];
  private totalLength = 0;
  private destinationPosition = 0;
  private activeBranch: RouteBranch = 'safe';
  private projectionFrame = 0;

  constructor() {
    this.rebuild('safe');
  }

  get trackLength(): number {
    return this.totalLength;
  }

  get startPosition(): number {
    return ROUTE_START_POSITION;
  }

  get branchPromptStartDistance(): number {
    return Math.max(0, this.branchDecisionDistance - BRANCH_PROMPT_LEAD_DISTANCE);
  }

  get branchDecisionDistance(): number {
    return COMMON_LENGTH - ROUTE_START_POSITION;
  }

  get destinationDistance(): number {
    return this.destinationPosition - ROUTE_START_POSITION;
  }

  get branch(): RouteBranch {
    return this.activeBranch;
  }

  selectBranch(branch: RouteBranch): void {
    if (branch !== this.activeBranch) {
      this.rebuild(branch);
    }
  }

  positionForRouteDistance(routeDistance: number): number {
    return ROUTE_START_POSITION + Math.max(0, routeDistance);
  }

  zoneAtRouteDistance(routeDistance: number): EnvironmentZone {
    return this.zoneAt(this.positionForRouteDistance(routeDistance));
  }

  wrapPosition(position: number): number {
    const wrapped = position % this.totalLength;
    return wrapped < 0 ? wrapped + this.totalLength : wrapped;
  }

  segmentIndexAt(position: number): number {
    return Math.floor(this.wrapPosition(position) / SEGMENT_LENGTH) % this.segments.length;
  }

  curveAt(position: number): number {
    return this.segments[this.segmentIndexAt(position)].curve;
  }

  elevationAt(position: number): number {
    const wrapped = this.wrapPosition(position);
    const segment = this.segments[this.segmentIndexAt(wrapped)];
    const local = (wrapped % SEGMENT_LENGTH) / SEGMENT_LENGTH;
    return lerp(segment.p1.worldY, segment.p2.worldY, local);
  }

  projectObject(
    position: number,
    roadX: number,
    output: RoadObjectProjection,
  ): boolean {
    const wrapped = this.wrapPosition(position);
    const segment = this.segments[this.segmentIndexAt(wrapped)];
    if (segment.projectionFrame !== this.projectionFrame) return false;

    return projectFromSegment(
      segment,
      (wrapped % SEGMENT_LENGTH) / SEGMENT_LENGTH,
      roadX,
      output,
    );
  }

  render(graphics: Phaser.GameObjects.Graphics, view: RoadRenderView): void {
    const width = view.viewportWidth;
    const height = view.viewportHeight;
    const playerZone = this.zoneAt(view.playerPosition);
    const cameraPosition = this.wrapPosition(view.playerPosition - CAMERA_TRAILING_DISTANCE);
    const cameraIndex = this.segmentIndexAt(cameraPosition);
    const cameraFraction = (cameraPosition % SEGMENT_LENGTH) / SEGMENT_LENGTH;
    const cameraY = this.elevationAt(view.playerPosition) + CAMERA_HEIGHT;
    const cameraRoadX = view.playerRoadX * ROAD_HALF_WORLD_WIDTH;
    let roadOffset = 0;
    let curveVelocity = -this.segments[cameraIndex].curve * CURVE_WORLD_SCALE * cameraFraction;
    let maxVisibleY = height;
    const visible: RoadSegment[] = [];

    this.projectionFrame += 1;
    graphics.clear();
    drawBackground(graphics, playerZone, width, height, view.playerPosition);

    for (let step = 0; step < DRAW_DISTANCE; step += 1) {
      const unwrappedIndex = cameraIndex + step;
      const segmentIndex = unwrappedIndex % this.segments.length;
      const lap = Math.floor(unwrappedIndex / this.segments.length);
      const segment = this.segments[segmentIndex];
      const zOffset = lap * this.totalLength;
      const nearRoadOffset = roadOffset;
      const farRoadOffset = roadOffset + curveVelocity;

      projectPoint(
        segment.p1,
        segment.p1.worldZ + zOffset,
        nearRoadOffset - cameraRoadX,
        cameraY,
        cameraPosition,
        width,
        height,
      );
      projectPoint(
        segment.p2,
        segment.p2.worldZ + zOffset,
        farRoadOffset - cameraRoadX,
        cameraY,
        cameraPosition,
        width,
        height,
      );

      segment.projectionFrame = this.projectionFrame;
      segment.clipY = maxVisibleY;
      roadOffset += curveVelocity;
      curveVelocity += segment.curve * CURVE_WORLD_SCALE;

      if (segment.p1.screen.cameraZ <= NEAR_CLIP || segment.p2.screen.cameraZ <= NEAR_CLIP) continue;
      if (segment.p2.screen.y >= segment.p1.screen.y || segment.p2.screen.y >= maxVisibleY) continue;

      drawRoadSegment(graphics, segment, width);
      visible.push(segment);
      maxVisibleY = segment.p1.screen.y;
    }

    drawTunnel(graphics, visible, width, height, playerZone === 'tunnel');
    drawRoadside(graphics, visible);
  }

  private zoneAt(position: number): EnvironmentZone {
    return this.segments[this.segmentIndexAt(position)].zone;
  }

  private rebuild(branch: RouteBranch): void {
    const route = [...COMMON, ...(branch === 'risky' ? RISKY : SAFE), ...FINAL];
    const segments = compileSections(route);
    const destination = segments.find((segment) => segment.landmark === 'destination');
    if (segments.length === 0 || destination === undefined) {
      throw new Error('Final route requires segments and a destination landmark.');
    }

    this.segments = segments;
    this.totalLength = segments.length * SEGMENT_LENGTH;
    this.destinationPosition = destination.p1.worldZ;
    this.activeBranch = branch;
    this.projectionFrame = 0;
  }
}

function s(
  zone: EnvironmentZone,
  enter: number,
  hold: number,
  leave: number,
  curve: number,
  elevationDelta: number,
  landmarkAtStart?: LandmarkId,
): RoadSectionSpec {
  return { zone, enter, hold, leave, curve, elevationDelta, landmarkAtStart };
}

function segmentCount(sections: readonly RoadSectionSpec[]): number {
  return sections.reduce(
    (sum, item) => sum + Math.max(0, Math.floor(item.enter + item.hold + item.leave)),
    0,
  );
}

function compileSections(sections: readonly RoadSectionSpec[]): RoadSegment[] {
  const segments: RoadSegment[] = [];
  let elevation = 0;

  for (const item of sections) {
    const enter = Math.max(0, Math.floor(item.enter));
    const hold = Math.max(0, Math.floor(item.hold));
    const leave = Math.max(0, Math.floor(item.leave));
    const total = enter + hold + leave;
    if (total <= 0) continue;

    const startElevation = elevation;
    const endElevation = elevation + item.elevationDelta;

    for (let localIndex = 0; localIndex < total; localIndex += 1) {
      const index = segments.length;
      const start = localIndex / total;
      const end = (localIndex + 1) / total;
      segments.push({
        index,
        curve: item.curve * curveEnvelope(localIndex, enter, hold, leave),
        zone: item.zone,
        landmark: localIndex === 0 ? item.landmarkAtStart ?? null : null,
        p1: createPoint(lerp(startElevation, endElevation, smoothStep(start)), index * SEGMENT_LENGTH),
        p2: createPoint(lerp(startElevation, endElevation, smoothStep(end)), (index + 1) * SEGMENT_LENGTH),
        clipY: Number.POSITIVE_INFINITY,
        projectionFrame: -1,
      });
    }

    elevation = endElevation;
  }

  return segments;
}

function curveEnvelope(index: number, enter: number, hold: number, leave: number): number {
  if (enter > 0 && index < enter) return smoothStep((index + 0.5) / enter);
  if (index < enter + hold) return 1;
  if (leave <= 0) return 0;
  return 1 - smoothStep((index - enter - hold + 0.5) / leave);
}

function createPoint(worldY: number, worldZ: number): RoadPoint {
  return {
    worldY,
    worldZ,
    screen: { cameraZ: 0, scale: 0, x: 0, y: 0, halfWidth: 0 },
  };
}

function projectPoint(
  point: RoadPoint,
  worldZ: number,
  roadCenterX: number,
  cameraY: number,
  cameraZ: number,
  width: number,
  height: number,
): void {
  const depth = worldZ - cameraZ;
  point.screen.cameraZ = depth;
  if (depth <= NEAR_CLIP) {
    point.screen.scale = 0;
    return;
  }

  const scale = CAMERA_DEPTH / depth;
  point.screen.scale = scale;
  point.screen.x = width * 0.5 + scale * roadCenterX * width * 0.5;
  point.screen.y = height * 0.5 - scale * (point.worldY - cameraY) * height * 0.5;
  point.screen.halfWidth = scale * ROAD_HALF_WORLD_WIDTH * width * 0.5;
}

function projectFromSegment(
  segment: RoadSegment,
  amount: number,
  roadX: number,
  out: RoadObjectProjection,
): boolean {
  const t = clamp(amount, 0, 1);
  const near = segment.p1.screen;
  const far = segment.p2.screen;
  const cameraZ = lerp(near.cameraZ, far.cameraZ, t);
  const halfWidth = lerp(near.halfWidth, far.halfWidth, t);
  const centerX = lerp(near.x, far.x, t);
  const y = lerp(near.y, far.y, t);

  if (cameraZ <= NEAR_CLIP || halfWidth <= 0 || !Number.isFinite(centerX) || !Number.isFinite(y)) {
    return false;
  }

  out.x = centerX + roadX * halfWidth;
  out.y = y;
  out.cameraZ = cameraZ;
  out.pixelsPerWorld = halfWidth / ROAD_HALF_WORLD_WIDTH;
  out.clipY = segment.clipY;
  return out.pixelsPerWorld > 0;
}

function drawBackground(
  graphics: Phaser.GameObjects.Graphics,
  zone: EnvironmentZone,
  width: number,
  height: number,
  position: number,
): void {
  const horizon = height * 0.54;
  graphics.fillStyle(NC.n0, 1);
  graphics.fillRect(0, 0, width, height);
  graphics.fillStyle(NC.n1, 1);
  graphics.fillRect(0, 0, width, horizon);

  if (zone === 'tunnel') return;

  if (zone === 'city') {
    const step = 54;
    const offset = -((position * 0.012) % step);
    for (let i = -1; i < width / step + 2; i += 1) {
      const x = offset + i * step;
      const hash = hash32(i + Math.floor(position / 12000), 17);
      const buildingHeight = 36 + (hash % 72);
      graphics.fillStyle(hash % 3 === 0 ? NC.n3 : NC.n2, 1);
      graphics.fillRect(x, horizon - buildingHeight, 38 + (hash % 12), buildingHeight);
      if (hash % 4 === 0) {
        graphics.fillStyle(NC.lamp, 0.5);
        graphics.fillRect(x + 9, horizon - buildingHeight + 13, 4, 3);
      }
    }
    return;
  }

  const amplitude = zone === 'mountain-pass' ? 62 : zone === 'forest' ? 42 : 28;
  const color = zone === 'mountain-pass' ? NC.n3 : NC.n2;
  graphics.fillStyle(color, 1);
  for (let x = -80; x < width + 80; x += 80) {
    const peak = horizon - 18 - ((Math.sin(x * 0.016 + position * 0.0005) + 1) * 0.5) * amplitude;
    graphics.fillTriangle(x, horizon, x + 40, peak, x + 80, horizon);
  }

  if (zone === 'forest') {
    graphics.fillStyle(NC.n1, 1);
    for (let x = -20; x < width + 20; x += 30) {
      graphics.fillTriangle(x, horizon, x + 15, horizon - 28 - ((x / 30) % 3) * 7, x + 30, horizon);
    }
  }
}

function drawRoadSegment(
  graphics: Phaser.GameObjects.Graphics,
  segment: RoadSegment,
  width: number,
): void {
  const near = segment.p1.screen;
  const far = segment.p2.screen;
  const style = ZONE_STYLE[segment.zone];
  const alternating = Math.floor(segment.index / 3) % 2 === 0;
  const ground = alternating ? style.groundA : style.groundB;
  const road = alternating ? ROAD_A : ROAD_B;
  const rumble = alternating ? style.rumbleA : style.rumbleB;

  if (near.y > far.y) {
    graphics.fillStyle(ground, 1);
    graphics.fillRect(0, far.y, width, near.y - far.y);
  }

  quad(graphics, rumble, near.x - near.halfWidth * 1.08, near.x + near.halfWidth * 1.08, near.y,
    far.x - far.halfWidth * 1.08, far.x + far.halfWidth * 1.08, far.y);
  quad(graphics, road, near.x - near.halfWidth, near.x + near.halfWidth, near.y,
    far.x - far.halfWidth, far.x + far.halfWidth, far.y);

  if (segment.index % 6 < 3) {
    for (let lane = 1; lane < LANE_COUNT; lane += 1) {
      const ratio = -1 + (2 * lane) / LANE_COUNT;
      const nearX = near.x + near.halfWidth * ratio;
      const farX = far.x + far.halfWidth * ratio;
      const nearHalf = Math.max(1, near.halfWidth * 0.008);
      const farHalf = Math.max(0.5, far.halfWidth * 0.008);
      quad(graphics, NC.lane, nearX - nearHalf, nearX + nearHalf, near.y,
        farX - farHalf, farX + farHalf, far.y);
    }
  }
}

function drawTunnel(
  graphics: Phaser.GameObjects.Graphics,
  visible: readonly RoadSegment[],
  width: number,
  height: number,
  inside: boolean,
): void {
  for (let i = visible.length - 1; i >= 0; i -= 1) {
    const segment = visible[i];
    if (segment.zone !== 'tunnel') continue;
    const near = segment.p1.screen;
    const far = segment.p2.screen;
    const color = Math.floor(segment.index / 4) % 2 === 0 ? NC.n2 : NC.n3;
    quad(graphics, color, near.x - near.halfWidth * 1.62, near.x - near.halfWidth * 1.08, near.y,
      far.x - far.halfWidth * 1.62, far.x - far.halfWidth * 1.08, far.y);
    quad(graphics, color, near.x + near.halfWidth * 1.08, near.x + near.halfWidth * 1.62, near.y,
      far.x + far.halfWidth * 1.08, far.x + far.halfWidth * 1.62, far.y);
  }

  if (inside) {
    graphics.fillStyle(NC.n0, 0.96);
    graphics.fillRect(0, 0, width, height * 0.14);
    graphics.fillStyle(NC.n2, 1);
    graphics.fillRect(0, height * 0.14, width, 8);
  }
}

function drawRoadside(
  graphics: Phaser.GameObjects.Graphics,
  visible: readonly RoadSegment[],
): void {
  const p: RoadObjectProjection = { x: 0, y: 0, cameraZ: 0, pixelsPerWorld: 0, clipY: 0 };

  for (let i = visible.length - 1; i >= 0; i -= 1) {
    const segment = visible[i];
    if (segment.landmark !== null && projectFromSegment(segment, 0.5, 0, p)) {
      drawLandmark(graphics, p, segment.landmark);
    }

    const style = ZONE_STYLE[segment.zone];
    const hash = hash32(segment.index, zoneSalt(segment.zone));
    if ((segment.index + (hash % style.spacing)) % style.spacing !== 0) continue;

    const kind = style.props[(hash >>> 4) % style.props.length];
    let side = hash % 2 === 0 ? -1 : 1;
    if (kind === 'chevron' && Math.abs(segment.curve) > 0.08) side = segment.curve > 0 ? 1 : -1;
    const variation = 0.88 + ((hash >>> 9) % 30) / 100;
    if (projectFromSegment(segment, 0.55, style.propOffset * variation * side, p)) {
      drawProp(graphics, p, kind, side, segment.zone);
    }
  }
}

function drawLandmark(
  graphics: Phaser.GameObjects.Graphics,
  p: RoadObjectProjection,
  landmark: LandmarkId,
): void {
  const s = p.pixelsPerWorld;
  const roadHalf = ROAD_HALF_WORLD_WIDTH * s;
  const bottom = Math.min(p.y, p.clipY);
  if (roadHalf < 4) return;

  if (landmark === 'route-choice') {
    const top = bottom - 1050 * s;
    graphics.fillStyle(NC.metal, 1);
    graphics.fillRect(p.x - roadHalf * 1.25, top, roadHalf * 2.5, Math.max(3, 45 * s));
    graphics.fillStyle(NC.score, 1);
    graphics.fillRect(p.x - roadHalf * 0.95, top + 80 * s, roadHalf * 0.78, 300 * s);
    graphics.fillStyle(NC.cyan, 1);
    graphics.fillRect(p.x + roadHalf * 0.17, top + 80 * s, roadHalf * 0.78, 300 * s);
    return;
  }

  if (landmark === 'destination') {
    const top = bottom - 1050 * s;
    graphics.fillStyle(NC.lamp, 1);
    graphics.fillRect(p.x - roadHalf * 1.15, top, roadHalf * 2.3, Math.max(5, 130 * s));
    graphics.fillStyle(NC.red, 1);
    graphics.fillRect(p.x - roadHalf * 0.6, top + 150 * s, roadHalf * 1.2, Math.max(4, 170 * s));
    return;
  }

  const top = bottom - 1450 * s;
  const sideWidth = Math.max(3, 250 * s);
  graphics.fillStyle(landmark === 'tunnel-entry' ? NC.n4 : NC.lightMetal, 1);
  graphics.fillRect(p.x - roadHalf * 1.4, top, sideWidth, bottom - top);
  graphics.fillRect(p.x + roadHalf * 1.4 - sideWidth, top, sideWidth, bottom - top);
  graphics.fillRect(p.x - roadHalf * 1.4, top, roadHalf * 2.8, Math.max(5, 240 * s));
  graphics.fillStyle(landmark === 'tunnel-entry' ? NC.score : NC.white, 1);
  graphics.fillRect(p.x - roadHalf * 0.65, top + 80 * s, roadHalf * 1.3, Math.max(2, 70 * s));
}

function drawProp(
  graphics: Phaser.GameObjects.Graphics,
  p: RoadObjectProjection,
  kind: PropKind,
  side: number,
  zone: EnvironmentZone,
): void {
  const s = p.pixelsPerWorld;
  const bottom = Math.min(p.y, p.clipY);
  if (s <= 0) return;

  const config: Record<PropKind, readonly [number, number, number]> = {
    light: [160, zone === 'tunnel' ? 520 : 1000, NC.lamp],
    rail: [850, 220, NC.lightMetal],
    pole: [80, 900, NC.n4],
    tree: [620, 1000, NC.n3],
    rock: [760, 620, NC.n4],
    chevron: [300, 460, NC.score],
    sign: [680, 720, NC.blue],
    reflector: [95, 160, NC.white],
  };
  const [worldWidth, worldHeight, color] = config[kind];
  const w = worldWidth * s;
  const h = worldHeight * s;
  if (w < 1.5 || h < 2) return;

  graphics.fillStyle(color, 1);
  if (kind === 'tree' || kind === 'rock') {
    graphics.fillTriangle(p.x - w * 0.5, bottom, p.x, bottom - h, p.x + w * 0.5, bottom);
    return;
  }

  if (kind === 'chevron') {
    graphics.fillRect(p.x - w * 0.5, bottom - h, w, h * 0.55);
    graphics.fillStyle(NC.n0, 1);
    const d = side < 0 ? -1 : 1;
    graphics.fillTriangle(p.x - d * w * 0.25, bottom - h * 0.72,
      p.x + d * w * 0.14, bottom - h * 0.88,
      p.x + d * w * 0.14, bottom - h * 0.56);
    return;
  }

  if (kind === 'light' || kind === 'pole') {
    graphics.fillRect(p.x - Math.max(1, w * 0.12), bottom - h, Math.max(2, w * 0.24), h);
    if (kind === 'light') graphics.fillRect(p.x - w * 0.5, bottom - h, w, Math.max(2, h * 0.08));
    return;
  }

  graphics.fillRect(p.x - w * 0.5, bottom - h, w, h);
}

function zoneSalt(zone: EnvironmentZone): number {
  return zone === 'city' ? 11 : zone === 'rural' ? 23 : zone === 'forest' ? 37 : zone === 'mountain-pass' ? 53 : 71;
}

function hash32(value: number, salt: number): number {
  let hash = (value * 374761393 + salt * 668265263) >>> 0;
  hash = (hash ^ (hash >>> 13)) >>> 0;
  hash = Math.imul(hash, 1274126177) >>> 0;
  return (hash ^ (hash >>> 16)) >>> 0;
}

function quad(
  graphics: Phaser.GameObjects.Graphics,
  color: number,
  nearLeft: number,
  nearRight: number,
  nearY: number,
  farLeft: number,
  farRight: number,
  farY: number,
): void {
  graphics.fillStyle(color, 1);
  graphics.fillTriangle(nearLeft, nearY, nearRight, nearY, farRight, farY);
  graphics.fillTriangle(nearLeft, nearY, farRight, farY, farLeft, farY);
}

function smoothStep(value: number): number {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}

function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}
