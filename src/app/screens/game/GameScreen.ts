import { Container } from 'pixi.js';
import { Measure } from './Measure';

export class GameScreen extends Container {

    public static assetBundles = ["game"];

    private measure: Measure;

    constructor() {
        super();

        this.measure = new Measure();
        this.addChild(this.measure);
    }

    public resize(width: number, height: number) {
        this.measure.resize(width - 100, height * 0.2);
        this.measure.x = width / 2 - this.measure.width / 2;
        this.measure.y = height / 2 - this.measure.height / 2;
    }
}