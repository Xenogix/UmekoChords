import { SplendidGrandPiano } from "smplr";

export type NoteStopCallback = (time?: number) => void;

export class SoundPlayer {
  private audioContext = new AudioContext();
  private instrument: SplendidGrandPiano = new SplendidGrandPiano(this.audioContext);
  private isInitialized = false;

  /**
   * Initialize the sound player and load the instrument
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }
    await this.instrument.loaded();
    this.isInitialized = true;
  }

  /**
   * Ensure the audio context is running
   */
  public async resumeAudio(): Promise<void> {
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }

  /**
   * Play a note at the current time or at a scheduled time
   */
  public playNote(
    midiNote: number,
    duration?: number,
    when?: number,
  ): NoteStopCallback | undefined {
    // Ensure the player is initialized
    if (!this.isInitialized) {
      console.warn("SoundPlayer not initialized");
      return undefined;
    }

    // Calculate when to play
    const startTime = when !== undefined ? when : this.audioContext.currentTime;

    // Play the note
    return this.instrument.start({
      note: midiNote,
      time: startTime,
      duration: duration,
    });
  }
}
