import { Container, Graphics } from 'pixi.js';

export class Measure extends Container {

    private static readonly LINE_COUNT = 5;
    private static readonly LINE_THICKNESS = 10;
    private static readonly COLOR = 0xffffff; // White

    private graphics: Graphics;

    constructor() {
        super();
        this.graphics = new Graphics();
        this.addChild(this.graphics);
    }

    public resize(width: number, height: number) {

        this.graphics.clear();

        // Draw the measure lines
        for (let i = 1; i < Measure.LINE_COUNT; i++) {
            const y = (height / Measure.LINE_COUNT) * i;
            this.graphics.rect(0, y, width, Measure.LINE_THICKNESS).fill(Measure.COLOR);
        }
    }
}