import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTile } from '../assets/Const/const';
import { COLORS, scoreStyles as styles } from '../assets/Styles/styles';
import { useGameSettings } from '../context/GameSettingsContext';
import { useI18n } from '../context/useI18n';

export interface PlayerProfile {
  username: string;
  profileImage?: string | null;
}

type Props = {
  scoreW: number;
  scoreB: number;
  currentPlayer?: "b" | "w";
  onReset?: () => void;
  whiteTime?: number;
  blackTime?: number;
  whiteProfile?: PlayerProfile | null;
  blackProfile?: PlayerProfile | null;
};

export default function Score({
  scoreW,
  scoreB,
  currentPlayer,
  onReset,
  whiteTime,
  blackTime,
  whiteProfile,
  blackProfile,
}: Props) {
  const TILE = useTile();
        const { darkMode } = useGameSettings();
    const { t } = useI18n();
  const height = Math.max(75, Math.round(TILE * 0.75));

  // Debug logging for profiles
  useEffect(() => {
    console.log('[Score] Profile update:', {
      whiteProfile: whiteProfile?.username || 'None',
      blackProfile: blackProfile?.username || 'None',
    });
  }, [whiteProfile, blackProfile]);

  const scaleW = useRef(new Animated.Value(1)).current;
  const scaleB = useRef(new Animated.Value(1)).current;
  const pulsePlayer = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleW, { toValue: 1.3, duration: 150, useNativeDriver: true }),
      Animated.spring(scaleW, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  }, [scoreW]);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleB, { toValue: 1.3, duration: 150, useNativeDriver: true }),
      Animated.spring(scaleB, { toValue: 1, friction: 3, useNativeDriver: true }),
    ]).start();
  }, [scoreB]);

    // Pulse pour le joueur actuel
    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulsePlayer, {
                    toValue: 1.15,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(pulsePlayer, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();
        return () => pulse.stop();
    }, []);

    return (
        <View style={[
            styles.container, 
            { 
                height,
                backgroundColor: darkMode 
                    ? 'rgba(185, 191, 200, 0.93)'  // Gris-bleu foncé en dark mode
                    : 'rgba(255,255,255,0.95)'   // Blanc en light mode
                 }]}> 
            {/* Joueur Blanc */}
            <View style={styles.player}> 
                {whiteProfile?.profileImage ? (
                  <Image
                    source={{ uri: whiteProfile.profileImage }}
                    style={[
                      styles.profileImage,
                      {
                        borderColor: currentPlayer === 'w' ? COLORS.primary : '#ccc',
                        borderWidth: currentPlayer === 'w' ? 3 : 2,
                      }
                    ]}
                  />
                ) : (
                  <Animated.View 
                    style={[
                      styles.colorDot, 
                      { 
                        backgroundColor:'rgba(255,255,255,0.95)',
                        borderColor: currentPlayer === 'w' ? COLORS.primary : '#ccc',
                        borderWidth: currentPlayer === 'w' ? 3 : 2,
                        transform: currentPlayer === 'w' ? [{ scale: pulsePlayer }] : []
                      }
                    ]} 
                  />
                )}
                <Text style={[styles.label, currentPlayer === 'w' && styles.activeLabel]}>
                                    {whiteProfile?.username || t('board.white')}
                </Text>
                <Animated.Text 
                    style={[
                        styles.score, 
                        currentPlayer === 'w' && styles.activeScore,
                        { transform: [{ scale: scaleW }] }
                    ]}
                >
                    {scoreW}
                </Animated.Text>
            </View>

            {/* Arrow indicator */}
            <View style={styles.center}>
                <Ionicons
                    name={currentPlayer === 'w' ? 'arrow-back' : 'arrow-forward'}
                    size={32}
                    color={darkMode ? '#7C3AED' : '#9e6df7'}
                />
            </View>

            {/* Joueur Noir */}
            <View style={styles.player}>
                {blackProfile?.profileImage ? (
                    <Image
                        source={{ uri: blackProfile.profileImage }}
                        style={[
                            styles.profileImage,
                            {
                                borderColor: currentPlayer === 'b' ? COLORS.primary : '#ccc',
                                borderWidth: currentPlayer === 'b' ? 3 : 2,
                            }
                        ]}
                    />
                ) : (
                    <Animated.View
                        style={[
                            styles.colorDot,
                            {
                                backgroundColor: "#000",
                                borderColor: currentPlayer === 'b' ? COLORS.primary : '#ccc',
                                borderWidth: currentPlayer === 'b' ? 3 : 2,
                                transform: currentPlayer === 'b' ? [{ scale: pulsePlayer }] : [],
                            },
                        ]}
                    />
                )}

                <Text
                    style={[
                        styles.label,
                        currentPlayer === 'b' && styles.activeLabel,
                    ]}
                >
                    {blackProfile?.username || t('board.black')}
                </Text>

                <Animated.Text
                    style={[
                        styles.score,
                        currentPlayer === 'b' && styles.activeScore,
                        { transform: [{ scale: scaleB }] },
                    ]}
                >
                    {scoreB}
                </Animated.Text>
            </View>
        </View>
    );
}

