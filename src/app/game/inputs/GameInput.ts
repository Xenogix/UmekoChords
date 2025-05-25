import { EventEmitter } from "pixi.js";

export enum GameInputEventType {
  NOTE_PRESSED = "notePressed",
  NOTE_RELEASED = "noteReleased",
}

export interface NoteEvent {
  note: number; // MIDI note number (0-127)
  velocity: number; // Velocity (0-127)
  timestamp: number; // When the event occurred
}

export abstract class GameInput extends EventEmitter {
  public abstract start(): void; // Initialize the input system
  public abstract stop(): void; // Stop the input system
}
