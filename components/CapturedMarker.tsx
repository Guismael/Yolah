// Dissolving particle effect with glowing pulse

import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import { capturedMarkerStyles as styles } from '../assets/Styles/styles';

type CapturedMarkerProps = {
    owner: 'b' | 'w';
    size: number;
    offset: number;
};

export default function CapturedMarker({ owner, size, offset }: CapturedMarkerProps) {
    // Animation values for the effect
    const pulseAnim = useRef(new Animated.Value(0)).current;
    const dissolveAnim = useRef(new Animated.Value(0)).current;
    const particleAnims = useRef(
        Array.from({ length: 8 }, () => new Animated.Value(0))
    ).current;

    // Color scheme based on owner - distinct shades of black/white from pawns
    const baseColor = owner === 'b' ? '#212121' : '#F5F5F5';
    const colors = owner === 'b' 
        ? {
            base: '#4A4A4A',
            dark: '#3A3A3A',
            darker: '#2A2A2A',
            accent: '#5A5A5A',
        }
        : {
            base: '#D0D0D0',
            dark: '#C0C0C0',
            darker: '#B0B0B0',
            accent: '#E0E0E0',
        };

    useEffect(() => {
        // Sequence: Pulse -> Particles dissolve outward
        Animated.sequence([
            // Initial pulse from center (0-200ms)
            Animated.timing(pulseAnim, {
                toValue: 1,
                duration: 200,
                useNativeDriver: true,
            }),
            // Particles explode and dissolve (200-800ms)
            Animated.parallel([
                Animated.timing(dissolveAnim, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
                Animated.stagger(
                    50,
                    particleAnims.map((anim) =>
                        Animated.timing(anim, {
                            toValue: 1,
                            duration: 600,
                            useNativeDriver: true,
                        })
                    )
                ),
            ]),
        ]).start();
    }, []);

    // Create particle positions in a circle
    const particlePositions = Array.from({ length: 8 }, (_, i) => {
        const angle = (i * 360) / 8;
        const radian = (angle * Math.PI) / 180;
        return {
            x: Math.cos(radian),
            y: Math.sin(radian),
            angle,
        };
    });

    return (
        <View style={styles.container}>
            {/* Full square base - covers entire square like the old effect */}
            <Animated.View
                style={[
                    styles.fullSquare,
                    {
                        backgroundColor: colors.darker,
                        opacity: pulseAnim.interpolate({
                            inputRange: [0, 0.3, 1],
                            outputRange: [0, 1, 1],
                        }),
                    },
                ]}
            />

            {/* Pulsing void effect from center */}
            <Animated.View
                style={[
                    styles.voidPulse,
                    {
                        backgroundColor: colors.dark,
                        opacity: pulseAnim.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [0, 0.8, 0.4],
                        }),
                        transform: [
                            {
                                scale: pulseAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 1],
                                }),
                            },
                        ],
                    },
                ]}
            />

            {/* Dissolving overlay that fades gradually */}
            <Animated.View
                style={[
                    styles.fullSquare,
                    {
                        backgroundColor: colors.base,
                        opacity: dissolveAnim.interpolate({
                            inputRange: [0, 0.6, 1],
                            outputRange: [1, 0.5, 0],
                        }),
                    },
                ]}
            />

            {/* Particle explosion effects */}
            {particlePositions.map((pos, index) => (
                <Animated.View
                    key={index}
                    style={[
                        styles.particle,
                        {
                            backgroundColor: colors.accent,
                            left: '50%',
                            top: '50%',
                            opacity: particleAnims[index].interpolate({
                                inputRange: [0, 0.3, 1],
                                outputRange: [1, 0.6, 0],
                            }),
                            transform: [
                                {
                                    translateX: particleAnims[index].interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, pos.x * size * 0.7],
                                    }),
                                },
                                {
                                    translateY: particleAnims[index].interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0, pos.y * size * 0.7],
                                    }),
                                },
                                {
                                    scale: particleAnims[index].interpolate({
                                        inputRange: [0, 0.5, 1],
                                        outputRange: [1.5, 1.3, 0],
                                    }),
                                },
                            ],
                        },
                    ]}
                />
            ))}

            {/* Inner shadow to give depth */}
            <Animated.View
                style={[
                    styles.innerShadow,
                    {
                        opacity: dissolveAnim.interpolate({
                            inputRange: [0, 0.5, 1],
                            outputRange: [0, 0.6, 0.8],
                        }),
                    },
                ]}
            />
        </View>
    );
}

