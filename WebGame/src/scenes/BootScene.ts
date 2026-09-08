import Phaser from 'phaser';

import { NIGHT_COURIER_PALETTE } from '../config';

export class BootScene extends Phaser.Scene {
  private readonly failedAssetKeys: string[] = [];
  private statusText?: Phaser.GameObjects.Text;

  constructor() {
    super('Boot');
  }

  preload(): void {
    this.failedAssetKeys.length = 0;

    this.statusText = this.add
      .text(this.scale.width * 0.5, this.scale.height * 0.5, 'LOADING 0%', {
        align: 'center',
        fontFamily: 'monospace',
        fontSize: '18px',
        color: '#f5f3ea',
      })
      .setOrigin(0.5)
      .setDepth(10);

    this.load.on('progress', (progress: number) => {
      this.statusText?.setText(`LOADING ${Math.round(progress * 100)}%`);
    });

    this.load.on('loaderror', (file: Phaser.Loader.File) => {
      this.failedAssetKeys.push(file.key);
    });

    // M5A establishes the loader/error boundary only. Batch A adds the first
    // required local image/font/audio entries here; do not queue fake assets.
  }

  create(): void {
    if (this.failedAssetKeys.length > 0) {
      this.cameras.main.setBackgroundColor(NIGHT_COURIER_PALETTE.nc00);
      this.statusText
        ?.setText([
          'ASSET LOAD ERROR',
          '',
          ...this.failedAssetKeys.map((key) => `- ${key}`),
          '',
          'Night Courier cannot start with required assets missing.',
        ])
        .setColor('#ff455d');
      return;
    }

    this.statusText?.destroy();
    this.scene.start('Game');
  }
}
