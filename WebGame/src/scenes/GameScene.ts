import Phaser from 'phaser';

import { InputController } from '../game/Input';
import { Player } from '../game/Player';
import { Road } from '../game/Road';

const FIXED_STEP = 1 / 60;
const MAX_FRAME_DELTA = 0.15;
const MAX_CATCH_UP_STEPS = 5;
const INITIAL_TRACK_POSITION = 1200;

export class GameScene extends Phaser.Scene {
  private road!: Road;
  private player!: Player;
  private controls!: InputController;
  private roadGraphics!: Phaser.GameObjects.Graphics;
  private playerGraphics!: Phaser.GameObjects.Graphics;
  private hudText!: Phaser.GameObjects.Text;
  private accumulator = 0;
  private trackPosition = INITIAL_TRACK_POSITION;
  private lastSteer = 0;

  constructor() {
    super('Game');
  }

  create(): void {
    this.road = new Road();
    this.player = new Player();
    this.controls = new InputController(this);

    this.roadGraphics = this.add.graphics().setDepth(0);
    this.playerGraphics = this.add.graphics().setDepth(10);
    this.hudText = this.add
      .text(20, 18, '', {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#f5f7ff',
        lineSpacing: 4,
      })
      .setDepth(20);

    this.add
      .text(this.scale.width - 20, 18, 'M1 ROAD / PLAYER SLICE\nARROWS or WASD', {
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
    const frameDelta = Math.min(Math.max(deltaMs / 1000, 0), MAX_FRAME_DELTA);
    const input = this.controls.sample();

    this.lastSteer = input.steer;
    this.accumulator += frameDelta;

    let simulationSteps = 0;

    while (this.accumulator >= FIXED_STEP && simulationSteps < MAX_CATCH_UP_STEPS) {
      const roadCurve = this.road.curveAt(this.trackPosition);

      this.player.update(input, FIXED_STEP, roadCurve);
      this.trackPosition = this.road.wrapPosition(
        this.trackPosition + this.player.speed * FIXED_STEP,
      );

      this.accumulator -= FIXED_STEP;
      simulationSteps += 1;
    }

    if (simulationSteps === MAX_CATCH_UP_STEPS && this.accumulator >= FIXED_STEP) {
      this.accumulator = 0;
    }

    this.renderFrame();
  }

  private renderFrame(): void {
    const width = this.scale.width;
    const height = this.scale.height;

    this.road.render(this.roadGraphics, {
      playerPosition: this.trackPosition,
      playerRoadX: this.player.roadX,
      viewportWidth: width,
      viewportHeight: height,
    });

    this.drawPlayerPlaceholder(width, height);

    const speedKph = Math.round((this.player.speed / this.player.maxSpeed) * 180);
    const trackPercent = (this.trackPosition / this.road.trackLength) * 100;

    this.hudText.setText([
      `SPEED  ${speedKph.toString().padStart(3, '0')} km/h`,
      `ROAD X ${this.player.roadX.toFixed(2)}`,
      `TRACK  ${trackPercent.toFixed(1)}%`,
      `SEG    ${this.road.segmentIndexAt(this.trackPosition)}`,
    ]);
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
