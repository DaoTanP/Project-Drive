export interface ScoreSummary {
  score: number;
  combo: number;
  bestCombo: number;
  nearMisses: number;
  collisionCount: number;
}

const NEAR_MISS_BASE_SCORE = 250;
const COLLISION_PENALTY = 150;
const MAX_COMBO = 5;

export class Scoring {
  score = 0;
  combo = 1;
  bestCombo = 1;
  nearMisses = 0;
  collisionCount = 0;

  applyStep(nearMisses: number, collisions: number): void {
    const safeNearMisses = Math.max(0, Math.floor(nearMisses));
    const safeCollisions = Math.max(0, Math.floor(collisions));

    for (let index = 0; index < safeNearMisses; index += 1) {
      this.score += NEAR_MISS_BASE_SCORE * this.combo;
      this.nearMisses += 1;
      this.combo = Math.min(MAX_COMBO, this.combo + 1);
      this.bestCombo = Math.max(this.bestCombo, this.combo);
    }

    if (safeCollisions > 0) {
      this.collisionCount += safeCollisions;
      this.score = Math.max(0, this.score - COLLISION_PENALTY * safeCollisions);
      this.combo = 1;
    }
  }

  snapshot(): ScoreSummary {
    return {
      score: this.score,
      combo: this.combo,
      bestCombo: this.bestCombo,
      nearMisses: this.nearMisses,
      collisionCount: this.collisionCount,
    };
  }
}
