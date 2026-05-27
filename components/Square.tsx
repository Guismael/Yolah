import React from 'react';
import { View } from 'react-native';

import { useTile } from '../assets/Const/const';
import { squareStyles, COLORS } from '../assets/Styles/styles';

//Importe le hook pour accéder au thème
import { useGameSettings } from '../context/GameSettingsContext';
import CapturedMarker from './CapturedMarker';

type SquareProps = {
    // On ne passe plus color depuis Board, on calcule la couleur ici
    row: number;
    col: number;
    ghostPawn: boolean;
    captured: any;
};

export default function Square({ row, col, ghostPawn, captured }: SquareProps) {
    const TILE = useTile();

    // render a local "ghost pawn" inside the square rather than rendering <Piece />
    const ghostSize = TILE * 0.6;
    const ghostOffset = (TILE - ghostSize) / 2;

    // Récupère le thème depuis le Context
    const { theme } = useGameSettings();

    // Calcule la couleur selon la position 
    const isLightSquare = (row + col) % 2 === 0;
    const color = isLightSquare ? theme.color1 : theme.color2;

    // determine captured marker (Xb / Xw etc.)
    const isCaptured = typeof captured === 'string' && captured.startsWith('X');
    const capturedOwner = isCaptured ? captured[captured.length - 1] : null; // 'b' or 'w'

    // Couleur de la croix
    const crossColor = capturedOwner === 'b' ? '#212121' : capturedOwner === 'w' ? '#F5F5F5' : null;

    const crossThickness = Math.max(2, Math.round(ghostSize * 0.12));

    return (
        <View style={[squareStyles.container, { width: TILE, height: TILE, position: 'relative' }]}>
            <View style={[{ 
                width: TILE, 
                height: TILE, 
                backgroundColor: color,
                opacity: 1
            }]} />

            {ghostPawn && (
                <View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        left: ghostOffset,
                        top: ghostOffset,
                        width: ghostSize,
                        height: ghostSize,
                        borderRadius: ghostSize / 2,
                        backgroundColor: 'rgba(46,135,173,0.18)',
                        borderWidth: 1,
                        borderColor: 'rgba(46,135,173,0.8)',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                />
            )}


            {/* Effet d'effondrement avec couleur selon le joueur */}
            {isCaptured && capturedOwner && (
                <CapturedMarker
                owner={capturedOwner as 'b' | 'w'}
                size={ghostSize}
                offset={ghostOffset}
            />
            )}
        </View>
    );
}