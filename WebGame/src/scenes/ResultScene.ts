import Phaser from 'phaser';

import type { RunResult } from '../game/GameState';

export class ResultScene extends Phaser.Scene {
  private transitionStarted = false;
  private result!: RunResult;

  constructor() {
    super('Result');
  }

  init(data: RunResult): void {
    this.result = data;
    this.transitionStarted = false;
  }

  create(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;
    const completed = this.result.outcome === 'completed';
    const routePercent = Math.min(
      100,
      (this.result.routeDistance / this.result.destinationDistance) * 100,
    );

    this.add
      .text(centerX, centerY - 145, completed ? 'DELIVERY COMPLETE' : 'TIME EXPIRED', {
        fontFamily: 'monospace',
        fontSize: '38px',
        color: completed ? '#f5f7ff' : '#e56b6f',
      })
      .setOrigin(0.5);

    this.add
      .text(
        centerX,
        centerY - 25,
        [
          `SCORE       ${this.result.score.toString().padStart(6, '0')}`,
          `CARGO       ${Math.round(this.result.cargoHealth).toString().padStart(3, ' ')}%`,
          `NEAR MISS   ${this.result.nearMisses}`,
          `BEST COMBO  x${this.result.bestCombo}`,
          `COLLISIONS  ${this.result.collisionCount}`,
          `ELAPSED     ${this.result.elapsedSeconds.toFixed(1)}s`,
          `TIME LEFT   ${this.result.timeRemaining.toFixed(1)}s`,
          `ROUTE       ${routePercent.toFixed(1)}%`,
        ],
        {
          align: 'left',
          fontFamily: 'monospace',
          fontSize: '18px',
          color: '#d7dced',
          lineSpacing: 6,
        },
      )
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY + 170, 'Press Enter / R or tap to run again', {
        fontFamily: 'monospace',
        fontSize: '17px',
        color: '#aeb7d0',
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-ENTER', this.restartGame, this);
    this.input.keyboard?.once('keydown-R', this.restartGame, this);
    this.input.once('pointerdown', this.restartGame, this);
  }

  private restartGame(): void {
    if (this.transitionStarted) {
      return;
    }

    this.transitionStarted = true;
    this.scene.start('Game');
  }
}
