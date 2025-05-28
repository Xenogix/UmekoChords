import { Container, Sprite, Texture } from "pixi.js";

export class HealthBar extends Container {
  private readonly barCount: number = 15;
  private readonly iconMargin: number = -10;

  private icon: Sprite = new Sprite(Texture.from("lifeIcon.png"));
  private healthBars: Sprite[] = [];

  private maxHealth: number = 100;
  private currentHealth: number = 100;
  private internalWidth: number = 0;
  private internalHeight: number = 0;

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

  public resize(width: number, height: number): void {
    // Store the new dimensions
    this.internalWidth = width;
    this.internalHeight = height;

    // Redraw the health bar
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

    const iconSize = this.internalHeight * 0.8;
    this.icon.height = iconSize;

    const iconAspectRatio = this.icon.texture.orig.width / this.icon.texture.orig.height;
    this.icon.width = iconSize * iconAspectRatio;
    this.icon.position.set(0, (this.internalHeight - iconSize) / 2);
    this.icon.texture.source.scaleMode = "nearest";

    const totalBarWidth = this.internalWidth - this.icon.width - this.iconMargin;

    const barHeight = this.internalHeight * 0.6;
    const barY = (this.internalHeight - barHeight) / 2;
    const barXStart = this.icon.width + this.iconMargin;

    const healthPercentage = this.currentHealth / this.maxHealth;
    const filledBarsCount = Math.ceil(healthPercentage * this.barCount);

    for (let i = 0; i < this.barCount; i++) {
      const isFilled = i < filledBarsCount;
      const barTexture = isFilled ? Texture.from("lifeFull.png") : Texture.from("lifeEmpty.png");
      barTexture.source.scaleMode = "nearest";

      const bar = new Sprite(barTexture);

      bar.height = barHeight;
      const barAspectRatio = barTexture.orig.width / barTexture.orig.height;
      const aspectBasedWidth = barHeight * barAspectRatio;

      bar.width = aspectBasedWidth;

      const baseSpacing = totalBarWidth / this.barCount;
      bar.position.set(barXStart + i * baseSpacing, barY);

      this.addChild(bar);

      if (isFilled) {
        this.healthBars.push(bar);
      }
    }
  }
}
