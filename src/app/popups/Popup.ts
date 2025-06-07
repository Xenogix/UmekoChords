import { BitmapText, BlurFilter, Container, Sprite, Texture } from "pixi.js";
import { engine } from "../getEngine";
import { animate } from "motion";

export class Popup extends Container {

  protected background: Sprite;
  protected content: Container;
  protected title: BitmapText;

  constructor() {
      super();
  
      this.background = new Sprite(Texture.WHITE);
      this.background.tint = 0x0;
      this.background.interactive = true;
      this.background.width = engine().resizeOptions.pixelWidth;
      this.background.height = engine().resizeOptions.pixelHeight;
      this.addChild(this.background);
  
      this.content = new Container();
      this.content.x = engine().resizeOptions.pixelWidth / 2;
      this.addChild(this.content);
  
      this.title = new BitmapText({ text: "Paused", style: { 
        fontFamily: "CutePixel",
        fill: 0xffffff,
        fontSize: 12
      }});
      this.title.anchor.set(0.5, 0);
      this.title.y = 4;
      this.content.addChild(this.title);
    }

  /** Apply a blur filter to the current screen */
  public async show() {
    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [
        new BlurFilter({ strength: 4 }),
      ];
    }

    this.background.alpha = 0;
    this.content.pivot.y = -100;
    animate(this.background, { alpha: 0.8 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.content.pivot,
      { y: 0 },
      { duration: 0.3, ease: "backOut" },
    );
  }

  public async hide() {
    const currentEngine = engine();
    if (currentEngine.navigation.currentScreen) {
      currentEngine.navigation.currentScreen.filters = [];
    }
    animate(this.background, { alpha: 0 }, { duration: 0.2, ease: "linear" });
    await animate(
      this.content.pivot,
      { y: -100 },
      { duration: 0.3, ease: "backIn" },
    );
  }
}