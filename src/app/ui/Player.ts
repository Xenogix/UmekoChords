import { Assets, Sprite, Texture, Ticker } from "pixi.js";

export class Player extends Sprite {
  // Limit the number of animations to avoid performance issues
  private readonly animationSwitchDelayMs: number = 100;
  private animationWaitMs: number = 0;

  private textures: Texture[] = Assets.get("player.json").textures;
  private currentIndex: number = 0;

  constructor() {
    super();
    const texturesObj = Assets.get("player.json").textures;
    const texturesArr = Array.isArray(texturesObj) ? texturesObj : Object.values(texturesObj);
    this.textures = texturesArr;
    this.setNewAnimation();
  }

  public update(ticker: Ticker): void {
    if (this.animationWaitMs > 0) {
      this.animationWaitMs -= ticker.deltaMS;
    }
  }

  public setNewAnimation(): void {
    if (this.animationWaitMs > 0) {
      return;
    }
    // Get a random texture from the player sprite sheet
    this.animationWaitMs = this.animationSwitchDelayMs;
    let randomIndex = Math.floor(Math.random() * (this.textures.length - 1));

    // Ensure the new texture is different from the current one
    if (randomIndex === this.currentIndex) {
      randomIndex = (randomIndex + 1) % this.textures.length;
    }

    this.currentIndex = randomIndex;
    this.texture = this.textures[randomIndex];
  }
}
