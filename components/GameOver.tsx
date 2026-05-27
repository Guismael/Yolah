import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { gameOverStyles } from '../assets/Styles/styles';
import { useI18n } from '../context/useI18n';
import { useGameSettings } from '../context/GameSettingsContext';

type Props = {
    visible: boolean;
    winner: 'b' | 'w' | 'draw' | null;
    onRestart: () => void;
    canRestart?: boolean;
    restartLabel?: string;
};

export default function GameOver({ visible, winner, onRestart, canRestart = true, restartLabel = '' }: Props) {
    const { t } = useI18n();
    const { theme } = useGameSettings();
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (visible) {
            pulseAnim.setValue(1);
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 7,
                    tension: 45,
                    useNativeDriver: true,
                }),
            ]).start(() => {
                if (winner !== 'draw') {
                    Animated.loop(
                        Animated.sequence([
                            Animated.timing(pulseAnim, { toValue: 1.03, duration: 700, useNativeDriver: true }),
                            Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
                        ]),
                        { iterations: 4 }
                    ).start();
                }
            });
        } else {
            fadeAnim.setValue(0);
            scaleAnim.setValue(0.8);
            pulseAnim.setValue(1);
        }
    }, [visible]);

    if (!visible) return null;

    const isWin = winner === 'b' || winner === 'w';
    const winnerText =
        winner === 'b' ? t('gameOver.blackWins') : winner === 'w' ? t('gameOver.whiteWins') : t('gameOver.draw');

    const badgeTextStyle = winner === 'w' ? gameOverStyles.badgeTextWhite : gameOverStyles.badgeTextBlack;

    return (
        <Animated.View
            style={[gameOverStyles.overlay, { opacity: fadeAnim }]}
            pointerEvents="auto"
        >
            <Animated.View
                style={[
                    gameOverStyles.card,
                    isWin && {
                        borderColor: theme.color2,
                        borderWidth: 2,
                        shadowColor: theme.color2,
                        shadowOpacity: 0.6,
                        shadowRadius: 16,
                        elevation: 12,
                    },
                    { transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }] },
                ]}
            >
                <Text style={gameOverStyles.title}>{t('gameOver.title')}</Text>

                <View style={gameOverStyles.resultRow}>
                    <View
                        style={[
                            gameOverStyles.winnerBadge,
                            winner === 'b'
                                ? gameOverStyles.badgeBlack
                                : winner === 'w'
                                    ? gameOverStyles.badgeWhite
                                    : gameOverStyles.badgeNeutral,
                        ]}
                    >
                        <Text style={badgeTextStyle}>
                            {winner === 'b' ? 'B' : winner === 'w' ? 'W' : '—'}
                        </Text>
                    </View>
                    <Text style={gameOverStyles.winner}>{winnerText}</Text>
                </View>

                <View style={gameOverStyles.buttonRow}>
                    <TouchableOpacity
                        style={gameOverStyles.button}
                        onPress={onRestart}
                        disabled={!canRestart}
                        accessibilityLabel={t('gameOver.restartLabel')}
                        activeOpacity={0.8}
                    >
                        <Text style={[gameOverStyles.buttonText, !canRestart && { opacity: 0.55 }]}>
                            {restartLabel || t('board.playAgain')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </Animated.View>
    );
}
