import { useEffect, useRef } from 'react';
import { useGameSettings } from '../context/GameSettingsContext';

/**
 * Loads backgroundmusic.mp3 once and keeps it playing in a loop for as long
 * as the component that calls this hook is mounted (i.e. the whole app lifetime
 * when called from _layout.tsx).
 *
 * Responds to the user's sound / volume settings in real time:
 *  - soundEnabled = false  →  pause
 *  - volume = 0            →  pause
 *  - otherwise             →  play at the normalised volume
 */
export function useBackgroundMusic() {
    const { soundEnabled, volume } = useGameSettings();

    // Keep the Sound object alive across re-renders without causing re-renders itself.
    const soundRef = useRef<import('expo-av').Audio.Sound | null>(null);
    // Track whether the sound is currently supposed to be playing so we can
    // avoid redundant play/pause calls while the async load is still in flight.
    const shouldPlayRef = useRef(soundEnabled && volume > 0);

    // ── Load once on mount ──────────────────────────────────────────────────
    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const { Audio } = await import('expo-av');

                // Allow audio to play even when the device is in silent mode (iOS).
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                });

                const normalizedVolume = Math.max(0, Math.min(1, volume / 100));
                const play = soundEnabled && normalizedVolume > 0;

                const { sound } = await Audio.Sound.createAsync(
                    // eslint-disable-next-line @typescript-eslint/no-require-imports
                    require('../assets/sounds/backgroundmusic.mp3'),
                    {
                        shouldPlay: play,
                        isLooping: true,
                        volume: normalizedVolume,
                    }
                );

                if (!mounted) {
                    // Component unmounted while we were loading — clean up immediately.
                    sound.unloadAsync().catch(() => {});
                    return;
                }

                soundRef.current = sound;

                // Sync to whatever settings arrived while we were loading.
                const currentPlay = shouldPlayRef.current;
                if (currentPlay !== play) {
                    if (currentPlay) {
                        await sound.playAsync();
                    } else {
                        await sound.pauseAsync();
                    }
                }
            } catch {
                // Audio not available on this platform / in this environment.
            }
        })();

        return () => {
            mounted = false;
            const s = soundRef.current;
            soundRef.current = null;
            if (s) s.unloadAsync().catch(() => {});
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally run only once

    // ── React to settings changes ────────────────────────────────────────────
    useEffect(() => {
        const play = soundEnabled && volume > 0;
        shouldPlayRef.current = play;

        const s = soundRef.current;
        if (!s) return; // still loading — shouldPlayRef will be read on load finish

        const normalizedVolume = Math.max(0, Math.min(1, volume / 100));

        s.setVolumeAsync(normalizedVolume).catch(() => {});

        if (play) {
            s.playAsync().catch(() => {});
        } else {
            s.pauseAsync().catch(() => {});
        }
    }, [soundEnabled, volume]);
}
