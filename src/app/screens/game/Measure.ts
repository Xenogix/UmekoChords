import { Container, Graphics } from 'pixi.js';
import { MusicRenderer } from './MusicRenderer.ts';

export class Measure extends Container {

    private graphics: Graphics;
    private musicRenderer: MusicRenderer;

    constructor() {
        super();

        this.musicRenderer = new MusicRenderer();
        this.addChild(this.musicRenderer);

        this.graphics = new Graphics();
        this.addChild(this.graphics);
    }

    public resize(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.musicRenderer.width = width;

        this.graphics.clear();
        this.graphics.rect(0, 0, width, height).fill(0xFFFFFF, 0.5);
    }

    // Method to add notes to the measure
    public setNotes(notes: string) {
        if (!notes.endsWith('|')) {
            notes = notes + '|';
        }
        
        const abcNotation = this.getDefaultNotation() + notes;
        this.musicRenderer.setNotation(abcNotation);
    }

    private getDefaultNotation(): string {
        return `
X: 1
K: clef=treble
M: 4/4
L: 1/4
|`;
    }
}