import { Container } from 'pixi.js';
import { Measure } from './Measure';

export class GameScreen extends Container {

    public static assetBundles = ["game"];

    private measure: Measure;

    constructor() {
        super();

        this.measure = new Measure();
        this.addChild(this.measure);

        this.measure.setNotes("[CEG]1 [FAC]1 [CEG]1 [FAC]0.5 [CEG]0.5 [FAC]0.5");
    }

    public resize(width: number, height: number) {
        this.measure.resize(600, 200);
        this.measure.x = width / 2 - this.measure.width / 2;
        this.measure.y = height / 2 - this.measure.height / 2;
    }
}