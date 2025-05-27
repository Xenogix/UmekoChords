import { Container } from "pixi.js";
import { MusicRenderer } from "./MusicRenderer.ts";
import { Factory } from "vexflow";
import { AttackNotationConverter } from "../../game/attacks/AttackToVexflowConverter.ts";
import { Attack } from "../../game/attacks/Attacks.ts";

/**
 * Measure class that represents a musical measure in the game.
 * It uses VexFlow to render musical notation based on the provided notes and properties.
 */
export class Measure extends Container {

  // Default musical properties
  private attack: Attack | undefined = undefined;
  private clef: string = "treble";
  private timeSignature: string = "4/4";
  private tempo: number = 60;

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

  public setAttack(attack: Attack) {
    this.attack = attack;
    this.musicRenderer.render(this.internalWidth, this.internalHeight);
  }
  /**
   * Callback function to configure the VexFlow factory with the current musical properties.
   */
  private musicRendererCallback = (factory: Factory): void => {

    // Generate voices based on the attack
    const voices = this.attack ? [AttackNotationConverter.createNotesFromAttack(factory, this.attack)] : [];
    
    factory
      .System({ width: this.internalWidth, x: 0, y: 0 })
      .addStave({ voices: voices })
      .setStyle({ fillStyle: "#000000", strokeStyle: "#000000" })
      .addClef(this.clef)
      .addTimeSignature(this.timeSignature)
      .setTempo({ bpm: this.tempo }, 0);
  };
}
