import { Sprite, Texture } from "pixi.js";

export class Player extends Sprite {
  protected spriteSheetResource: string = "player.png";

  constructor() {
    super();
    this.texture = Texture.from(this.spriteSheetResource);
  }
}