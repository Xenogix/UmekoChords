import { Container, Graphics, NineSliceSprite, Sprite, Texture } from "pixi.js";

export class HealthBar extends Container {

  private healthBar: NineSliceSprite;
  private healthBarFill: NineSliceSprite;

  private maxHealth: number = 100;
  private currentHealth: number = 100;
  private internalWidth: number = 0;
  private internalHeight: number = 0;

  constructor() {
    super();

    // Create the health bar background
    this.healthBar = new NineSliceSprite({
      texture: Texture.from("healthBar.png"),
      width: 32,
      height: 32,
      leftWidth: 15,
      rightWidth: 15,
      topHeight: 15,
      bottomHeight: 15,
    });
    this.addChild(this.healthBar);

    // Create the health bar fill
    this.healthBarFill = new NineSliceSprite({
      texture: Texture.from("healthBarFill.png"),
      width: 32,
      height: 32,
      leftWidth: 15,
      rightWidth: 15,
      topHeight: 15,
      bottomHeight: 15,
    });
    this.addChild(this.healthBarFill);

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
    // Resize the health bar background
    this.healthBar.width = this.internalWidth;
    this.healthBar.height = this.internalHeight;

    // Resize the health bar fill
    const fillWidth = Math.min(Math.max(this.currentHealth / this.maxHealth, 0), 1) * this.internalWidth;
    this.healthBarFill.width = fillWidth;
    this.healthBarFill.height = this.internalHeight;
  }
}