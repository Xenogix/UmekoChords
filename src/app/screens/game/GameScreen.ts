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
        this.measure.resize(width - 100, 100);
        this.measure.x = 50;
        this.measure.y = height / 2 - 50;
    }
}