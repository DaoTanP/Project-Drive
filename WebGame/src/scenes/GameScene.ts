import Phaser from 'phaser';

import {
  CITY_BACKGROUND_SOURCE_HEIGHT,
  PLAYER_ANCHOR_X,
  PLAYER_ANCHOR_Y,
  PLAYER_DISPLAY_SIZE,
  PLAYER_SOURCE_SIZE,
  type PlayerTextureKey,
} from '../config';
import {
  advanceGameState,
  createGameState,
  createRunResult,
  setDestinationDistance,
  type GameState,
  type RouteBranch,
} from '../game/GameState';
import { InputController } from '../game/Input';
import { Player } from '../game/Player';
import {
  Road,
  type EnvironmentZone,
  type RoadsideSpriteKind,
  type RoadsideSpriteProjection,
} from '../game/Road';
import { Scoring } from '../game/Scoring';
import { Traffic } from '../game/Traffic';

const FIXED_STEP = 1 / 60;
const MAX_FRAME_DELTA = 0.15;
const MAX_CATCH_UP_STEPS = 5;
const RUN_TIME_LIMIT_SECONDS = 300;
const RISKY_TRAFFIC_GAP_SCALE = 0.82;
const SAFE_TRAFFIC_GAP_SCALE = 1.15;
const PLAYER_SCREEN_Y = 0.84;
const VISUAL_STEER_RESPONSE_PER_SECOND = 5.5;
const CITY_BACKGROUND_HORIZON_RATIO = 0.54;
const CITY_FAR_PARALLAX_RATE = 0.012;
const CITY_MID_PARALLAX_RATE = 0.028;

const ROADSIDE_TEXTURE_BY_KIND: Partial<Record<RoadsideSpriteKind, string>> = {
  light: 'prop_streetlight',
  rail: 'prop_guardrail',
  tree: 'prop_tree_cluster_01',
  rock: 'prop_rock_cluster_01',
  chevron: 'prop_chevron',
};
const ROADSIDE_FLIPPABLE_KINDS: ReadonlySet<RoadsideSpriteKind> = new Set(['chevron']);

export class GameScene extends Phaser.Scene {
  private road!: Road;
  private player!: Player;
  private traffic!: Traffic;
  private scoring!: Scoring;
  private controls!: InputController;
  private runState!: GameState;
  private roadGraphics!: Phaser.GameObjects.Graphics;
  private roadsideSprites: Phaser.GameObjects.Image[] = [];
  private roadsideSpriteProjections: RoadsideSpriteProjection[] = [];
  private roadsideSpriteKinds: Set<RoadsideSpriteKind> = new Set();
  private trafficSprites: Phaser.GameObjects.Image[] = [];
  private cityBackgroundFar!: Phaser.GameObjects.TileSprite;
  private cityBackgroundMid!: Phaser.GameObjects.TileSprite;
  private playerSprite!: Phaser.GameObjects.Image;
  private hudText!: Phaser.GameObjects.Text;
  private routePromptText!: Phaser.GameObjects.Text;
  private accumulator = 0;
  private visualSteer = 0;
  private currentPlayerTexture: PlayerTextureKey = 'player_rear_center';
  private routeChoice: RouteBranch | null = null;
  private routeChoiceNoticeUntil = 0;
  private transitionStarted = false;

  constructor() {
    super('Game');
  }

