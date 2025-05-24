import { Container } from 'pixi.js';
import { MusicRenderer } from './MusicRenderer.ts';
import { Factory } from 'vexflow';

/**
 * Measure class that represents a musical measure in the game.
 * It uses VexFlow to render musical notation based on the provided notes and properties.
 */
export class Measure extends Container {

    // Private properties
    private _width: number = 0;
    private _musicRenderer: MusicRenderer;
    private _rendererScale: number = 2;

    // Default musical properties
    private _notes: string[] = [];
    private _clef: string = 'treble';
    private _timeSignature: string = '4/4';
    private _tempo: number = 80;
    
    constructor() {
        super();
        this._musicRenderer = new MusicRenderer(this.musicRendererCallback.bind(this));
        this.addChild(this._musicRenderer);
    }

    public resize(width: number, height: number) {
        this._width = width;
        this._musicRenderer.render(width, height);
    }

    public getNotes(): string[] {
        return this._notes;
    }

    public setNotes(notes: string[]): void {
        this._notes = notes;
    }

    public getClef(): string {
        return this._clef;
    }

    public setClef(clef: string): void {
        this._clef = clef;
    }

    public getTimeSignature(): string {
        return this._timeSignature;
    }

    public setTimeSignature(timeSignature: string): void {
        this._timeSignature = timeSignature;
    }

    public getTempo(): number {
        return this._tempo;
    }

    public setTempo(tempo: number): void {
        this._tempo = tempo;
    }

    /**
     * Callback function to configure the VexFlow factory with the current musical properties.
     */
    private musicRendererCallback(factory: Factory): void {

        // Get voices from the notes
        const score = factory.EasyScore();
        const voices = this._notes.map(_notes => { return score.voice(score.notes(_notes, { stem: 'up' }));});

        // Set the scale for rendering as the default scale is too small
        factory.getContext().scale(this._rendererScale, this._rendererScale);

        // Configure the factory with the generated voices
        factory.getContext().clear();
        factory.System({ width: this._width, x: 0, y: 0 })
        .addStave({ voices: voices })
        .setStyle({ fillStyle: '#ffffff', strokeStyle: '#ffffff' })
        .addClef(this._clef)
        .addTimeSignature(this._timeSignature)
        .setTempo({ bpm: this._tempo }, 0);
    }
}