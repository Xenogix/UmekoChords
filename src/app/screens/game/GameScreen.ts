import { Container, Ticker } from 'pixi.js';
import { Measure } from './Measure';
import { Piano } from './Piano';
import { WaveBackground } from '../../ui/WaveBackground';

export class GameScreen extends Container {

    // Asset bundles
    public static assetBundles = ["game"];

    // Layout constants
    private readonly measureHeight: number = 200;
    private readonly maxMeasureWidth: number = 800;
    private readonly pianoHeight: number = 150;
    private readonly maxPianoWidth: number = 1200;
    private readonly padding_x: number = 100;

    // Private properties
    private _background: WaveBackground;
    private _measure: Measure;
    private _piano: Piano;

    constructor() {
        super();

        this._background = new WaveBackground();
        this.addChild(this._background);

        this._measure = new Measure();
        this.addChild(this._measure);

        this._piano = new Piano();
        this.addChild(this._piano);
    }

    public update(tick: Ticker) {
        // Update the background
        this._background.update(tick);
    }

    public resize(width: number, height: number) {

        // Resize the measure
        const measureWidth = Math.min(width - this.padding_x, this.maxMeasureWidth);
        this._measure.resize(measureWidth, this.measureHeight);
        this._measure.x = (width - measureWidth) / 2;
        this._measure.y = (height - this.measureHeight) / 2;

        // Resize the piano
        const pianoWidth = Math.min(width - this.padding_x, this.maxPianoWidth);
        this._piano.resize(pianoWidth, this.pianoHeight);
        this._piano.x = (width - pianoWidth) / 2;
        this._piano.y = height - this.pianoHeight;

        // Resize the background
        this._background.resize(width, height);
    }
}