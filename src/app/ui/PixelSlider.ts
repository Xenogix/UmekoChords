import { Slider } from "@pixi/ui";
import { Assets, BitmapText, NineSliceSprite, Sprite } from "pixi.js";

export class PixelSlider extends Slider {

  private bitmapText: BitmapText;

  constructor(text: string, min = 0, max = 100, value = 100, width = 40, height = 5) {

    const background = new NineSliceSprite({
      texture: Assets.get("slider_background.png"),
      leftWidth: 7,
      rightWidth: 7,
      topHeight: 7,
      bottomHeight: 7,
    });
    background.width = width;
    background.height = height;

    const fill = new NineSliceSprite({
      texture: Assets.get("slider_fill.png"),
      leftWidth: 7,
      rightWidth: 7,
      topHeight: 7,
      bottomHeight: 7,
    });
    fill.height = height;
    fill.width = width;

    const handle =  new Sprite(Assets.get("slider_handle.png"));
    handle.width = height;
    handle.height = height;

    super({bg: background, fill: fill, slider: handle, min, max, value });

    this.bitmapText = new BitmapText({ 
      text: text, 
      style: {
      fontFamily: "CutePixel",
      fontSize: 4,
      align: "center",
    }});
    this.bitmapText.anchor.set(0.5);
    this.bitmapText.x = width / 2;
    this.bitmapText.y = -1;
    this.addChild(this.bitmapText);
  }
}