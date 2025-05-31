import { Container, NineSliceSprite, Texture } from "pixi.js";

export class SmallHealthBar extends Container {

  private readonly healthBarBackground: NineSliceSprite;
  private readonly healthBarForeground: NineSliceSprite;

  private maxHealth: number = 100;
  private currentHealth: number = 100;

  private internalWidth: number = 0;
  private internalHeight: number = 0;

  constructor() {
    super();
    const healthBarBackgroundTexture = Texture.from("smallHealthBarBackground.png");
    healthBarBackgroundTexture.source.scaleMode = "nearest";
    this.healthBarBackground = new NineSliceSprite({
      texture: healthBarBackgroundTexture,
      leftWidth: 13,
      rightWidth: 2,
      topHeight: 16,
      bottomHeight: 0,
      width: 16,
      height: 16,
    });

    const healthBarForegroundTexture = Texture.from("smallHealthBarForeground.png");
    healthBarForegroundTexture.source.scaleMode = "nearest";
    this.healthBarForeground = new NineSliceSprite({
      texture: healthBarForegroundTexture,
      leftWidth: 13,
      rightWidth: 2,
      topHeight: 16,
      bottomHeight: 0,
      width: 16,
      height: 16,
    });

    this.addChild(this.healthBarBackground);
    this.addChild(this.healthBarForeground);
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
    // Calculate the width of the foreground based on current health
    const healthRatio = this.currentHealth / this.maxHealth;
    const foregroundWidth = Math.max(0, Math.min(this.internalWidth * healthRatio, this.internalWidth));

    // Update the size and position of the background
    this.healthBarBackground.width = this.internalWidth;
    this.healthBarBackground.height = this.internalHeight;

    // Update the size and position of the foreground
    this.healthBarForeground.width = foregroundWidth;
    this.healthBarForeground.height = this.internalHeight;
  }
}
