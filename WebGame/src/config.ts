import Phaser from 'phaser';

import { BootScene } from './scenes/BootScene';
import { GameScene } from './scenes/GameScene';
import { ResultScene } from './scenes/ResultScene';

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

/**
 * Authoritative runtime representation of the Night Courier 20 palette.
 * Token names map directly to NC-00..NC-19 in Art-Direction-and-Color-Palette.md.
 */
export const NIGHT_COURIER_PALETTE = {
  nc00: 0x080c18,
  nc01: 0x0e1628,
  nc02: 0x16223a,
  nc03: 0x22334d,
  nc04: 0x344a64,
  nc05: 0x64748a,
  nc06: 0x9baabc,
  nc07: 0xd5dce5,
  nc08: 0xf5f3ea,
  nc09: 0xf4c95d,
  nc10: 0xff914d,
  nc11: 0xeb5548,
  nc12: 0xff3b8d,
  nc13: 0xb56cff,
  nc14: 0x22d3ee,
  nc15: 0x29a9e8,
  nc16: 0x55e06f,
  nc17: 0xd6f04b,
  nc18: 0xffcc33,
  nc19: 0xff455d,
} as const;

export type NightCourierPaletteToken = keyof typeof NIGHT_COURIER_PALETTE;

export const PLAYER_TEXTURE_KEYS = [
  'player_rear_hard_left',
  'player_rear_left',
  'player_rear_center',
  'player_rear_right',
  'player_rear_hard_right',
] as const;

export type PlayerTextureKey = (typeof PLAYER_TEXTURE_KEYS)[number];

export const PLAYER_TEXTURE_PATHS: Record<PlayerTextureKey, string> = {
  player_rear_hard_left: 'assets/player/player_rear_hard_left.png',
  player_rear_left: 'assets/player/player_rear_left.png',
  player_rear_center: 'assets/player/player_rear_center.png',
  player_rear_right: 'assets/player/player_rear_right.png',
  player_rear_hard_right: 'assets/player/player_rear_hard_right.png',
};

export const PLAYER_SOURCE_SIZE = 256;
export const PLAYER_DISPLAY_SIZE = 256;
export const PLAYER_ANCHOR_X = 128;
export const PLAYER_ANCHOR_Y = 232;

export const CITY_BACKGROUND_TEXTURE_KEYS = ['bg_city_far', 'bg_city_mid'] as const;
export type CityBackgroundTextureKey = (typeof CITY_BACKGROUND_TEXTURE_KEYS)[number];

export const CITY_BACKGROUND_TEXTURE_PATHS: Record<CityBackgroundTextureKey, string> = {
  bg_city_far: 'assets/backgrounds/bg_city_far.png',
  bg_city_mid: 'assets/backgrounds/bg_city_mid.png',
};

export const CITY_BACKGROUND_SOURCE_WIDTH = 2048;
export const CITY_BACKGROUND_SOURCE_HEIGHT = 512;

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: NIGHT_COURIER_PALETTE.nc00,
  pixelArt: true,
  scene: [BootScene, GameScene, ResultScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
};
