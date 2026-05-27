// Ce fichier contient tous les thèmes disponibles pour le plateau
// idem ici j'améliorerai les choix plus tard

export type BoardTheme = {
    name: string;           // Nom du thème
    color1: string;         // Couleur des cases claires
    color2: string;         // Couleur des cases foncées
    icon: string;           // Emoji pour représenter le thème
    backgroundImage?: any;
    category: 'colors' | 'medieval' | 'nature' | 'space';
};

// Liste de tous les thèmes disponibles
// Thèmes couleurs d'abord
export const COLOR_THEMES: BoardTheme[] = [
    {
        name: 'Classic Wood',
        color1: '#f4bd75',
        color2: '#5c370d',
        icon: '🪵',
        category: 'colors'
    },
    {
        name: 'Ocean Blue',
        color1: '#b8e6f5',
        color2: '#1e6a8f',
        icon: '🌊',
        category: 'colors'
    },
    {
        name: 'Green',
        color1: '#c8e6c9',
        color2: '#2e7d32',
        icon: '🌲',
        category: 'colors'
    },
    {
        name: 'Purple',
        color1: '#e1bee7',
        color2: '#6a1b9a',
        icon: '💜',
        category: 'colors'
    },
    {
        name: 'Sunset Orange',
        color1: '#ffccbc',
        color2: '#d84315',
        icon: '🌅',
        category: 'colors'
    },
    {
        name: 'Midnight',
        color1: '#b9d2dfff',
        color2: '#033c58ff',
        icon: '🌙',
        category: 'colors'
    },
    {
        name: 'Pink',
        color1: '#ffd2f2ff',
        color2: '#b62178ff',
        icon: '🌸',
        category: 'colors'
    },
    {
        name: 'Crimson',
        color1: '#F9E8E8',
        color2: '#7A1A1A',
        icon: '♦',
        category: 'colors'
    },
];

export const MEDIEVAL_THEMES: BoardTheme[] = [
    {
    name: 'Stone',
    color1: '#8b8680',
    color2: '#3d3a36',
    icon: '🪨',
    category: 'medieval',
    backgroundImage: require('../assets/images/Themes/medievalstone.jpg')
    },
    {
    name: 'Castle Hall',
    color1: '#a0826d',
    color2: '#4a3728',
    icon: '🏰',
    category: 'medieval',
    backgroundImage: require('../assets/images/Themes/castlehall.jpg')
    },
    {
    name: 'Royal Court',
    color1: '#b8967d',
    color2: '#4b2e03ff',
    icon: '👑',
    category: 'medieval',
    backgroundImage: require('../assets/images/Themes/court.jpg')
    },
]

export const NATURE_THEMES: BoardTheme[] = [
    {
        name: 'Forest',
        color1: '#c8e6c9',
        color2: '#2e7d32',
        icon: '🌲',
        category: 'nature',
        backgroundImage: require('../assets/images/Themes/Forest.jpg')
    },
    {
        name: 'Desert',
        color1: '#e8d8be',
        color2: '#6d4f2e',
        icon: '🏜️',
        category: 'nature',
        backgroundImage: require('../assets/images/Themes/Desert.jpg')
    },
    {
        name: 'Cherry Blossom',
        color1: '#f8bbd0',
        color2: '#3e3e3eff',
        icon: '🌺',
        category: 'nature',
        backgroundImage: require('../assets/images/Themes/cherryblossom.jpg')
    },
]

export const SPACE_THEMES: BoardTheme[] = [
    {
        name: 'Galaxy',
        color1: '#7c4dff',
        color2: '#1a0033',
        icon: '🌌',
        category: 'space',
        backgroundImage: require('../assets/images/Themes/Galaxy.jpg')
    },
    {
        name: 'Nebula',
        color1: '#ff6ec7',
        color2: '#1e1e3f',
        icon: '🌠',
        category: 'space',
        backgroundImage: require('../assets/images/Themes/nebula.jpg') 
    },
    {
        name: 'Moon',
        color1: '#b7c3cf',
        color2: '#334452',
        icon: '🌕',
        category: 'space',
        backgroundImage: require('../assets/images/Themes/moon.jpg') 
    },
]


export const BOARD_THEMES: BoardTheme[] = [
    ...COLOR_THEMES,
    ...MEDIEVAL_THEMES,
    ...NATURE_THEMES,
    ...SPACE_THEMES,
];

// Thème par défaut (le premier de la liste)
export const DEFAULT_THEME = COLOR_THEMES[0];