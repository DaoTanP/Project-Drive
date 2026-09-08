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
    const branch = this.result.branch === null ? 'UNDECIDED' : this.result.branch.toUpperCase();

    this.add
      .text(centerX, centerY - 178, completed ? 'DELIVERY COMPLETE' : 'TIME EXPIRED', {
        fontFamily: 'monospace',
        fontSize: '36px',
        color: completed ? '#f5f7ff' : '#e56b6f',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY - 128, `RANK ${this.result.rank}`, {
        fontFamily: 'monospace',
        fontSize: '30px',
        color: completed ? '#ffcc33' : '#aeb7d0',
      })
      .setOrigin(0.5);

    this.add
      .text(
        centerX,
        centerY + 10,
        [
          `FINAL SCORE  ${this.result.score.toString().padStart(6, '0')}`,
          `DRIVING      ${this.result.drivingScore.toString().padStart(6, '0')}`,
          `TIME BONUS   ${this.result.timeBonus.toString().padStart(6, '0')}`,
          `CARGO BONUS  ${this.result.cargoBonus.toString().padStart(6, '0')}`,
          `CARGO        ${Math.round(this.result.cargoHealth).toString().padStart(3, ' ')}%`,
          `NEAR MISS    ${this.result.nearMisses}`,
          `BEST COMBO   x${this.result.bestCombo}`,
          `COLLISIONS   ${this.result.collisionCount}`,
          `BRANCH       ${branch}`,
          `ELAPSED      ${formatClock(this.result.elapsedSeconds)}`,
          `TIME LEFT    ${formatClock(this.result.timeRemaining)}`,
          `ROUTE        ${routePercent.toFixed(1)}%`,
        ],
        {
          align: 'left',
          fontFamily: 'monospace',
          fontSize: '16px',
          color: '#d7dced',
          lineSpacing: 4,
        },
      )
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY + 205, 'Press Enter / R or tap to run again', {
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
    if (this.transitionStarted) return;
    this.transitionStarted = true;
    this.scene.start('Game');
  }
}

function formatClock(seconds: number): string {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const wholeSeconds = Math.floor(safe % 60);
  return `${minutes.toString().padStart(2, '0')}:${wholeSeconds.toString().padStart(2, '0')}`;
}
