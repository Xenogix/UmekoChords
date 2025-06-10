import { BitmapText, Container } from "pixi.js";
import { animate } from "motion";
import { AttackAccuracy } from "../game/attacks/AttackResolver";

export class HitMessage extends Container {
  private readonly messageDuration: number = 500;
  private readonly fadeInDuration: number = 100;
  private readonly holdDuration: number = 300;

  public constructor() {
    super();
  }

  public showMessage(accuracy: AttackAccuracy): void {
    // Remove any existing message
    this.removeChildren();

    const messageToAnimate = new BitmapText();
    this.addChild(messageToAnimate);

    messageToAnimate.style = {
      fontFamily: "CutePixel",
      fontSize: 30,
      align: "center",
    };

    switch (accuracy) {
      case "perfect":
        messageToAnimate.style.fontSize = 42;
        messageToAnimate.style.fill = 0xffd700;
        messageToAnimate.text = "Perfect";
        break;
      case "good":
        messageToAnimate.style.fontSize = 40;
        messageToAnimate.style.fill = 0x42ff42;
        messageToAnimate.text = "Good";
        break;
      case "poor":
        messageToAnimate.style.fontSize = 38;
        messageToAnimate.style.fill = 0xeb8034;
        messageToAnimate.text = "Poor";
        break;
      case "error":
        messageToAnimate.style.fontSize = 34;
        messageToAnimate.style.fill = 0xd62929;
        messageToAnimate.text = "Miss";
        break;
    }

    messageToAnimate.anchor.set(0.5);
    messageToAnimate.x = 0;
    messageToAnimate.y = 0;
    messageToAnimate.alpha = 0;

    // Fade in and scale
    animate(
      messageToAnimate,
      { alpha: 1 },
      {
        duration: this.fadeInDuration / 1000,
        ease: "linear",
      },
    );

    // Hold then fade out and move up
    setTimeout(() => {
      Promise.all([
        animate(
          messageToAnimate,
          { alpha: 0 },
          {
            duration: (this.messageDuration - this.fadeInDuration - this.holdDuration) / 1000,
            ease: "linear",
          },
        ).finished,
        animate(
          messageToAnimate,
          { y: -20 },
          {
            duration: (this.messageDuration - this.fadeInDuration - this.holdDuration) / 1000,
            ease: "linear",
          },
        ).finished,
      ]).then(() => {
        this.removeChild(messageToAnimate);
        messageToAnimate.destroy();
      });
    }, this.fadeInDuration + this.holdDuration);
  }
}
