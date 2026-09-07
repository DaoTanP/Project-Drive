import Phaser from 'phaser';

export class ResultScene extends Phaser.Scene {
  private transitionStarted = false;

  constructor() {
    super('Result');
  }

  create(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.add
      .text(centerX, centerY - 28, 'RESULT FLOW OK', {
        fontFamily: 'monospace',
        fontSize: '36px',
        color: '#f5f7ff',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY + 28, 'Press Enter or tap to restart', {
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#aeb7d0',
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-ENTER', this.restartGame, this);
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
