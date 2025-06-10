# UmekoChords

Umeko Chords is a rhythm-based game built with PixiJS, featuring piano input, musical notation rendering, and real-time gameplay. 
The game is designed for learning and fun, with support for custom keyboard layouts, MIDI input, and dynamic audio.

This is work in progress and multiple bugs are still present in new versions of the game. Known issues and bugs are listed below.

## Features

- Pixel-art style game rendered using [Pixi JS](https://github.com/pixijs/pixijs)
- Piano keyboard input and MIDI support
- Real-time music notation rendering using [VexFlow](https://github.com/0xfe/vexflow)
- Rhythm-based realtime gameplay
- Customizable audio settings (master, BGM, SFX)
- Asset management via [AssetPack](https://github.com/pixijs/assetpack) and [Vite](https://github.com/vitejs/vite)

## Getting Started

### Prerequisites

- [Node.js (v20.0.0 or later)](https://nodejs.org/en/)

### Installation

Before running the game, you will need to install the dependencies:

```sh
npm install
```

### Development

Start the development server:

```sh
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

## Project Structure

- `src/` – Main source code
  - `app/` – Game logic, UI components, screens
  - `engine/` – Core engine, plugins (audio, navigation, resize)
  - `main.ts` – Entry point
- `public/` – Static assets (favicon, CSS, ...)
- `raw-assets/` – Source assets for AssetPack
- `.assetpack/` – Generated asset metadata

## Gameplay

Each turn, the orchestra conductor will play notes.
Listen carefully and play them back when it's your turn !
The matching music score / measures will be shown to assist you.

The more precise you play the more damage you deal to the orchestra conductor.
But be careful, if you miss notes you will take damage back.
When the orchestra conductor life points hit 0, a new one will appear with new patterns and challenges.

### Accuracy Judgement

Accuracy is determined by how close to the expected 

| Accuracy | Timing Window (ms) | Description                |
|----------|--------------------|----------------------------|
| Perfect  | ≤ 50               | Flawless timing            |
| Good     | ≤ 100              | Slightly off               |
| Poor     | ≤ 200              | Noticeably off             |
| Miss     | ≤ 300              | Far from correct timing    |
| Error    | > 300              | No matching note or too late/early |

Error notes are shown as a `miss` but are not penalized.
We think the game can be hard enough as it is and should reward precise play more than anything else.

Only the timing of pressed notes is used to calculate accuracy. The program also calculates accuracy for note releases but only the press accuracy is used for damaged and feedback. This is an intentional design choice to reduce gameplay complexity.

### Damage System

During a game, orchestra conductors will be shown, each with its own move set.
Each note you play correctly (`OK` or better) will contribute to take down the health of the conductor.
When a conductor life points reach 0, it will disappear and a new one will be presented. 

Each note you fail (`miss`) will contribute to deal damage to the player.
When your life points reach 0, the game is over.

The more precise you are, the more damage you deal : 

| Accuracy | Damage Multiplier | Description         |
|----------|-------------------|---------------------|
| Perfect  | 1.5               | Highest damage      |
| Good     | 1                 | Standard damage     |
| Poor     | 0.5               | Reduced damage      |
| Miss     | 0                 | No damage           |
| Error    | 0                 | No damage           |


### Keyboard input

Currently, the game only supports QWERTZ layout. Everything is set up to handle keyboard layout customization except the UI.
It was not designed to be played on a keyboard but we still support it and it can be really useful for development / testing purposes.

As keyboard space is limited it can only be used to play an octave + 1 notes.
(Ranging from C4 to C5 inclusive)

Below is the mapping of your QWERTZ keyboard to piano notes used in the game:

| Key | Note  |
|-----|-------|
| A   | C4    |
| Q   | C#4   |
| S   | D4    |
| W   | D#4   |
| D   | E4    |
| F   | F4    |
| R   | F#4   |
| G   | G4    |
| T   | G#4   |
| H   | A4    |
| Z   | A#4   |
| J   | B4    |
| K   | C5    |


### Midi input

MIDI input is supported for compatible devices. The sustain pedal is currently ignored, but this does not affect gameplay.
You may have to refresh the page after connecting a device for it to be properly recognized.

## Known Issues & Limitations

This game is a work is progress and there are a few issues and limitations to address. 

- The replay button logic does not refresh the UI state properly which can cause issue with VexFlow and the feedback messages.
- Keyboard controls are fixed and cannot be changed. Only 13 keys are available for gameplay.
- There is currently only two enemies in the game; more enemies and patterns will be added in future updates.
- The attack-to-VexFlow notation system does not support ties or pauses/rests in the music score.

## License

MIT License. See [LICENSE](LICENSE) for details.