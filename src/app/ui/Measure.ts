import { Container } from "pixi.js";
import { MusicRenderer } from "./MusicRenderer.ts";
import { Factory } from "vexflow";
import { Attack } from "../game/attacks/Attacks.ts";
import { AttackNotationConverter } from "../game/attacks/AttackToVexflowConverter.ts";

/**
 * Measure class that represents a musical measure in the game.
 * It uses VexFlow to render musical notation based on the provided notes and properties.
 */
export class Measure extends Container {
  // Default musical properties
  private attack: Attack | undefined = undefined;
  private clef: string = "treble";
  private tempo: number = 60;

  private musicRenderer: MusicRenderer;
  private internalWidth: number = 500;

  constructor() {
    super();

    this.musicRenderer = new MusicRenderer(this.musicRendererCallback);
    this.addChild(this.musicRenderer);
    this.pivot.x = this.internalWidth * 0.5;
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
    const timeSignature = this.attack ? this.attack.getTimeSignatureNumerator() + "/" + this.attack.getTimeSignatureDenominator() : "4/4";
    const voices = this.attack ? AttackNotationConverter.createNotesFromAttack(factory, this.attack) : [];

    factory
      .System({ width: this.internalWidth }) // Pass width to system
      .addStave({
        voices: voices,
      })
      .setTimeSignature(timeSignature)
      .setStyle({ fillStyle: "#FFFFFF", strokeStyle: "#FFFFFF" })
      .addClef(this.clef)
      .setTempo({ bpm: this.tempo }, 0)
      .format();
  };
}
