import { ProgressBar } from "@pixi/ui";

export class SmallHealthBar extends ProgressBar {
  private maxHealth: number = 100;

  constructor() {
    super({
      bg: "smallHealthBarBackground.png",
      fill: "smallHealthBarForeground.png",
      nineSliceSprite: {
        bg: [11, 8, 2, 8],
        fill: [11, 8, 2, 8],
      },
    });
  }

  public setHealth(health: number): void {
    this.progress = (health / this.maxHealth) * 100;
  }

  public setMaxHealth(maxHealth: number): void {
    this.maxHealth = maxHealth;
  }
}
