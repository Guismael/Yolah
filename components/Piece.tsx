import React, { useState, useRef } from 'react';
import { StyleSheet, Animated, PanResponder, PanResponderGestureState } from 'react-native';

import { CONSTANTS, useTile } from '../assets/Const/const';
import { pieceStyles } from '../assets/Styles/styles';
//Importe le hook pour accéder au style de pion
import { useGameSettings } from '../context/GameSettingsContext';

const { BOARD_SIZE } = CONSTANTS;

type PieceProps = {
    key?: string;
    row: number;
    col: number;
    team: 'b' | 'w';
    onPress?: () => void;
    onLetGo?: (toRow: number, toCol: number, fromRow: number, fromCol: number) => void;
    refresh?: () => void;
    draggable?: boolean;
};

export default function Piece({ row, col, team, onPress, onLetGo, refresh, draggable = true }: PieceProps) {
    const TILE = useTile();
    const [isSelected, setIsSelected] = useState(false);
    const draggableRef = useRef<boolean>(!!draggable);
    const position = useRef(new Animated.ValueXY()).current;
    const isDraggingRef = useRef(false);
    
    // Récupère le style de pion depuis le Context
    const { pieceStyle, theme } = useGameSettings();
    
    const onLetGoRef = useRef(onLetGo);
    const onPressRef = useRef(onPress);
    const rowRef = useRef(row);
    const colRef = useRef(col);

    React.useEffect(() => { onLetGoRef.current = onLetGo; }, [onLetGo]);
    React.useEffect(() => { onPressRef.current = onPress; }, [onPress]);
    React.useEffect(() => { rowRef.current = row; }, [row]);
    React.useEffect(() => { colRef.current = col; }, [col]);
    React.useEffect(() => { draggableRef.current = !!draggable; }, [draggable]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => !!draggableRef.current,
            onPanResponderGrant: () => {
                if (!draggableRef.current) return;
                isDraggingRef.current = false;
                position.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: (evt, gestureState: PanResponderGestureState) => {
                Animated.event(
                    [null, { dx: position.x, dy: position.y }],
                    { useNativeDriver: false }
                )(evt, gestureState);

                if (!isDraggingRef.current && draggableRef.current) {
                    isDraggingRef.current = true;
                    setIsSelected(true);
                    if (onPressRef.current) onPressRef.current();
                }
            },
            onPanResponderRelease: (_, gestureState: PanResponderGestureState) => {
                if (!draggableRef.current) return;

                const finalX = col * TILE + gestureState.dx + TILE / 2;
                const finalY = row * TILE + gestureState.dy + TILE / 2;
                const toCol = Math.min(Math.max(Math.floor(finalX / TILE), 0), BOARD_SIZE - 1);
                const toRow = Math.min(Math.max(Math.floor(finalY / TILE), 0), BOARD_SIZE - 1);

                Animated.spring(position, {
                    toValue: { x: 0, y: 0 },
                    friction: 5,
                    useNativeDriver: false,
                }).start();

                if (onLetGoRef.current) onLetGoRef.current(toRow, toCol, rowRef.current, colRef.current);

                setIsSelected(false);
                isDraggingRef.current = false;
            },
        })
    ).current;

    const customStyle = pieceStyle.getStyle(team, TILE, theme);
    const customContent = pieceStyle.getContent?.(team, TILE, theme);

    const translate = position.getTranslateTransform();
    const extraScale = isSelected ? [{ scale: 1.15 }] : [];
    const combinedTransform = [...translate, ...extraScale];

    return (
        <Animated.View
            {...panResponder.panHandlers}
            style={[
                { width: TILE, height: TILE },
                customStyle,
                isSelected && {
                    borderWidth: 3,
                    borderColor: 'orange',
                },
                {
                    position: 'absolute',
                    left: col * TILE,
                    top: row * TILE,
                    transform: combinedTransform,
                    zIndex: 2,
                },
            ]}
        >
            {customContent}
        </Animated.View>
    );
}