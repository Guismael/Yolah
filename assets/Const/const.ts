import { Dimensions } from 'react-native';
import { useEffect, useState } from 'react';

// 8 cases sur tout l'écran
export const BOARD_SIZE = 8;

function computeBoardPaddingRatio(window: { width: number; height: number }) {
    const { width, height } = window;
    const aspectRatio = width / height;
    // Return 0.85 for large screens (landscape), 1 for phone screens (portrait)
    return aspectRatio > 1 ? 0.80 : 1;
}

function computeTile(window: { width: number; height: number }) {
    const { width, height } = window;
    const ratio = computeBoardPaddingRatio(window);
    const base = Math.min(width, height) * ratio;
    return base / BOARD_SIZE;
}

// Hook that returns a responsive tile size and updates on window resize.
export function useTile() {
        const [tile, setTile] = useState(() => computeTile(Dimensions.get('window')));

        useEffect(() => {
            const handler = (payload: { window: any; screen?: any }) => {
                setTile(computeTile(payload.window));
            };

            // subscribe
            if ((Dimensions as any).addEventListener) {
                // RN >= 0.65
                const sub: any = (Dimensions as any).addEventListener('change', handler);
                return () => sub && typeof sub.remove === 'function' && sub.remove();
            } else if ((Dimensions as any).addEventListener === undefined && (Dimensions as any).removeEventListener) {
                // older RN
                (Dimensions as any).addEventListener('change', handler);
                return () => (Dimensions as any).removeEventListener('change', handler);
            }
            return undefined;
        }, []);

    return tile;
}

export const CONSTANTS = {
    BOARD_SIZE,
    useTile,
};

