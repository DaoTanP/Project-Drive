import Phaser from 'phaser';

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
import { Road } from '../game/Road';
import { Scoring } from '../game/Scoring';
import { Traffic } from '../game/Traffic';

const FIXED_STEP = 1 / 60;
const MAX_FRAME_DELTA = 0.15;
const MAX_CATCH_UP_STEPS = 5;
const RUN_TIME_LIMIT_SECONDS = 300;
const RISKY_TRAFFIC_GAP_SCALE = 0.82;
const SAFE_TRAFFIC_GAP_SCALE = 1.15;

export class GameScene extends Phaser.Scene {
  private road!: Road;
  private player!: Player;
  private traffic!: Traffic;
  private scoring!: Scoring;
  private controls!: InputController;
  private runState!: GameState;
  private roadGraphics!: Phaser.GameObjects.Graphics;
  private trafficGraphics!: Phaser.GameObjects.Graphics;
  private playerGraphics!: Phaser.GameObjects.Graphics;
  private hudText!: Phaser.GameObjects.Text;
  private routePromptText!: Phaser.GameObjects.Text;
  private accumulator = 0;
  private lastSteer = 0;
  private routeChoice: RouteBranch | null = null;
  private routeChoiceNoticeUntil = 0;
  private transitionStarted = false;

  constructor() {
    super('Game');
  }

  create(): void {
    this.accumulator = 0;
    this.lastSteer = 0;
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

    this.roadGraphics = this.add.graphics().setDepth(0);
    this.trafficGraphics = this.add.graphics().setDepth(5);
    this.playerGraphics = this.add.graphics().setDepth(10);
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
      .text(this.scale.width - 20, 18, 'M4 FINAL ROUTE\nARROWS or WASD', {
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
    this.lastSteer = input.steer;
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

    this.road.render(this.roadGraphics, {
      playerPosition: roadPosition,
      playerRoadX: this.player.roadX,
      viewportWidth: width,
      viewportHeight: height,
    });

    this.traffic.render(this.trafficGraphics, this.road, {
      roadPositionOffset: this.road.startPosition,
      playerRouteDistance: this.runState.routeDistance,
    });

    this.drawPlayerPlaceholder(width, height);
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

  private drawPlayerPlaceholder(width: number, height: number): void {
    const graphics = this.playerGraphics;
    graphics.clear();
    graphics.setPosition(width * 0.5, height * 0.84);
    graphics.setRotation(this.lastSteer * 0.035);

    graphics.fillStyle(0x10131b, 1);
    graphics.fillRect(-31, -9, 9, 22);
    graphics.fillRect(22, -9, 9, 22);
    graphics.fillStyle(0xe8c96d, 1);
    graphics.fillRect(-27, -15, 54, 30);
    graphics.fillTriangle(-19, -15, -10, -27, 10, -27);
    graphics.fillTriangle(-19, -15, 10, -27, 19, -15);
    graphics.fillStyle(0x9fc0c9, 1);
    graphics.fillRect(-10, -23, 20, 8);
    graphics.fillStyle(0xe56b6f, 1);
    graphics.fillRect(-22, 8, 8, 4);
    graphics.fillRect(14, 8, 8, 4);
  }
}

function formatClock(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const wholeSeconds = Math.floor(safeSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${wholeSeconds.toString().padStart(2, '0')}`;
}
