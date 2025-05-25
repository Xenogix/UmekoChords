import Soundfont, { InstrumentName, Player } from "soundfont-player";

export class SoundPlayer {
  private audioContext = new AudioContext();
  private instruments: Map<InstrumentName, Player> = new Map();
  private isInitialized = false;

  public async initialize(): Promise<void> {
    await this.resumeAudio();

    // Define the instruments to load
    const instrumentsToLoad: InstrumentName[] = ["acoustic_grand_piano", "acoustic_guitar_nylon"];

    // Load each instrument
    const loadPromises = instrumentsToLoad.map(async (name) => {
      try {
        const player = await Soundfont.instrument(this.audioContext, name);
        this.instruments.set(name, player);
        console.log(`Loaded instrument: ${name}`);
      } catch (error) {
        console.error(`Failed to load instrument: ${name}`, error);
      }
    });

    await Promise.all(loadPromises);
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
    duration: number,
    instrumentName: InstrumentName,
    when?: number,
  ): void {
    if (!this.isInitialized) {
      console.warn("SoundPlayer not initialized");
      return;
    }

    const player = this.instruments.get(instrumentName);
    if (!player) {
      console.warn(`Instrument ${instrumentName} not loaded`);
      return;
    }

    // Calculate when to play
    const startTime = when !== undefined ? when : this.audioContext.currentTime;

    // Play the note
    player.play(midiNote.toString(), startTime, { duration });
  }

  /**
   * Stop all currently playing notes
   */
  public stopAll(): void {
    this.instruments.forEach((player) => player.stop());
  }

  /**
   * Get the current time from the audio context
   */
  public getCurrentTime(): number {
    return this.audioContext.currentTime;
  }
}
