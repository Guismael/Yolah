import React from 'react';
import { View } from 'react-native';
import { BoardTheme } from './themes';

type PiecePalette = {
  whiteFill: string;
  blackFill: string;
  whiteBorder: string;
  blackBorder: string;
  glow: string;
};

const DEFAULT_PIECE_PALETTE: PiecePalette = {
  whiteFill: '#F2F4F7',
  blackFill: '#1E2430',
  whiteBorder: '#596576',
  blackBorder: '#D9E2F1',
  glow: '#8AA4FF',
};

const THEME_PIECE_PALETTES: Partial<Record<BoardTheme['category'], PiecePalette>> = {
  colors: {
    whiteFill: '#F6F3EC',
    blackFill: '#1C232E',
    whiteBorder: '#635543',
    blackBorder: '#DCE5F2',
    glow: '#8A84D8',
  },
  medieval: {
    whiteFill: '#ECDDCA',
    blackFill: '#2B211A',
    whiteBorder: '#6A503B',
    blackBorder: '#DFC7A8',
    glow: '#B99763',
  },
  nature: {
    whiteFill: '#E9F2DE',
    blackFill: '#1D3428',
    whiteBorder: '#4D6F4B',
    blackBorder: '#C5DDBE',
    glow: '#67A56E',
  },
  space: {
    whiteFill: '#DEE6FF',
    blackFill: '#141A30',
    whiteBorder: '#556394',
    blackBorder: '#C8D4FF',
    glow: '#8D7DFF',
  },
};

const getPiecePalette = (theme?: BoardTheme): PiecePalette => {
  if (!theme) return DEFAULT_PIECE_PALETTE;
  return THEME_PIECE_PALETTES[theme.category] ?? DEFAULT_PIECE_PALETTE;
};

export type PieceStyle = {
    name: string;
    icon: string;
    getStyle: (team: 'b' | 'w', size: number, theme?: BoardTheme) => any;
    getContent?: (team: 'b' | 'w', size: number, theme?: BoardTheme) => any;
};

export const PIECE_STYLES: PieceStyle[] = [
    {
        name: 'Classic',
        icon: '⚫',
    getStyle: (team, size, theme) => {
      const palette = getPiecePalette(theme);
      return {
      backgroundColor: team === 'w' ? palette.whiteFill : palette.blackFill,
      borderWidth: 2,
      borderColor: team === 'w' ? palette.whiteBorder : palette.blackBorder,
            borderRadius: size / 2, // Pion rond
    };
  }
    },

    {
        name: 'Minimal',
        icon: '⚪',
    getStyle: (team, size, theme) => {
      const palette = getPiecePalette(theme);
      return {
            backgroundColor: 'transparent',  
            borderRadius: size / 2,
            borderWidth: 4,
      borderColor: team === 'w' ? palette.whiteFill : palette.blackFill,
    };
  }
    },
    {
    name: 'Glow',
    icon: '⭐',
  getStyle: (team, size, theme) => {
    const palette = getPiecePalette(theme);
    return {
    backgroundColor: team === 'w' ? palette.whiteFill : palette.blackFill,
      borderRadius: 8,
      borderWidth: 3,
    borderColor: team === 'w' ? palette.glow : palette.blackBorder,
    shadowColor: team === 'w' ? palette.glow : palette.blackBorder,
      shadowOpacity: 0.8,
      shadowRadius: 6,
      elevation: 10,
  };
  }
  },
  {
    name: 'Neon',
    icon: '🔮',
    getStyle: (team, size, theme) => {
      const palette = getPiecePalette(theme);
      return {
        backgroundColor: team === 'w' ? palette.whiteFill : palette.blackFill,
        borderRadius: size / 2,
        borderWidth: 3,
        borderColor: team === 'w' ? palette.glow : palette.blackBorder,
        shadowColor: team === 'w' ? palette.glow : palette.blackBorder,
        shadowOpacity: 0.7,
        shadowRadius: 8,
        elevation: 12,
      };
    },
  },
  {
    name: 'Gem',
    icon: '💎',
    getStyle: (team, size, theme) => {
      const palette = getPiecePalette(theme);
      return {
        backgroundColor: team === 'w' ? palette.whiteFill : palette.blackFill,
        borderRadius: size / 2,
        borderWidth: 2.5,
        borderColor: team === 'w' ? palette.glow : palette.blackBorder,
        shadowColor: palette.glow,
        shadowOpacity: 0.65,
        shadowRadius: 6,
        elevation: 9,
      };
    },
    getContent: (team, size, theme) => {
      const palette = getPiecePalette(theme);
      const spotSize = Math.round(size * 0.27);
      return React.createElement(View, {
        style: {
          position: 'absolute',
          width: spotSize,
          height: spotSize,
          borderRadius: spotSize / 2,
          top: Math.round(size * 0.13),
          left: Math.round(size * 0.21),
          backgroundColor: team === 'w' ? palette.glow + 'BB' : palette.whiteFill + '33',
        },
      });
    },
  },
  {
    name: 'Diamond',
    icon: '◆',
    getStyle: () => ({
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    }),
    getContent: (team, size, theme) => {
      const palette = getPiecePalette(theme);
      const d = Math.round(size * 0.56);
      return React.createElement(View, {
        style: {
          width: d,
          height: d,
          backgroundColor: team === 'w' ? palette.whiteFill : palette.blackFill,
          borderWidth: 2.5,
          borderColor: team === 'w' ? palette.whiteBorder : palette.blackBorder,
          transform: [{ rotate: '45deg' }],
          shadowColor: palette.glow,
          shadowOpacity: 0.4,
          shadowRadius: 4,
          elevation: 6,
        },
      });
    },
  },
];

export const DEFAULT_PIECE_STYLE = PIECE_STYLES[0];