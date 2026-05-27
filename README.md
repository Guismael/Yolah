# Yolah

Yolah is a React Native strategy game built with Expo.


![Yolah logo](assets/images/yolah-logo.png)

## What Is Yolah?

Yolah is a turn-based territory game for two players.

- Each player moves pieces like a chess queen.
- Every time you move, your previous square becomes blocked.
- You score points by moving.
- When nobody can move, the highest score wins.


## Features

- Single-device play (`Human vs Human`)
- AI mode (`Human vs AI`) with 4 levels: `Easy`, `Medium`, `Hard`, `Expert`
- Optional game timer (`30s`, `60s`, `90s`, `120s`)
- LAN multiplayer over TCP (host/join with IP + port)
- Player profile (username, avatar, multiplayer stats)
- Settings persistence (dark mode, sound, volume, vibration)
- Board and piece customization (color themes + visual styles)
- Rules screen with mini animated demos
- Android EAS profiles for `development`, `preview`, and `production`

## Tech Stack

- Expo SDK 54
- React Native 0.81
- TypeScript
- React Navigation (native stack)
- AsyncStorage for persistent local settings/profile
- `react-native-tcp-socket` for LAN multiplayer transport

## Project Structure

- `app/`: screens (`Home`, `Game`, `Multiplayer`, `Settings`, `Customization`, `Rules`, etc.)
- `components/`: board, pieces, timer, overlays
- `logic/`: game logic and AI-related code
- `context/`: global state (settings + profile)
- `config/`: themes, game mode constants, piece styles
- `services/`: multiplayer networking service
- `assets/`: images, sounds, styling helpers

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start the Expo dev server

```bash
npm start
```

### 3. Launch targets from the Expo terminal

- Press `a` for Android
- Press `i` for iOS (macOS + Xcode only)


## Multiplayer Notes (LAN)

- Host and client must be on the same local network.
- The host shares LAN IP + port (default `8888`).
- If connection fails, check VPN/firewall/router isolation first.

## EAS Build Profiles

This project uses three Android app variants so builds can coexist on the same phone:

- `development` -> `com.yolah.yolah.dev`
- `preview` -> `com.yolah.yolah.preview`
- `production` -> `com.yolah.yolah`

Example local build command:

```bash
npx eas build --platform android --profile development --local
```


## License

Personal/academic project.
