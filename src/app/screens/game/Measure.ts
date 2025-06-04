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

  private musicRenderer: MusicRenderer;
  private _width: number = 500;

  constructor() {
    super();

    this.musicRenderer = new MusicRenderer(this.musicRendererCallback);
    this.addChild(this.musicRenderer);
    this.pivot.x = this._width * 0.5;
  }

  public setAttack(attack: Attack) {
    this.attack = attack;
    this.musicRenderer.render();
  }

  /**
   * Callback function to configure the VexFlow factory with the current musical properties.
   */
  private musicRendererCallback = (factory: Factory): void => {
    // Generate voices based on the attack
    var voices = this.attack ? AttackNotationConverter.createNotesFromAttack(factory, this.attack) : [];

    factory
      .System({ width: this._width }) // Pass width to system
      .addStave({ 
        voices: voices,
      })
      .setStyle({ fillStyle: "#FFFFFF", strokeStyle: "#FFFFFF" }) 
      .addClef(this.clef)
      .addTimeSignature(this.timeSignature)
      .setTempo({ bpm: this.tempo }, 0)
      .format();
  };
}