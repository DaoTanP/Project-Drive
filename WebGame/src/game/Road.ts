import Phaser from 'phaser';

export interface RoadSectionSpec {
  enter: number;
  hold: number;
  leave: number;
  curve: number;
  elevationDelta: number;
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

const SEGMENT_LENGTH = 200;
const DRAW_DISTANCE = 180;
const ROAD_HALF_WORLD_WIDTH = 1800;
const CAMERA_HEIGHT = 900;
const CAMERA_TRAILING_DISTANCE = 900;
const CAMERA_DEPTH = 1 / Math.tan(Math.PI / 4);
const NEAR_CLIP = 20;
const CURVE_WORLD_SCALE = 8;
const LANE_COUNT = 3;

const COLORS = {
  grassA: 0x101827,
  grassB: 0x131d2d,
  roadA: 0x292d3a,
  roadB: 0x252936,
  rumbleA: 0xc15c68,
  rumbleB: 0xe8d79a,
  lane: 0xe6dfc0,
};

const DEMO_SECTIONS: readonly RoadSectionSpec[] = [
  { enter: 15, hold: 45, leave: 15, curve: 0, elevationDelta: 0 },
  { enter: 20, hold: 50, leave: 20, curve: 0.75, elevationDelta: 300 },
  { enter: 15, hold: 40, leave: 15, curve: 0, elevationDelta: 450 },
  { enter: 20, hold: 55, leave: 20, curve: -1.0, elevationDelta: -250 },
  { enter: 15, hold: 35, leave: 15, curve: 0.8, elevationDelta: -400 },
  { enter: 15, hold: 35, leave: 15, curve: -0.65, elevationDelta: 0 },
  { enter: 15, hold: 50, leave: 15, curve: 0, elevationDelta: -100 },
];

export class Road {
  private readonly segments: RoadSegment[];
  private readonly totalLength: number;
  private projectionFrame = 0;

  constructor(sections: readonly RoadSectionSpec[] = DEMO_SECTIONS) {
    this.segments = compileSections(sections);

    if (this.segments.length === 0) {
      throw new Error('Road requires at least one runtime segment.');
    }

    this.totalLength = this.segments.length * SEGMENT_LENGTH;
  }

  get trackLength(): number {
    return this.totalLength;
  }

  wrapPosition(position: number): number {
    const wrapped = position % this.totalLength;
    return wrapped < 0 ? wrapped + this.totalLength : wrapped;
  }

  segmentIndexAt(position: number): number {
    const wrapped = this.wrapPosition(position);
    return Math.floor(wrapped / SEGMENT_LENGTH) % this.segments.length;
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

    if (segment.projectionFrame !== this.projectionFrame) {
      return false;
    }

    const local = (wrapped % SEGMENT_LENGTH) / SEGMENT_LENGTH;
    const near = segment.p1.screen;
    const far = segment.p2.screen;
    const cameraZ = lerp(near.cameraZ, far.cameraZ, local);
    const halfWidth = lerp(near.halfWidth, far.halfWidth, local);
    const centerX = lerp(near.x, far.x, local);
    const y = lerp(near.y, far.y, local);

    if (
      cameraZ <= NEAR_CLIP ||
      halfWidth <= 0 ||
      !Number.isFinite(centerX) ||
      !Number.isFinite(y)
    ) {
      return false;
    }

    output.x = centerX + roadX * halfWidth;
    output.y = y;
    output.cameraZ = cameraZ;
    output.pixelsPerWorld = halfWidth / ROAD_HALF_WORLD_WIDTH;
    output.clipY = segment.clipY;

    return output.pixelsPerWorld > 0;
  }

