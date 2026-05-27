import React from 'react';
import { View, Text } from 'react-native';
import { turnBarStyles as styles } from '../assets/Styles/styles';

interface MultiplayerTurnBarProps {
    multiplayerMode: boolean;
    playerColor: 'b' | 'w' | null;
    showGameOver: boolean;
    turnStatusText: string;
}

export default function MultiplayerTurnBar({
    multiplayerMode,
    playerColor,
    showGameOver,
    turnStatusText,
}: MultiplayerTurnBarProps) {
    if (!multiplayerMode || !playerColor || showGameOver) return null;

    return (
        <View pointerEvents="none" style={styles.wrapper}>
            <View style={styles.bar}>
                <Text style={styles.text}>{turnStatusText}</Text>
            </View>
        </View>
    );
}

