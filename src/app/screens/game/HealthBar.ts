import { Container, Sprite, Texture } from "pixi.js";

export class HealthBar extends Container {
  private readonly barCount: number = 10;
  private readonly iconMargin: number = 0;
  private readonly spacing: number = 13;

  private icon: Sprite = new Sprite(Texture.from("lifeIcon.png"));
  private healthBars: Sprite[] = [];

  private maxHealth: number = 100;
  private currentHealth: number = 100;

  constructor() {
    super();
    this.addChild(this.icon);
  }

  public setMaxHealth(maxHealth: number): void {
    this.maxHealth = maxHealth;
    this.draw();
  }

  public setCurrentHealth(currentHealth: number): void {
    this.currentHealth = Math.max(0, Math.min(currentHealth, this.maxHealth));
    this.draw();
  }

  private draw() {
    // Clear previous bars
    for (const bar of this.healthBars) {
      if (bar.parent === this) {
        this.removeChild(bar);
      }
    }
    this.healthBars = [];

    const healthPercentage = this.currentHealth / this.maxHealth;
    const filledBarsCount = Math.ceil(healthPercentage * this.barCount);

    // Layout vars
    const barTextureFull = Texture.from("lifeFull.png");
    const barTextureEmpty = Texture.from("lifeEmpty.png");
    const barWidth = barTextureFull.orig.width;
    const barHeight = barTextureFull.orig.height;

    const startX = this.icon.width + this.iconMargin;

    for (let i = 0; i < this.barCount; i++) {
      const isFilled = i < filledBarsCount;
      const texture = isFilled ? barTextureFull : barTextureEmpty;

      const bar = new Sprite(texture);
      bar.width = barWidth;
      bar.height = barHeight;

      const x = startX + i * this.spacing;
      const y = Math.max(0, (this.icon.height - barHeight) / 2);
      bar.position.set(x, y);

      this.addChild(bar);
      if (isFilled) {
        this.healthBars.push(bar);
      }
    }

    const totalWidth = startX + (this.barCount - 1) * this.spacing + barWidth;
    this.pivot.x = totalWidth / 2;
  }
}
