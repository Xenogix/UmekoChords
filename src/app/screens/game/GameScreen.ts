import { Container, FillGradient, Graphics, Ticker } from 'pixi.js';
import { Measure } from './Measure';
import { Piano } from './Piano';

export class GameScreen extends Container {

    public static assetBundles = ["game"];

    private readonly measureHeight: number = 200;
    private readonly maxMeasureWidth: number = 800;
    private readonly pianoHeight: number = 150;
    private readonly maxPianoWidth: number = 1200;
    private readonly padding_x: number = 100;

    private _width: number = 0;
    private _height: number = 0;

    private _background: Graphics = new Graphics();
    private _measure: Measure;
    private _piano: Piano;

    private _backgroundColor: number = 0x1e1e1e;
    private _wavePhase: number = 0;
    private _waveSpeed: number = 0.01;
    private _waveCount: number = 10;
    private _waveAmplitude: number = 20;
    private _waveSpacing: number = 50;
    private _waveWidth: number = 4;
    private _waveShearing: number = 0.2;
    private _waveGradient = new FillGradient({
        type: 'linear',
        colorStops: [
            { offset: 0, color: 0xFF40F9 },
            { offset: 0.33, color: 0xFF4040 },
            { offset: 1, color: 0xFFD557 },
        ],
    });

    constructor() {
        super();

        this._background = new Graphics();
        this.addChild(this._background);

        this._measure = new Measure();
        this.addChild(this._measure);

        this._piano = new Piano();
        this.addChild(this._piano);

    }

    public resize(width: number, height: number) {

        // Store the new dimensions
        this._width = width;
        this._height = height;
        
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
        this.drawWavyBackground();
    }

    public update(_time: Ticker) {
        // Update wave phase for animation
        this._wavePhase += this._waveSpeed * _time.deltaTime;

        // Redraw waves with new phase
        this.drawWavyBackground();
    }

    private drawWavyBackground() {
        // Clear previous graphics
        this._background.clear();

        // Main background - light color
        this._background.rect(0, 0, this._width, this._height).fill(this._backgroundColor);
        
        // Center point for the waves
        const centerY = this._height / 2;

        // Make the waves semi-transparent to enhance visibility
        this._background.alpha = 0.2;

        for (let w = 0; w < this._waveCount; w++) {
            
            // Start from left edge at the vertical center position
            const relativeVerticalOffset = (w - (this._waveCount - 1) / 2);
            const waveY = centerY + w - relativeVerticalOffset * this._waveSpacing;
            this._background.moveTo(-100, waveY);
            
            // The phase offset creates the animation
            const shearingFactor = (this._waveShearing + 1) * (Math.abs((relativeVerticalOffset + 1) / this._waveCount) + 1);
            const waveOffset = this._wavePhase * shearingFactor + w * 0.7;

            // Draw the wave
            for (let i = 0; i <= this._width; i += 10) {
                const y = waveY + Math.sin(i * 0.01 + waveOffset) * this._waveAmplitude;
                this._background.lineTo(i, y);
            }
            
            // Draw the wave with stroke and fill
            this._background.stroke({ 
                width: this._waveWidth, 
                alpha: 0.7,
                fill: this._waveGradient
            });
        }
    }
}