import React, { useEffect, useRef, useState } from 'react';
import { Text, View, ScrollView, Animated, TouchableOpacity } from "react-native";
import { rulesStyles, demoStyles, headerStyles, COLORS, SPACING, getDynamicStyles } from '../assets/Styles/styles';
import { useGameSettings } from '../context/GameSettingsContext';
import ChessBackground from '../components/ChessBackground';
import {Ionicons} from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useI18n } from '../context/useI18n';

type RootStackParamList = {
  Home: undefined;
};
// ==================== ANIMATION : Mouvements possible ====================
function QueenMovementDemo() {
    const { t } = useI18n();
    const boardSize = 5;
    const squareSize = 50;
    
    const movements = [
        { name: t('rules.moveRight'), from: [4, 0], to: [4, 4], color: '#FF6B6B' },
        { name: t('rules.moveUp'), from: [4, 0], to: [0, 0], color: '#4ECDC4' },
        { name: t('rules.moveDiagonal'), from: [4, 0], to: [0, 4], color: '#95E1D3' },
        { name: t('rules.moveLeft'), from: [4, 4], to: [4, 0], color: '#f7f1a3ff' }, 
    ];

    // Etats pour suivre l'animation
    const [currentMoveIndex, setCurrentMoveIndex] = useState(0); //Mvmt qu'on anime actuellement
    const position = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current; // Position X,Y de la pièce animée
    const [isAnimating, setIsAnimating] = useState(false); // Empêche de lancer 2 animations en même temps
    const [trail, setTrail] = useState<Array<{ x: number; y: number; id: number }>>([]); // effet de traînée derrière la pièce

    // Fonction pour démarrer la séquence d'animations
    const animateSequence = () => {
        if (isAnimating) return; // Si déjà en cours on ne fait rien
        setIsAnimating(true);
        setCurrentMoveIndex(0); // On recommence au premier mouvement
        animateMove(0); // Lance le premier mouvement
    };

    // Fonction qui anime 1 mvmt spécifique
    const animateMove = (index: number) => {
        // Si on a fini tous les mouvements, on arrête
        if (index >= movements.length) {
            setIsAnimating(false);
            return;
        }

        // Récupère les infos du mouvement actuel
        const move = movements[index];
        const [fromRow, fromCol] = move.from; // Position de départ (ligne, colonne)
        const [toRow, toCol] = move.to; // Position d'arrivée

        // Convertit les positions grille en pixels
        const startX = fromCol * squareSize;
        const startY = fromRow * squareSize;
        const endX = toCol * squareSize;
        const endY = toRow * squareSize;

        // Réinitialise la trainée et place la pièce au départ
        setTrail([]);
        position.setValue({ x: startX, y: startY });

        // Variables pour suivre la position en temps réel pour la trainée
        let currentX = startX;
        let currentY = startY;

         // Écoute les changements de position pendant l'animation
        position.x.addListener(({ value }) => { currentX = value; });
        position.y.addListener(({ value }) => { currentY = value; });

        // Crée un effet toutes les 80ms pour faire la traînée
        const trailInterval = setInterval(() => {
            setTrail(prev => [
                ...prev.slice(-5),
                { x: currentX, y: currentY, id: Date.now() }
            ]);
        }, 80);

        // L'animation
        Animated.sequence([
            // 1. Déplace la pièce de startX,startY vers endX,endY en 1 seconde
            Animated.timing(position, {
                toValue: { x: endX, y: endY },
                duration: 1000,
                useNativeDriver: true, //utilise thread natif pour fluidité
            }),
            // 2. Pause de 600ms à l'arrivée
            Animated.delay(600),
        ]).start(() => {
            // Quand l'animation est finie :
            clearInterval(trailInterval); // Arrête de créer effet trainée
            position.x.removeAllListeners(); // Nettoie les écouteurs
            position.y.removeAllListeners();
            setTrail([]); // Efface la trainée
            setCurrentMoveIndex(index + 1);
            setTimeout(() => animateMove(index + 1), 400); // Lance le mouvement suivant après 400ms
        });
    };

    // Lance l'animation automatiquement au chargement
    useEffect(() => {
        animateSequence();
    }, []);

    return (
        <View style={demoStyles.container}>
            <Text style={demoStyles.label}>
                👆 {t('rules.tapReplayMovement', { name: movements[currentMoveIndex]?.name ?? '' })}
            </Text>

            {/* Bouton pour relancer l'animation */}
            <TouchableOpacity 
                style={demoStyles.boardContainer} 
                onPress={animateSequence}
                disabled={isAnimating} // Désactivé pendant l'animation
                activeOpacity={0.8}
            >
            
                <View style={demoStyles.board}>
                    {[...Array(boardSize)].map((_, row) => (
                        <View key={row} style={demoStyles.row}>
                            {[...Array(boardSize)].map((_, col) => (
                                <View 
                                    key={`${row}-${col}`} 
                                    style={[
                                        demoStyles.square,
                                        { backgroundColor: (row + col) % 2 === 0 ? COLORS.game.boardColor1 : COLORS.game.boardColor2 }
                                    ]} 
                                >
                                    {row === 4 && col === 0 && (
                                        <View style={demoStyles.startDot} />
                                    )}
                                </View>
                            ))}
                        </View>
                    ))}

                    {trail.map((pos, idx) => (
                        <Animated.View
                            key={pos.id}
                            style={[
                                demoStyles.trailPiece,
                                {
                                    left: pos.x + 5,
                                    top: pos.y + 5,
                                    opacity: (idx + 1) / trail.length * 0.6,
                                    backgroundColor: movements[currentMoveIndex]?.color || COLORS.game.player2Color,
                                }
                            ]}
                        />
                    ))}

                    <Animated.View
                        style={[
                            demoStyles.piece,
                            {
                                backgroundColor: movements[currentMoveIndex]?.color || COLORS.game.player2Color,
                                transform: [
                                    { translateX: position.x },
                                    { translateY: position.y }
                                ]
                            }
                        ]}
                    />
                </View>
            </TouchableOpacity>
            
            <View style={demoStyles.progressContainer}>
                {movements.map((move, idx) => (
                    <View 
                        key={idx}
                        style={[
                            demoStyles.progressDot,
                            { backgroundColor: idx <= currentMoveIndex ? move.color : '#ddd' }
                        ]}
                    />
                ))}
            </View>
        </View>
    );
}

