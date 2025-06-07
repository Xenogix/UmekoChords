import { FancyButton } from "@pixi/ui";

import { BitmapText } from "pixi.js";

interface ButtonOptions {
  text: string;
  icon: string;
  fontSize?: number;
  width?: number;
  height?: number;
}

export class PixelButton extends FancyButton {
  constructor(options: Partial<ButtonOptions> = {}) {
    super({
      defaultView: "button.png",
      nineSliceSprite: [7, 7, 7, 7],
      anchor: 0.5,
      icon: options.icon,
      defaultIconScale: 0.2,
      text: new BitmapText({
        text: options.text,
        style: {
          fontFamily: "CutePixel",
          fontSize: options.fontSize || 5,
          fill: 0x0,
        },
      }),
      textOffset: { x: 0, y: -0.2 },
      defaultTextAnchor: 0.5,
      scale: 0.9,
      animations: {
        hover: {
          props: {
            scale: { x: 1.03, y: 1.03 },
          },
          duration: 100,
        },
        pressed: {
          props: {
            scale: { x: 0.97, y: 0.97 },
          },
          duration: 100,
        },
      },
    });

    this.width = options.width || 25;
    this.height = options.height || 8;

    this.onDown.connect(this.handleDown.bind(this));
    this.onHover.connect(this.handleHover.bind(this));
  }

  private handleHover() {
    //engine().audio.sfx.play("main/sounds/sfx-hover.wav");
  }

  private handleDown() {
    //engine().audio.sfx.play("main/sounds/sfx-press.wav");
  }
}
