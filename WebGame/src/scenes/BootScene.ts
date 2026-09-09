import Phaser from 'phaser';

import {
  CITY_BACKGROUND_SOURCE_HEIGHT,
  CITY_BACKGROUND_SOURCE_WIDTH,
  CITY_BACKGROUND_TEXTURE_KEYS,
  CITY_BACKGROUND_TEXTURE_PATHS,
  NIGHT_COURIER_PALETTE,
  PLAYER_SOURCE_SIZE,
  PLAYER_TEXTURE_KEYS,
  PLAYER_TEXTURE_PATHS,
  TRAFFIC_SOURCE_SIZE,
  TRAFFIC_TEXTURE_KEYS,
  TRAFFIC_TEXTURE_PATHS,
} from '../config';

export class BootScene extends Phaser.Scene {
  private readonly failedAssetKeys: string[] = [];
  private readonly assetContractErrors: string[] = [];
  private statusText?: Phaser.GameObjects.Text;

  constructor() {
    super('Boot');
  }

  preload(): void {
    this.failedAssetKeys.length = 0;
    this.assetContractErrors.length = 0;

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

    for (const key of TRAFFIC_TEXTURE_KEYS) {
      this.load.image(key, TRAFFIC_TEXTURE_PATHS[key]);
    }

    for (const key of CITY_BACKGROUND_TEXTURE_KEYS) {
      this.load.image(key, CITY_BACKGROUND_TEXTURE_PATHS[key]);
    }
  }

  create(): void {
    if (this.failedAssetKeys.length > 0) {
      this.showFatalStatus(
        'ASSET LOAD ERROR',
        this.failedAssetKeys.map((key) => `- ${key}`),
        'Night Courier cannot start with required assets missing.',
      );
      return;
    }

    this.validateBatchASourceDimensions();
    if (this.assetContractErrors.length > 0) {
      this.showFatalStatus(
        'ASSET CONTRACT ERROR',
        this.assetContractErrors.map((error) => `- ${error}`),
        'Batch A assets must match the frozen production source sizes.',
      );
      return;
    }

    this.statusText?.destroy();
    this.scene.start('Game');
  }

  private validateBatchASourceDimensions(): void {
    for (const key of PLAYER_TEXTURE_KEYS) {
      this.requireTextureSize(key, PLAYER_SOURCE_SIZE, PLAYER_SOURCE_SIZE);
    }

    for (const key of TRAFFIC_TEXTURE_KEYS) {
      this.requireTextureSize(key, TRAFFIC_SOURCE_SIZE, TRAFFIC_SOURCE_SIZE);
    }

    for (const key of CITY_BACKGROUND_TEXTURE_KEYS) {
      this.requireTextureSize(
        key,
        CITY_BACKGROUND_SOURCE_WIDTH,
        CITY_BACKGROUND_SOURCE_HEIGHT,
      );
    }
  }

  private requireTextureSize(key: string, expectedWidth: number, expectedHeight: number): void {
    const source = this.textures.get(key).getSourceImage() as { width?: number; height?: number };
    if (source.width === expectedWidth && source.height === expectedHeight) return;

    this.assetContractErrors.push(
      `${key}: expected ${expectedWidth}x${expectedHeight}, ` +
        `loaded ${source.width ?? '?'}x${source.height ?? '?'}`,
    );
  }

  private showFatalStatus(title: string, details: readonly string[], footer: string): void {
    this.cameras.main.setBackgroundColor(NIGHT_COURIER_PALETTE.nc00);
    this.statusText
      ?.setText([title, '', ...details, '', footer])
      .setColor('#ff455d');
  }
}
