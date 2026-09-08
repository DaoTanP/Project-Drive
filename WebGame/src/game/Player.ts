import type { InputState } from './Input';

const MAX_SPEED = 3200;
const ACCELERATION = 1200;
const BRAKE_DECELERATION = 2600;
const COAST_DECELERATION = 420;
const STEER_RATE = 1.9;
const CURVE_DRIFT_RATE = 0.16;
const MAX_ROAD_X = 1.8;

export class Player {
  speed = 0;
  roadX = 0;

  get maxSpeed(): number {
    return MAX_SPEED;
  }

  update(input: InputState, dt: number, roadCurve: number): void {
    if (input.throttle > 0) {
      this.speed += ACCELERATION * input.throttle * dt;
    } else {
      this.speed -= COAST_DECELERATION * dt;
    }

    if (input.brake > 0) {
      this.speed -= BRAKE_DECELERATION * input.brake * dt;
    }

    this.speed = clamp(this.speed, 0, MAX_SPEED);

    const speedRatio = MAX_SPEED > 0 ? this.speed / MAX_SPEED : 0;
    const steeringAuthority = 0.25 + speedRatio * 0.75;

    this.roadX += input.steer * STEER_RATE * steeringAuthority * dt;
    this.roadX -= roadCurve * CURVE_DRIFT_RATE * speedRatio * dt;
    this.roadX = clamp(this.roadX, -MAX_ROAD_X, MAX_ROAD_X);
  }
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
