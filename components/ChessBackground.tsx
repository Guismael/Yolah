// fichier pour le nouveau background que j'ai mis partout (je sais pas encore si on le garde dans game ou on fait un autre background pour game ?)

import React from 'react';
import { View } from 'react-native';

type ChessBackgroundProps = {
    isDark?: boolean;
};

export default function ChessBackground({ isDark = false }: ChessBackgroundProps) {
    // Couleurs selon le mode
    const colors = isDark ? {
        square1: '#1E3A8A',
        square2: '#7C3AED',
    } : {
        square1: '#6025f6ff',
        square2: '#bc77fcc3',
    };

    return (
        <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.25,
            zIndex: 0,
            flexDirection: 'column',
        }}>
            {[...Array(16)].map((_, row) => (
                <View key={row} style={{ flexDirection: 'row', flex: 1 }}>
                    {[...Array(8)].map((_, col) => (
                        <View
                            key={`${row}-${col}`} 
                            style={{
                                flex: 1,
                                backgroundColor: (row + col) % 2 === 0 ? colors.square1 : colors.square2,
                            }}
                        />
                    ))}
                </View>
            ))}
        </View>
    );
}
