import { BitmapText, Container, Ticker } from "pixi.js";
import { AttackAccuracy } from "../../game/attacks/AttackResolver";

export class HitMessage extends Container {

    private readonly messageDuration: number = 500;
    private readonly fadeInDuration: number = 100;
    private readonly holdDuration: number = 300;

    private messageTimer: number = 0;
    private accuracy: AttackAccuracy | undefined
    private isActive: boolean = false;
    private bitmapText: BitmapText = new BitmapText();

    public constructor() {
        super();
    }

    public update(ticker: Ticker): void {
        if (!this.isActive) return;

        this.messageTimer += ticker.deltaMS;
        
        if (this.messageTimer <= this.fadeInDuration) {
            this.alpha = this.messageTimer / this.fadeInDuration;
            this.scale.set(0.8 + (0.2 * this.alpha));
        } else if (this.messageTimer <= this.fadeInDuration + this.holdDuration) {
            this.alpha = 1;
        } else if (this.messageTimer <= this.messageDuration) {
            const fadeProgress = (this.messageTimer - this.fadeInDuration - this.holdDuration) / 
                                (this.messageDuration - this.fadeInDuration - this.holdDuration);
            this.alpha = 1 - fadeProgress;
            this.bitmapText.y -= ticker.deltaMS * 0.05;
        } else {
            this.isActive = false;
            this.alpha = 0;
        }
    }

  public showMessage(accuracy: AttackAccuracy): void {
    this.accuracy = accuracy;
    this.messageTimer = 0;
    this.isActive = true;

    if (this.bitmapText) {
        this.removeChild(this.bitmapText);
        this.bitmapText.destroy();
    }

    this.bitmapText = new BitmapText();
    this.alpha = 0;
    this.bitmapText.style = {
        fontFamily: 'CutePixel',
        fontSize: 30,
        align: 'center',
    }
    this.bitmapText.anchor.set(0.5, 0.5);

    switch (accuracy) {
        case 'perfect':
            this.bitmapText.style.fontSize = 36;
            this.bitmapText.style.fill = 0xFFD700;
            this.bitmapText.text = "Perfect";
            break;
        case 'good':
            this.bitmapText.style.fontSize = 34;
            this.bitmapText.style.fill = 0x00FF00;
            this.bitmapText.text = "Good";
            break;
        case 'poor':
            this.bitmapText.style.fontSize = 34;
            this.bitmapText.style.fill = 0xFFAA00;
            this.bitmapText.text = "Poor";
            break;
        case 'error':
            this.bitmapText.style.fontSize = 28;
            this.bitmapText.style.fill = 0xFF0000;
            this.bitmapText.text = "Miss";
            break;
    }

    this.addChild(this.bitmapText);
  }
}