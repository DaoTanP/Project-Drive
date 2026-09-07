import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  private transitionStarted = false;

  constructor() {
    super('Game');
  }

  create(): void {
    const centerX = this.scale.width / 2;
    const centerY = this.scale.height / 2;

    this.add
      .text(centerX, centerY - 40, 'NIGHT COURIER', {
        fontFamily: 'monospace',
        fontSize: '42px',
        color: '#f5f7ff',
      })
      .setOrigin(0.5);

    this.add
      .text(centerX, centerY + 24, 'M0 BOOTSTRAP\nPress Enter or tap to verify ResultScene', {
        align: 'center',
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#aeb7d0',
        lineSpacing: 8,
      })
      .setOrigin(0.5);

    this.input.keyboard?.once('keydown-ENTER', this.openResult, this);
    this.input.once('pointerdown', this.openResult, this);
  }

  private openResult(): void {
    if (this.transitionStarted) {
      return;
    }

    this.transitionStarted = true;
    this.scene.start('Result');
  }
}
