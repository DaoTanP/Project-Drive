import Phaser from 'phaser';

export interface InputState {
  steer: number;
  throttle: number;
  brake: number;
}

export class InputController {
  private readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private readonly leftAlt: Phaser.Input.Keyboard.Key;
  private readonly rightAlt: Phaser.Input.Keyboard.Key;
  private readonly throttleAlt: Phaser.Input.Keyboard.Key;
  private readonly brakeAlt: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene) {
    const keyboard = scene.input.keyboard;

    if (!keyboard) {
      throw new Error('Keyboard input is unavailable in this runtime.');
    }

    this.cursors = keyboard.createCursorKeys();
    this.leftAlt = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.rightAlt = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
    this.throttleAlt = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
    this.brakeAlt = keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
  }

  sample(): InputState {
    const left = this.cursors.left.isDown || this.leftAlt.isDown;
    const right = this.cursors.right.isDown || this.rightAlt.isDown;
    const throttle = this.cursors.up.isDown || this.throttleAlt.isDown;
    const brake = this.cursors.down.isDown || this.brakeAlt.isDown;

    return {
      steer: Number(right) - Number(left),
      throttle: throttle ? 1 : 0,
      brake: brake ? 1 : 0,
    };
  }
}
