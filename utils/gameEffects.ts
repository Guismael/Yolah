import { Platform, Vibration } from 'react-native';

export interface GameSettings {
    vibrationEnabled?: boolean;
    soundEnabled?: boolean;
    volume?: number;
}

export function vibrate(settings?: GameSettings): void {
    try {
        if (Platform.OS === 'android' || Platform.OS === 'ios') {
            if (settings?.vibrationEnabled) {
                Vibration.vibrate(50);
            }
        }
    } catch {
        // vibration not available on this device
    }
}

let lastSoundIndex = -1;

export function playSoundEffect(settings?: GameSettings): void {
    const soundEnabled = settings?.soundEnabled ?? true;
    const volumePercent = settings?.volume ?? 50;

    if (!soundEnabled || volumePercent <= 0) return;

    lastSoundIndex = (lastSoundIndex + 1) % 2;
    const soundRequires = [
        require('../assets/sounds/chess1.mp3'),
        require('../assets/sounds/chestpiece2.mp3'),
    ];
    const normalizedVolume = Math.max(0, Math.min(1, volumePercent / 100));

    (async () => {
        try {
            const { Audio } = await import('expo-av');
            const { sound } = await Audio.Sound.createAsync(
                soundRequires[lastSoundIndex],
                { shouldPlay: true, volume: normalizedVolume }
            );
            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    sound.unloadAsync().catch(() => {});
                }
            });
        } catch {
            // audio not available
        }
    })();
}
