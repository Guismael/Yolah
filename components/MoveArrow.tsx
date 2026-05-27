import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface MoveArrowProps {
  from: [number, number]; // [row, col]
  to: [number, number];   // [row, col]
  tileSize: number;
  player: 'b' | 'w';
}

export default function MoveArrow({ from, to, tileSize, player }: MoveArrowProps) {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    opacity.setValue(0);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [from[0], from[1], to[0], to[1]]);

  const fromX = from[1] * tileSize + tileSize / 2;
  const fromY = from[0] * tileSize + tileSize / 2;
  const toX = to[1] * tileSize + tileSize / 2;
  const toY = to[0] * tileSize + tileSize / 2;

  const dx = toX - fromX;
  const dy = toY - fromY;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;

  if (length < 1) return null;

  const midX = (fromX + toX) / 2;
  const midY = (fromY + toY) / 2;

  const SHAFT_THICKNESS = 5;
  const HEAD_SIZE = 18;
  const START_OFFSET = tileSize * 0.28;
  const END_OFFSET = tileSize * 0.18;
  const shaftWidth = length - START_OFFSET - HEAD_SIZE * 0.85 - END_OFFSET;

  const color = player === 'w' ? 'rgba(96, 165, 250, 0.95)' : 'rgba(251, 191, 36, 0.95)';
  const glowColor = player === 'w' ? 'rgba(96, 165, 250, 0.25)' : 'rgba(251, 191, 36, 0.25)';
  const cellColor = player === 'w' ? 'rgba(96, 165, 250, 0.18)' : 'rgba(251, 191, 36, 0.18)';

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFillObject, { zIndex: 10, opacity }]}
    >
      {/* From cell highlight */}
      <View style={{
        position: 'absolute',
        left: from[1] * tileSize,
        top: from[0] * tileSize,
        width: tileSize,
        height: tileSize,
        backgroundColor: cellColor,
        borderRadius: 4,
      }} />
      {/* To cell highlight */}
      <View style={{
        position: 'absolute',
        left: to[1] * tileSize,
        top: to[0] * tileSize,
        width: tileSize,
        height: tileSize,
        backgroundColor: cellColor,
        borderRadius: 4,
      }} />

      {/* Arrow — rotated around its midpoint */}
      <View style={{
        position: 'absolute',
        left: midX - length / 2,
        top: midY,
        width: length,
        height: 0,
        transform: [{ rotate: `${angleDeg}deg` }],
      }}>
        {/* Glow */}
        <View style={{
          position: 'absolute',
          left: START_OFFSET,
          top: -(SHAFT_THICKNESS * 2),
          width: shaftWidth,
          height: SHAFT_THICKNESS * 4,
          backgroundColor: glowColor,
          borderRadius: SHAFT_THICKNESS * 2,
        }} />
        {/* Shaft */}
        <View style={{
          position: 'absolute',
          left: START_OFFSET,
          top: -(SHAFT_THICKNESS / 2),
          width: shaftWidth,
          height: SHAFT_THICKNESS,
          backgroundColor: color,
          borderRadius: SHAFT_THICKNESS / 2,
        }} />
        {/* Arrowhead */}
        <View style={{
          position: 'absolute',
          left: length - HEAD_SIZE - END_OFFSET,
          top: -(HEAD_SIZE / 2),
          width: 0,
          height: 0,
          borderTopWidth: HEAD_SIZE / 2,
          borderBottomWidth: HEAD_SIZE / 2,
          borderLeftWidth: HEAD_SIZE,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: color,
        }} />
      </View>
    </Animated.View>
  );
}
