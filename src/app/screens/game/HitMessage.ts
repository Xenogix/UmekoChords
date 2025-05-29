import { BitmapText, Ticker } from "pixi.js";
import { AttackAccuracy } from "../../game/attacks/AttackResolver";

export class HitMessage extends BitmapText {

    private readonly messageDuration: number = 500;
    private readonly fadeInDuration: number = 100;
    private readonly holdDuration: number = 300;

    private messageTimer: number = 0;
    private accuracy: AttackAccuracy | undefined
    private isActive: boolean = false;
    private targetPosition: {x: number, y: number} = {x: 0, y: 0};

    public constructor() {
        super();

        this.style = {
            fontFamily: 'CutePixel',
            fontSize: 30,
            align: 'center'
        }
        this.alpha = 0;
        this.anchor.set(0.5, 0.5);
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
            this.y -= ticker.deltaMS * 0.05;
        } else {
            this.isActive = false;
            this.alpha = 0;
        }
    }

    public showMessage(accuracy: AttackAccuracy): void {
        this.accuracy = accuracy;
        this.messageTimer = 0;
        this.isActive = true;
        
        this.position.set(this.targetPosition.x, this.targetPosition.y);
        
        switch(accuracy) {
            case 'perfect':
                this.style.fontSize = 36;
                this.scale.set(0.8);
                break;
            case 'good':
                this.style.fontSize = 30;
                this.scale.set(0.85);
                break;
            default:
                this.style.fontSize = 28;
                this.scale.set(0.9);
                break;
        }
        
        this.updateText();
    }

    private updateText(): void {
        switch(this.accuracy)
        {
            case 'perfect':
                this.text = "Perfect";
                this.tint = 0xFFD700;
                break;
            case 'good':
                this.text = "Good";
                this.tint = 0x00FF00;
                break;
            case 'miss':
            case 'error':
                this.text = "Miss";
                this.tint = 0xFF0000;
                break;
        }
    }
}