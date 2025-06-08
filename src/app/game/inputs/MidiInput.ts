import { GameInput, GameInputEventType } from "./GameInput";

/**
 * Handles MIDI input for the game
 * This class uses the Web MIDI API to listen for MIDI events
 * Inspired from Daniel Schulz : https://iamschulz.com/building-a-midi-instrument-in-typescript
 */
export class MidiInput extends GameInput {
  private midiAccess?: MIDIAccess;

  public start(): void {
    if (!navigator.requestMIDIAccess()) {
      throw new Error("MIDI Access not supported in this browser.");
    }

    navigator
      .requestMIDIAccess()
      .then((midiAccess) => {
        this.startListeningToInputs(midiAccess);
      })
      .catch((e) => {
        console.error("Failed to access MIDI devices:", e);
      });
  }

  public stop(): void {
    if (this.midiAccess) {
      this.midiAccess.inputs.forEach((inputDevice) => {
        inputDevice.onmidimessage = null;
      });
    }
  }

  private startListeningToInputs(midiAccess: MIDIAccess): void {
    console.log("MIDI Access started:", midiAccess);
    this.midiAccess = midiAccess;
    midiAccess.inputs.forEach((inputDevice) => {
      inputDevice.onmidimessage = (x) => this.onMIDIMessage(x);
    });
  }

  private onMIDIMessage(event: MIDIMessageEvent): void {
    // Check if the event data is valid
    const data = event.data;
    if (!data) {
      return;
    }

    // Get the command, note, and velocity from the MIDI data
    const command = data[0] >> 4;
    const note = data[1];
    const velocity = data[2];

    // Send event according to the command
    if (command === 9 && velocity > 0) {
      this.emit(GameInputEventType.NOTE_PRESSED, {
        note,
        velocity,
        timestamp: event.timeStamp,
      });
    } else if (command === 8 || (command === 9 && velocity === 0)) {
      this.emit(GameInputEventType.NOTE_RELEASED, {
        note,
        velocity,
        timestamp: event.timeStamp,
      });
    }
  }
}
