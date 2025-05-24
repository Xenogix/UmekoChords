import { Container } from "pixi.js";
import { MusicRenderer } from "./MusicRenderer.ts";
import { Factory } from "vexflow";

/**
 * Measure class that represents a musical measure in the game.
 * It uses VexFlow to render musical notation based on the provided notes and properties.
 */
export class Measure extends Container {
  // Default musical properties
  public notes: string[] = [];
  public clef: string = "treble";
  public timeSignature: string = "4/4";
  public tempo: number = 80;

  // Private properties
  private _width: number = 0;
  private _height: number = 0;
  private _musicRenderer: MusicRenderer;
  private _rendererScale: number = 2;

  constructor() {
    super();

    this._musicRenderer = new MusicRenderer(this.musicRendererCallback);
    this.addChild(this._musicRenderer);
  }

  public resize(width: number, height: number) {
    this._width = width;
    this._musicRenderer.render(width, height);
  }

  public updateRenderer(): void {
    this._musicRenderer.render(this._width, this._height);
  }

  /**
   * Callback function to configure the VexFlow factory with the current musical properties.
   */
  private musicRendererCallback = (factory: Factory): void => {
    // Get voices from the notes
    const score = factory.EasyScore();
    const voices = this.notes.map((notes) => {
      return score.voice(score.notes(notes, { stem: "up" }));
    });

    // Set the scale for rendering as the default scale is too small
    factory.getContext().scale(this._rendererScale, this._rendererScale);

    // Configure the factory with the generated voices
    factory.getContext().clear();
    factory
      .System({ width: this._width, x: 0, y: 0 })
      .addStave({ voices: voices })
      .setStyle({ fillStyle: "#ffffff", strokeStyle: "#ffffff" })
      .addClef(this.clef)
      .addTimeSignature(this.timeSignature)
      .setTempo({ bpm: this.tempo }, 0);
  };
}
