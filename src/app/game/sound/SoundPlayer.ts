import { SplendidGrandPiano } from "smplr";

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
   * Ensure the audio context is running
   */
  private async resumeAudio(): Promise<void> {
    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }
  }
}