// ==================== ANIMATION 2 : Croix ====================
function BlockingDemo() {
    const { t } = useI18n();
    const [blocked, setBlocked] = useState(false);
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const showBlocking = () => {
        setBlocked(true);
        
        Animated.sequence([
            Animated.spring(scaleAnim, {
                toValue: 1.3,
                friction: 3,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 5,
                useNativeDriver: true,
            }),
        ]).start();

        setTimeout(() => {
            setBlocked(false);
            scaleAnim.setValue(1);
        }, 2000);
    };

    useEffect(() => {
        showBlocking();
    }, []);

    return (
        <View style={demoStyles.container}>
            <Text style={demoStyles.label}>👆 {t('rules.tapReplayBlock')}</Text>
            <TouchableOpacity 
                style={demoStyles.singleSquare}
                onPress={showBlocking}
                activeOpacity={0.8}
            >
                <View style={[demoStyles.square, { backgroundColor: COLORS.game.boardColor1 }]} />
                
                {blocked && (
                    <Animated.View style={[demoStyles.cross, { transform: [{ scale: scaleAnim }] }]}>
                        <View style={[demoStyles.crossLine, { transform: [{ rotate: '45deg' }] }]} />
                        <View style={[demoStyles.crossLine, { transform: [{ rotate: '-45deg' }] }]} />
                    </Animated.View>
                )}
            </TouchableOpacity>
        </View>
    );
}

// ==================== PAGE PRINCIPALE ====================
export default function Rules() {
    // Récupère darkMode
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { darkMode } = useGameSettings();
    const { t } = useI18n();
    const ds = getDynamicStyles(darkMode);

    return (
        <View style={[headerStyles.container, ds.bg.screen]}> 
            <View style={[headerStyles.header, ds.bg.card]}>
                <TouchableOpacity 
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={[headerStyles.headerTitle, ds.text.dark]}>{t('rules.header')}</Text> 
                <View style={{ width: 24 }} />
            </View>
            <ScrollView contentContainerStyle={[rulesStyles.container, ds.bg.screen]}>
                <ChessBackground isDark={darkMode} />
                <View style={[rulesStyles.card, ds.bg.card]}>
                    <Text style={[rulesStyles.heading, ds.text.dark]}>{t('rules.title')}</Text>

                    <View style={rulesStyles.ruleSection}>
                        <Text style={[rulesStyles.rule, ds.text.primary]}>
                            <Text style={rulesStyles.bullet}>1 : </Text>
                            {t('rules.rule1')}
                        </Text>
                    </View>

                    <View style={rulesStyles.ruleSection}>
                        <Text style={[rulesStyles.rule, ds.text.primary]}>
                            <Text style={rulesStyles.bullet}>2 : </Text>
                            {t('rules.rule2')}
                        </Text>
                        <QueenMovementDemo />
                    </View>

                <View style={rulesStyles.ruleSection}>
                    <Text style={[rulesStyles.rule, ds.text.primary]}>
                        <Text style={rulesStyles.bullet}>3 : </Text>
                            {t('rules.rule3')}
                    </Text>
                </View>

                <View style={rulesStyles.ruleSection}>
                    <Text style={[rulesStyles.rule, ds.text.primary]}>
                        <Text style={rulesStyles.bullet}>4 : </Text>
                        {t('rules.rule4')}
                    </Text>
                    <BlockingDemo />
                </View>

                <View style={rulesStyles.ruleSection}>
                    <Text style={[rulesStyles.rule, ds.text.primary]}>
                        <Text style={rulesStyles.bullet}>5 : </Text>
                        {t('rules.rule5')}
                    </Text>
                </View>

                <Text style={[rulesStyles.note, ds.text.primary]}>
                    💡 {t('rules.note')}
                </Text>
            </View>
        </ScrollView>
    </View>
    );
}

