import { Container, Graphics } from 'pixi.js';
import { Measure } from './Measure';

export class GameScreen extends Container {

    private measure: Measure;

    constructor() {
        super();
        this.measure = new Measure();
        this.addChild(this.measure);
    }

    public resize(width: number, height: number) {
        this.measure.resize(width - 200, height - 200);
    }
}