  render(graphics: Phaser.GameObjects.Graphics, view: RoadRenderView): void {
    const width = view.viewportWidth;
    const height = view.viewportHeight;
    const cameraPosition = this.wrapPosition(view.playerPosition - CAMERA_TRAILING_DISTANCE);
    const cameraSegmentIndex = this.segmentIndexAt(cameraPosition);
    const cameraSegmentFraction = (cameraPosition % SEGMENT_LENGTH) / SEGMENT_LENGTH;
    const cameraY = this.elevationAt(view.playerPosition) + CAMERA_HEIGHT;
    const cameraRoadX = view.playerRoadX * ROAD_HALF_WORLD_WIDTH;

    let roadCenterOffset = 0;
    let curveVelocity =
      -this.segments[cameraSegmentIndex].curve * CURVE_WORLD_SCALE * cameraSegmentFraction;
    let maxVisibleY = height;

    this.projectionFrame += 1;
    graphics.clear();

    for (let step = 0; step < DRAW_DISTANCE; step += 1) {
      const unwrappedIndex = cameraSegmentIndex + step;
      const segmentIndex = unwrappedIndex % this.segments.length;
      const lap = Math.floor(unwrappedIndex / this.segments.length);
      const segment = this.segments[segmentIndex];
      const zOffset = lap * this.totalLength;

      const p1RoadCenter = roadCenterOffset;
      const p2RoadCenter = roadCenterOffset + curveVelocity;

      projectPoint(
        segment.p1,
        segment.p1.worldZ + zOffset,
        p1RoadCenter - cameraRoadX,
        cameraY,
        cameraPosition,
        width,
        height,
      );
      projectPoint(
        segment.p2,
        segment.p2.worldZ + zOffset,
        p2RoadCenter - cameraRoadX,
        cameraY,
        cameraPosition,
        width,
        height,
      );

      segment.projectionFrame = this.projectionFrame;
      segment.clipY = maxVisibleY;

      roadCenterOffset += curveVelocity;
      curveVelocity += segment.curve * CURVE_WORLD_SCALE;

      if (segment.p1.screen.cameraZ <= NEAR_CLIP || segment.p2.screen.cameraZ <= NEAR_CLIP) {
        continue;
      }

      if (segment.p2.screen.y >= segment.p1.screen.y || segment.p2.screen.y >= maxVisibleY) {
        continue;
      }

      drawSegment(graphics, segment, width);
      maxVisibleY = segment.p1.screen.y;
    }
  }
}

function compileSections(sections: readonly RoadSectionSpec[]): RoadSegment[] {
  const segments: RoadSegment[] = [];
  let currentElevation = 0;

  for (const section of sections) {
    const enter = Math.max(0, Math.floor(section.enter));
    const hold = Math.max(0, Math.floor(section.hold));
    const leave = Math.max(0, Math.floor(section.leave));
    const total = enter + hold + leave;

    if (total <= 0) {
      continue;
    }

    const startElevation = currentElevation;
    const endElevation = startElevation + section.elevationDelta;

    for (let localIndex = 0; localIndex < total; localIndex += 1) {
      const segmentIndex = segments.length;
      const startProgress = localIndex / total;
      const endProgress = (localIndex + 1) / total;
      const p1Y = lerp(startElevation, endElevation, smoothStep(startProgress));
      const p2Y = lerp(startElevation, endElevation, smoothStep(endProgress));
      const curve = section.curve * curveEnvelope(localIndex, enter, hold, leave);

      segments.push({
        index: segmentIndex,
        curve,
        p1: createRoadPoint(p1Y, segmentIndex * SEGMENT_LENGTH),
        p2: createRoadPoint(p2Y, (segmentIndex + 1) * SEGMENT_LENGTH),
        clipY: Number.POSITIVE_INFINITY,
        projectionFrame: -1,
      });
    }

    currentElevation = endElevation;
  }

  return segments;
}

function curveEnvelope(index: number, enter: number, hold: number, leave: number): number {
  if (enter > 0 && index < enter) {
    return smoothStep((index + 0.5) / enter);
  }

  if (index < enter + hold) {
    return 1;
  }

  if (leave <= 0) {
    return 0;
  }

  const leaveIndex = index - enter - hold;
  return 1 - smoothStep((leaveIndex + 0.5) / leave);
}

function createRoadPoint(worldY: number, worldZ: number): RoadPoint {
  return {
    worldY,
    worldZ,
    screen: {
      cameraZ: 0,
      scale: 0,
      x: 0,
      y: 0,
      halfWidth: 0,
    },
  };
}

function projectPoint(
  point: RoadPoint,
  worldZ: number,
  roadCenterX: number,
  cameraY: number,
  cameraZ: number,
  viewportWidth: number,
  viewportHeight: number,
): void {
  const depth = worldZ - cameraZ;
  const projected = point.screen;

  projected.cameraZ = depth;

  if (depth <= NEAR_CLIP) {
    projected.scale = 0;
    return;
  }

  const scale = CAMERA_DEPTH / depth;
  const halfWidth = viewportWidth * 0.5;
  const halfHeight = viewportHeight * 0.5;

  projected.scale = scale;
  projected.x = halfWidth + scale * roadCenterX * halfWidth;
  projected.y = halfHeight - scale * (point.worldY - cameraY) * halfHeight;
  projected.halfWidth = scale * ROAD_HALF_WORLD_WIDTH * halfWidth;
}

function drawSegment(
  graphics: Phaser.GameObjects.Graphics,
  segment: RoadSegment,
  viewportWidth: number,
): void {
  const near = segment.p1.screen;
  const far = segment.p2.screen;
  const alternating = Math.floor(segment.index / 3) % 2 === 0;
  const grassColor = alternating ? COLORS.grassA : COLORS.grassB;
  const roadColor = alternating ? COLORS.roadA : COLORS.roadB;
  const rumbleColor = alternating ? COLORS.rumbleA : COLORS.rumbleB;

  const grassHeight = near.y - far.y;
  if (grassHeight > 0) {
    graphics.fillStyle(grassColor, 1);
    graphics.fillRect(0, far.y, viewportWidth, grassHeight);
  }

  drawQuad(
    graphics,
    rumbleColor,
    near.x - near.halfWidth * 1.08,
    near.x + near.halfWidth * 1.08,
    near.y,
    far.x - far.halfWidth * 1.08,
    far.x + far.halfWidth * 1.08,
    far.y,
  );

  drawQuad(
    graphics,
    roadColor,
    near.x - near.halfWidth,
    near.x + near.halfWidth,
    near.y,
    far.x - far.halfWidth,
    far.x + far.halfWidth,
    far.y,
  );

  if (segment.index % 6 < 3) {
    drawLaneMarkers(graphics, near, far);
  }
}

function drawLaneMarkers(
  graphics: Phaser.GameObjects.Graphics,
  near: ProjectedPoint,
  far: ProjectedPoint,
): void {
  for (let lane = 1; lane < LANE_COUNT; lane += 1) {
    const roadRatio = -1 + (2 * lane) / LANE_COUNT;
    const nearCenter = near.x + near.halfWidth * roadRatio;
    const farCenter = far.x + far.halfWidth * roadRatio;
    const nearMarkerHalfWidth = Math.max(1, near.halfWidth * 0.008);
    const farMarkerHalfWidth = Math.max(0.5, far.halfWidth * 0.008);

    drawQuad(
      graphics,
      COLORS.lane,
      nearCenter - nearMarkerHalfWidth,
      nearCenter + nearMarkerHalfWidth,
      near.y,
      farCenter - farMarkerHalfWidth,
      farCenter + farMarkerHalfWidth,
      far.y,
    );
  }
}

function drawQuad(
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
  const t = Math.min(1, Math.max(0, value));
  return t * t * (3 - 2 * t);
}

function lerp(start: number, end: number, amount: number): number {
  return start + (end - start) * amount;
}