  create(): void {
    this.accumulator = 0;
    this.visualSteer = 0;
    this.currentPlayerTexture = 'player_rear_center';
    this.routeChoice = null;
    this.routeChoiceNoticeUntil = 0;
    this.transitionStarted = false;

    this.road = new Road();
    this.player = new Player();
    this.traffic = new Traffic();
    this.scoring = new Scoring();
    this.controls = new InputController(this);
    this.runState = createGameState({
      timeLimitSeconds: RUN_TIME_LIMIT_SECONDS,
      destinationDistance: this.road.destinationDistance,
    });

    const cityBackgroundHeight = this.scale.height * CITY_BACKGROUND_HORIZON_RATIO;
    const cityBackgroundScale = cityBackgroundHeight / CITY_BACKGROUND_SOURCE_HEIGHT;

    this.cityBackgroundFar = this.add
      .tileSprite(0, 0, this.scale.width, cityBackgroundHeight, 'bg_city_far')
      .setOrigin(0, 0)
      .setTileScale(cityBackgroundScale, cityBackgroundScale)
      .setDepth(-20);

    this.cityBackgroundMid = this.add
      .tileSprite(0, 0, this.scale.width, cityBackgroundHeight, 'bg_city_mid')
      .setOrigin(0, 0)
      .setTileScale(cityBackgroundScale, cityBackgroundScale)
      .setDepth(-19);

    this.roadGraphics = this.add.graphics().setDepth(0);
    this.initializeRoadsideSpritePool();
    this.trafficSprites = Array.from({ length: this.traffic.renderPoolSize }, () =>
      this.add.image(0, 0, 'traffic_taxi_rear_center').setVisible(false).setDepth(5),
    );
    this.playerSprite = this.add
      .image(
        this.scale.width * 0.5,
        this.scale.height * PLAYER_SCREEN_Y,
        this.currentPlayerTexture,
      )
      .setOrigin(PLAYER_ANCHOR_X / PLAYER_SOURCE_SIZE, PLAYER_ANCHOR_Y / PLAYER_SOURCE_SIZE)
      .setDisplaySize(PLAYER_DISPLAY_SIZE, PLAYER_DISPLAY_SIZE)
      .setDepth(10);

    this.hudText = this.add
      .text(20, 18, '', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#f5f7ff',
        lineSpacing: 4,
      })
      .setDepth(20);

    this.routePromptText = this.add
      .text(this.scale.width * 0.5, 28, '', {
        align: 'center',
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#f5f3ea',
        backgroundColor: '#080c18cc',
        padding: { x: 12, y: 8 },
        lineSpacing: 4,
      })
      .setOrigin(0.5, 0)
      .setDepth(30);

    this.add
      .text(this.scale.width - 20, 18, 'M5 BATCH A\nARROWS or WASD', {
        align: 'right',
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#aeb7d0',
        lineSpacing: 4,
      })
      .setOrigin(1, 0)
      .setDepth(20);

