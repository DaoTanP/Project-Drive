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
      .text(centerX, centerY - 92, completed ? 'DELIVERY COMPLETE' : 'TIME EXPIRED', {
        fontFamily: 'monospace',
        fontSize: '38px',
        color: completed ? '#f5f7ff' : '#e56b6f',
      })
      .setOrigin(0.5);

    this.add
      .text(
        centerX,
        centerY - 12,
        [
          `ELAPSED    ${this.result.elapsedSeconds.toFixed(1)}s`,
          `TIME LEFT  ${this.result.timeRemaining.toFixed(1)}s`,
          `ROUTE      ${routePercent.toFixed(1)}%`,
        ],
        {
          align: 'left',
          fontFamily: 'monospace',
          fontSize: '20px',
          color: '#d7dced',
          lineSpacing: 8,
        },
      )
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY + 100, 'Press Enter / R or tap to run again', {
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
