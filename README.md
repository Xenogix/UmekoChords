# UmekoChords

Umeko Chords is a rhythm-based game built with PixiJS, featuring piano input, musical notation rendering, and real-time gameplay. 
The game is designed for learning and fun, with support for custom keyboard layouts, MIDI input, and dynamic audio.

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

### Build

To build the project for production:

```sh
npm run build
```

## Project Structure

- `src/` – Main source code
  - `app/` – Game logic, UI components, screens
  - `engine/` – Core engine, plugins (audio, navigation, resize)
  - `main.ts` – Entry point
- `public/` – Static assets (favicon, CSS, ...)
- `raw-assets/` – Source assets for AssetPack
- `.assetpack/` – Generated asset metadata

## Customization

- Audio volumes are adjustable via the settings popup.
- Assets and UI can be extended by adding new bundles and components.
- Keyboard layout is not currently customizable and uses the QWERTZ layout.

## Gameplay

Each turn, the orchestra conductor will play notes.
Listen carefully and play them back when it's your turn !
The according music score / measures will be shown to help you.

The more precise you play the more damage you deal to the orchestra conductor.
But be careful, if you miss notes you will take damage back.
When the orchestra conductor life points hits 0, a new one will appear with new patterns and challenges.

## License

MIT License. See [LICENSE](LICENSE) for details.