    this.renderFrame();
  }

  update(_time: number, deltaMs: number): void {
    if (this.transitionStarted) return;

    const frameDelta = Math.min(Math.max(deltaMs / 1000, 0), MAX_FRAME_DELTA);
    const input = this.controls.sample();
    this.visualSteer = moveTowards(
      this.visualSteer,
      input.steer,
      VISUAL_STEER_RESPONSE_PER_SECOND * frameDelta,
    );
    this.accumulator += frameDelta;

    let simulationSteps = 0;
    while (this.accumulator >= FIXED_STEP && simulationSteps < MAX_CATCH_UP_STEPS) {
      this.resolveRouteChoice(input.steer);

      const roadPosition = this.road.positionForRouteDistance(this.runState.routeDistance);
      const roadCurve = this.road.curveAt(roadPosition);
      const previousRouteDistance = this.runState.routeDistance;

      this.player.update(input, FIXED_STEP, roadCurve);
      advanceGameState(this.runState, FIXED_STEP, this.player.speed * FIXED_STEP);

      const trafficStep = this.traffic.update(
        FIXED_STEP,
        previousRouteDistance,
        this.runState.routeDistance,
        this.player.roadX,
      );

      if (trafficStep.collisions > 0) {
        this.player.applyCollision(trafficStep.cargoDamage, trafficStep.speedRetention);
      }
      this.scoring.applyStep(trafficStep.nearMisses, trafficStep.collisions);

      this.accumulator -= FIXED_STEP;
      simulationSteps += 1;
      if (this.runState.finished) break;
    }

    if (simulationSteps === MAX_CATCH_UP_STEPS && this.accumulator >= FIXED_STEP) {
      this.accumulator = 0;
    }

    if (this.runState.finished) {
      this.finishRun();
      return;
    }

    this.renderFrame();
  }

  private resolveRouteChoice(steer: number): void {
    if (this.routeChoice !== null) return;

    const distance = this.runState.routeDistance;
    if (distance < this.road.branchPromptStartDistance) return;

    if (steer <= -0.35) {
      this.chooseRoute('risky');
      return;
    }

    if (steer >= 0.35) {
      this.chooseRoute('safe');
      return;
    }

    if (distance >= this.road.branchDecisionDistance) {
      this.chooseRoute('safe');
    }
  }

  private chooseRoute(branch: RouteBranch): void {
    this.routeChoice = branch;
    this.road.selectBranch(branch);
    setDestinationDistance(this.runState, this.road.destinationDistance);
    this.traffic.setGapScale(
      branch === 'risky' ? RISKY_TRAFFIC_GAP_SCALE : SAFE_TRAFFIC_GAP_SCALE,
    );
    this.routeChoiceNoticeUntil = this.runState.elapsedSeconds + 3;
  }

  private finishRun(): void {
    if (this.transitionStarted) return;
    const outcome = this.runState.outcome;
    if (outcome === null) return;

    const driving = this.scoring.snapshot();
    const final = this.scoring.finalize(
      outcome,
      this.runState.timeRemaining,
      this.player.cargoHealth,
    );

    this.transitionStarted = true;
    this.scene.start(
      'Result',
      createRunResult(this.runState, {
        score: final.score,
        drivingScore: final.drivingScore,
        timeBonus: final.timeBonus,
        cargoBonus: final.cargoBonus,
        rank: final.rank,
        branch: this.routeChoice,
        cargoHealth: this.player.cargoHealth,
        nearMisses: driving.nearMisses,
        collisionCount: driving.collisionCount,
        bestCombo: driving.bestCombo,
      }),
    );
  }

  private renderFrame(): void {
    const width = this.scale.width;
    const height = this.scale.height;
    const roadPosition = this.road.positionForRouteDistance(this.runState.routeDistance);
    const zone = this.road.zoneAtRouteDistance(this.runState.routeDistance);

    this.updateCityBackgrounds(zone);

    this.road.render(
      this.roadGraphics,
      {
        playerPosition: roadPosition,
        playerRoadX: this.player.roadX,
        viewportWidth: width,
        viewportHeight: height,
      },
      this.roadsideSpriteKinds,
    );
    this.renderRoadsideSprites();

    this.traffic.render(this.trafficSprites, this.road, {
      roadPositionOffset: this.road.startPosition,
      playerRouteDistance: this.runState.routeDistance,
    });

    this.updatePlayerSprite(width, height);
    this.updateRoutePrompt();

    const speedKph = Math.round((this.player.speed / this.player.maxSpeed) * 180);
    const routePercent =
      (this.runState.routeDistance / this.runState.destinationDistance) * 100;

    this.hudText.setText([
      `TIME    ${formatClock(this.runState.timeRemaining)}`,
      `SPEED   ${speedKph.toString().padStart(3, '0')} km/h`,
      `SCORE   ${this.scoring.score.toString().padStart(6, '0')}`,
      `CARGO   ${Math.round(this.player.cargoHealth).toString().padStart(3, ' ')}%`,
      `COMBO   x${this.scoring.combo}`,
      `ROUTE   ${routePercent.toFixed(1).padStart(5, ' ')}%`,
      `ZONE    ${zone.toUpperCase()}`,
      `BRANCH  ${(this.routeChoice ?? 'UNDECIDED').toUpperCase()}`,
    ]);
  }

  private initializeRoadsideSpritePool(): void {
    this.roadsideSpriteKinds = new Set(
      (Object.entries(ROADSIDE_TEXTURE_BY_KIND) as Array<[RoadsideSpriteKind, string]>)
        .filter(([, textureKey]) => this.textures.exists(textureKey))
        .map(([kind]) => kind),
    );

    this.roadsideSpriteProjections = Array.from(
      { length: this.road.roadsideSpritePoolSize },
      (): RoadsideSpriteProjection => ({
        x: 0, y: 0, cameraZ: 0, pixelsPerWorld: 0, clipY: 0,
        kind: 'tree', side: 1, zone: 'rural', worldWidth: 0, worldHeight: 0,
      }),
    );

    this.roadsideSprites = this.roadsideSpriteKinds.size === 0
      ? []
      : Array.from({ length: this.road.roadsideSpritePoolSize }, () =>
          this.add.image(0, 0, 'player_rear_center').setOrigin(0.5, 1).setVisible(false).setDepth(1),
        );
  }

  private renderRoadsideSprites(): void {
    for (const image of this.roadsideSprites) image.setVisible(false);
    if (this.roadsideSprites.length === 0) return;

    const count = this.road.collectRoadsideSprites(this.roadsideSpriteProjections, this.roadsideSpriteKinds);
    for (let i = 0; i < count; i += 1) {
      const projection = this.roadsideSpriteProjections[i];
      const textureKey = ROADSIDE_TEXTURE_BY_KIND[projection.kind];
      if (textureKey === undefined || !this.textures.exists(textureKey)) continue;

      const displayWidth = projection.worldWidth * projection.pixelsPerWorld;
      const displayHeight = projection.worldHeight * projection.pixelsPerWorld;
      if (displayWidth < 1.5 || displayHeight < 2) continue;

      const top = projection.y - displayHeight;
      const visibleBottom = Math.min(projection.y, projection.clipY);
      const visibleHeight = visibleBottom - top;
      if (visibleHeight <= 1) continue;

      const image = this.roadsideSprites[i];
      image
        .setTexture(textureKey)
        .setOrigin(0.5, 1)
        .setPosition(projection.x, projection.y)
        .setDisplaySize(displayWidth, displayHeight)
        .setFlipX(ROADSIDE_FLIPPABLE_KINDS.has(projection.kind) && projection.side < 0)
        .setDepth(1 + i / (this.roadsideSprites.length + 1))
        .setVisible(true);

      if (visibleHeight < displayHeight - 0.5) {
        const sourceHeight = image.frame.height;
        const cropHeight = Math.max(1, Math.min(sourceHeight, Math.ceil(sourceHeight * (visibleHeight / displayHeight))));
        image.setCrop(0, 0, image.frame.width, cropHeight);
      } else {
        image.setCrop();
      }
    }
  }

  private updateCityBackgrounds(zone: EnvironmentZone): void {
    const visible = zone === 'city';
    this.cityBackgroundFar.setVisible(visible);
    this.cityBackgroundMid.setVisible(visible);
    if (!visible) return;

    this.cityBackgroundFar.tilePositionX = this.runState.routeDistance * CITY_FAR_PARALLAX_RATE;
    this.cityBackgroundMid.tilePositionX = this.runState.routeDistance * CITY_MID_PARALLAX_RATE;
  }

  private updatePlayerSprite(width: number, height: number): void {
    const nextTexture = playerTextureForVisualSteer(this.visualSteer);
    if (nextTexture !== this.currentPlayerTexture) {
      this.currentPlayerTexture = nextTexture;
      this.playerSprite.setTexture(nextTexture);
    }

    this.playerSprite.setPosition(width * 0.5, height * PLAYER_SCREEN_Y);
  }

  private updateRoutePrompt(): void {
    if (
      this.routeChoice === null &&
      this.runState.routeDistance >= this.road.branchPromptStartDistance
    ) {
      this.routePromptText.setText([
        'ROUTE CHOICE',
        '← MOUNTAIN PASS / TUNNEL  SHORT + RISKY',
        'FOREST / RURAL  LONG + SAFE →',
      ]);
      return;
    }

    if (
      this.routeChoice !== null &&
      this.runState.elapsedSeconds < this.routeChoiceNoticeUntil
    ) {
      this.routePromptText.setText(
        this.routeChoice === 'risky'
          ? 'RISKY ROUTE LOCKED\nMOUNTAIN PASS → TUNNEL'
          : 'SAFE ROUTE LOCKED\nFOREST → RURAL',
      );
      return;
    }

    this.routePromptText.setText('');
  }
}

function playerTextureForVisualSteer(visualSteer: number): PlayerTextureKey {
  if (visualSteer <= -0.68) return 'player_rear_hard_left';
  if (visualSteer < -0.18) return 'player_rear_left';
  if (visualSteer < 0.18) return 'player_rear_center';
  if (visualSteer < 0.68) return 'player_rear_right';
  return 'player_rear_hard_right';
}

function moveTowards(current: number, target: number, maxDelta: number): number {
  if (current < target) return Math.min(current + maxDelta, target);
  if (current > target) return Math.max(current - maxDelta, target);
  return target;
}

function formatClock(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const wholeSeconds = Math.floor(safeSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${wholeSeconds.toString().padStart(2, '0')}`;
}
