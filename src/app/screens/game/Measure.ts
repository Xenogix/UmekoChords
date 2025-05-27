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
  private internalWidth: number = 0;
  private internalHeight: number = 0;
  private musicRenderer: MusicRenderer;

  constructor() {
    super();

    this.musicRenderer = new MusicRenderer(this.musicRendererCallback);
    this.addChild(this.musicRenderer);
  }

  public resize(width: number, height: number) {
    this.internalWidth = width;
    this.internalHeight = height;
    this.musicRenderer.render(width, height);
  }

  public updateRenderer(): void {
    this.musicRenderer.render(this.internalWidth, this.internalHeight);
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

    // Configure the factory with the generated voices
    factory
      .System({ width: this.internalWidth, x: 0, y: 0 })
      .addStave({ voices: voices })
      .setStyle({ fillStyle: "#000000", strokeStyle: "#000000" })
      .addClef(this.clef)
      .addTimeSignature(this.timeSignature)
      .setTempo({ bpm: this.tempo }, 0);
  };
}
