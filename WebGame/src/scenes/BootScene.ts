import Phaser from 'phaser';

import { NIGHT_COURIER_PALETTE } from '../config';

export const PLAYER_TEXTURE_KEYS = [
  'player_rear_hard_left',
  'player_rear_left',
  'player_rear_center',
  'player_rear_right',
  'player_rear_hard_right',
] as const;

export type PlayerTextureKey = (typeof PLAYER_TEXTURE_KEYS)[number];

const PLAYER_TEXTURE_PATHS: Record<PlayerTextureKey, string> = {
  player_rear_hard_left: 'assets/player/player_rear_hard_left.png',
  player_rear_left: 'assets/player/player_rear_left.png',
  player_rear_center: 'assets/player/player_rear_center.png',
  player_rear_right: 'assets/player/player_rear_right.png',
  player_rear_hard_right: 'assets/player/player_rear_hard_right.png',
};

export const PLAYER_SOURCE_SIZE = 256;

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

    for (const key of PLAYER_TEXTURE_KEYS) {
      this.load.image(key, PLAYER_TEXTURE_PATHS[key]);
    }
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

    this.warnForNonCanonicalPlayerSources();
    this.statusText?.destroy();
    this.scene.start('Game');
  }

  private warnForNonCanonicalPlayerSources(): void {
    for (const key of PLAYER_TEXTURE_KEYS) {
      const source = this.textures.get(key).getSourceImage() as { width?: number; height?: number };
      if (source.width === PLAYER_SOURCE_SIZE && source.height === PLAYER_SOURCE_SIZE) continue;

      console.warn(
        `[Night Courier] ${key} should be ${PLAYER_SOURCE_SIZE}x${PLAYER_SOURCE_SIZE}; ` +
          `loaded ${source.width ?? '?'}x${source.height ?? '?'}. ` +
          'The texture remains usable for staging, but it has not passed production-size acceptance.',
      );
    }
  }
}
