import { SplendidGrandPiano } from "smplr";
import { userSettings } from "../../utils/userSettings";
import { engine } from "../../getEngine";
import { Assets } from "pixi.js";
import { sound } from "@pixi/sound";

export type NoteStopCallback = (time?: number) => void;

export class SoundPlayer {
  private audioContext = new AudioContext();
  private instrument: SplendidGrandPiano = new SplendidGrandPiano(
    this.audioContext,
  );
  private isInitialized = false;

  /**
   * Initialize the sound player and load the instrument
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    await this.instrument.load;
    await this.resumeAudio();
    sound.add("tick", Assets.get("tick.wav"));
    sound.add("tick-strong", Assets.get("tick-strong.wav"));
    this.isInitialized = true;
  }

  /**
   * Play a note at the current time or at a scheduled time
   */
  public playNote(
    midiNote: number,
    duration?: number,
    time?: number,
  ): NoteStopCallback | undefined {
    // Ensure the player is initialized
    if (!this.isInitialized) {
      console.warn("SoundPlayer not initialized");
      return undefined;
    }

    // Update the volume of the instrument
    this.instrument.output.setVolume(userSettings.getSfxVolume() * userSettings.getMasterVolume() * 100);
    
    // Calculate when to play
    const startTime =
      time !== undefined
        ? this.audioContext.currentTime + time
        : this.audioContext.currentTime;

    // Play the note
    return this.instrument.start({
      note: midiNote,
      time: startTime,
      duration: duration,
    });
  }

  /**
   * Play a metronome tick sound
   */
  public playTick(strong: boolean): void {
    // Ensure the player is initialized
    if (!this.isInitialized) {
      console.warn("SoundPlayer not initialized");
      return;
    }

    if(!strong) {
      engine().audio.sfx.play("tick");
    } else {
      engine().audio.sfx.play("tick-strong");
    }
  }

  /**
   * Ensure the audio context is running
   */
  private async resumeAudio(): Promise<void> {
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }
}
