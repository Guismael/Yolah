import React from 'react';
import { Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { paramsStyles, SPACING, getDynamicStyles, COLORS, SHADOWS, headerStyles, customizationStyles as styles } from '../assets/Styles/styles';
import { BOARD_THEMES, BoardTheme, DEFAULT_THEME } from '../config/themes';
import { PIECE_STYLES, PieceStyle, DEFAULT_PIECE_STYLE } from '../config/pieceStyles';
import { useGameSettings } from '../context/GameSettingsContext';
import ChessBackground from '../components/ChessBackground';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useI18n } from '../context/useI18n';

type RootStackParamList = {
  Home: undefined;
};

type ThemePreset = {
    id: string;
    title: string;
    subtitle: string;
    icon: string;
    accent: string;
    boardThemeName: string;
    pieceStyleName: string;
};

const THEME_PRESETS: ThemePreset[] = [
    {
        id: 'timeless-duel',
        title: 'Timeless Duel',
        subtitle: 'Warm wood board with classic round pieces.',
        icon: '♜',
        accent: '#7A4B1F',
        boardThemeName: 'Classic Wood',
        pieceStyleName: 'Classic',
    },
    {
        id: 'castle-legends',
        title: 'Castle Legends',
        subtitle: 'Royal hall atmosphere with premium glow tokens.',
        icon: '🏰',
        accent: '#8D6B4F',
        boardThemeName: 'Castle Hall',
        pieceStyleName: 'Glow',
    },
    {
        id: 'emerald-rush',
        title: 'Emerald Rush',
        subtitle: 'Fresh forest tones and clean strategic readability.',
        icon: '🌿',
        accent: '#2E7D32',
        boardThemeName: 'Forest',
        pieceStyleName: 'Classic',
    },
    {
        id: 'cyber-night',
        title: 'Cyber Night',
        subtitle: 'Neon contrast setup tuned for a futuristic look.',
        icon: '⚡',
        accent: '#6C3CFF',
        boardThemeName: 'Galaxy',
        pieceStyleName: 'Neon',
    },
    {
        id: 'moonlit-minimal',
        title: 'Moonlit Minimal',
        subtitle: 'Soft moon palette with lightweight outline pieces.',
        icon: '🌙',
        accent: '#607D8B',
        boardThemeName: 'Moon',
        pieceStyleName: 'Minimal',
    },
    {
        id: 'desert-storm',
        title: 'Desert Storm',
        subtitle: 'Sharp high-contrast board with bold piece silhouettes.',
        icon: '🏜️',
        accent: '#B76B3A',
        boardThemeName: 'Desert',
        pieceStyleName: 'Glow',
    },
    {
        id: 'sakura-diamond',
        title: 'Sakura Diamond',
        subtitle: 'Geometric precision on a dreamy floral board.',
        icon: '🌸',
        accent: '#8D4F6A',
        boardThemeName: 'Cherry Blossom',
        pieceStyleName: 'Diamond',
    },
    {
        id: 'nebula-gem',
        title: 'Nebula Gem',
        subtitle: 'Crystalline gems drifting through a cosmic cloud.',
        icon: '💎',
        accent: '#C050A0',
        boardThemeName: 'Nebula',
        pieceStyleName: 'Gem',
    },
    {
        id: 'dungeon-oath',
        title: 'Dungeon Oath',
        subtitle: 'Cold stone board with sharp angular pieces.',
        icon: '⚔️',
        accent: '#4A4540',
        boardThemeName: 'Stone',
        pieceStyleName: 'Diamond',
    },
    {
        id: 'royal-gem',
        title: 'Royal Gem',
        subtitle: 'Ornate court adorned with glittering jewels.',
        icon: '👑',
        accent: '#7A5C3A',
        boardThemeName: 'Royal Court',
        pieceStyleName: 'Gem',
    },
    {
        id: 'crimson-diamond',
        title: 'Crimson Diamond',
        subtitle: 'Bold red board with sharp angular pieces.',
        icon: '◆',
        accent: '#7A1A1A',
        boardThemeName: 'Crimson',
        pieceStyleName: 'Diamond',
    },
];

const getBoardThemeByName = (name: string): BoardTheme => {
    return BOARD_THEMES.find((candidate) => candidate.name === name) ?? DEFAULT_THEME;
};

const getPieceStyleByName = (name: string): PieceStyle => {
    return PIECE_STYLES.find((candidate) => candidate.name === name) ?? DEFAULT_PIECE_STYLE;
};

const getPresetAccentColor = (themeOption: BoardTheme): string => {
    if (themeOption.category === 'space') return '#7E6CDA';
    if (themeOption.category === 'nature') return '#3F8B4A';
    if (themeOption.category === 'medieval') return '#8E684D';
    return '#8A5B2F';
};

const ThemePatternPreview = ({ boardTheme }: { boardTheme: BoardTheme }) => {
    const accent = getPresetAccentColor(boardTheme);

    return (
        <View style={[styles.shapePreview, { backgroundColor: `${boardTheme.color1}BB` }]}>
            <View style={[styles.shapeOrbPrimary, { backgroundColor: `${boardTheme.color2}AA` }]} />
            <View style={[styles.shapeOrbSecondary, { backgroundColor: `${accent}88` }]} />

            {boardTheme.category === 'medieval' && (
                <>
                    <View style={[styles.shapeBand, styles.shapeBandLeft, { backgroundColor: `${accent}99` }]} />
                    <View style={[styles.shapeBand, styles.shapeBandRight, { backgroundColor: `${boardTheme.color2}88` }]} />
                </>
            )}
            {boardTheme.category === 'nature' && (
                <>
                    <View style={[styles.shapeLeaf, styles.shapeLeafTop, { backgroundColor: `${accent}AA` }]} />
                    <View style={[styles.shapeLeaf, styles.shapeLeafBottom, { backgroundColor: `${boardTheme.color2}99` }]} />
                </>
            )}
            {boardTheme.category === 'space' && (
                <>
                    <View style={[styles.shapeStar, styles.shapeStarOne, { backgroundColor: '#FFFFFFCC' }]} />
                    <View style={[styles.shapeStar, styles.shapeStarTwo, { backgroundColor: '#FFFFFFAA' }]} />
                    <View style={[styles.shapeComet, { backgroundColor: `${accent}AA` }]} />
                </>
            )}
            {boardTheme.category === 'colors' && (
                <>
                    <View style={[styles.shapeStripe, styles.shapeStripeTop, { backgroundColor: `${boardTheme.color2}66` }]} />
                    <View style={[styles.shapeStripe, styles.shapeStripeBottom, { backgroundColor: `${accent}66` }]} />
                </>
            )}
        </View>
    );
};

export default function Customization() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { theme, setTheme, pieceStyle, setPieceStyle, darkMode } = useGameSettings();
    const { t } = useI18n();
    const ds = getDynamicStyles(darkMode);

    const selectedPresetId = React.useMemo(() => {
        return (
            THEME_PRESETS.find(
                (preset) =>
                    preset.boardThemeName === theme.name &&
                    preset.pieceStyleName === pieceStyle.name
            )?.id ?? null
        );
    }, [theme.name, pieceStyle.name]);

    const applyPreset = (preset: ThemePreset) => {
        setTheme(getBoardThemeByName(preset.boardThemeName));
        setPieceStyle(getPieceStyleByName(preset.pieceStyleName));
    };

    return (
        <View style={[headerStyles.container, ds.bg.screen]}>
            <View style={[headerStyles.header, ds.bg.card]}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                    <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
                </TouchableOpacity>
                <Text style={[headerStyles.headerTitle, ds.text.dark]}>{t('customization.header')}</Text>
                <View style={{ width: 24 }} />
            </View>
            <ScrollView
                style={{ flex: 1, backgroundColor: ds.bg.screen.backgroundColor }}
                contentContainerStyle={{
                    paddingVertical: SPACING.xxl,
                    paddingHorizontal: SPACING.lg,
                }}
                showsVerticalScrollIndicator={false}
            >
                <ChessBackground isDark={darkMode} />
                <View style={[paramsStyles.card, ds.bg.card]}>

                    <Text style={[paramsStyles.heading, ds.text.dark]}>{t('customization.heading')}</Text>
                    <Text style={[paramsStyles.sub, ds.text.primary]}>
                        {t('customization.sub')}
                    </Text>

                    <View style={styles.presetList}>
                        {THEME_PRESETS.map((preset) => {
                            const boardTheme = getBoardThemeByName(preset.boardThemeName);
                            const style = getPieceStyleByName(preset.pieceStyleName);
                            const isSelected = selectedPresetId === preset.id;

                            return (
                                <TouchableOpacity
                                    key={preset.id}
                                    style={[
                                        styles.presetCard,
                                        ds.bg.lightBlue,
                                        isSelected && [styles.selectedPresetCard, ds.primary.border],
                                    ]}
                                    onPress={() => applyPreset(preset)}
                                    activeOpacity={0.85}
                                >
                                    <View style={styles.previewCol}>
                                        <ThemePatternPreview boardTheme={boardTheme} />
                                        <View style={styles.piecePreviewRow}>
                                            <View style={[styles.miniPiece, style.getStyle('w', 22, boardTheme)]}>
                                                {style.getContent?.('w', 22, boardTheme)}
                                            </View>
                                            <View style={[styles.miniPiece, style.getStyle('b', 22, boardTheme)]}>
                                                {style.getContent?.('b', 22, boardTheme)}
                                            </View>
                                        </View>
                                    </View>

                                    <View style={styles.textCol}>
                                        <View style={styles.titleRow}>
                                            <Text style={styles.packIcon}>{preset.icon}</Text>
                                            <Text style={[styles.presetTitle, ds.text.dark]}>{t(`customization.presets.${preset.id}.title`)}</Text>
                                            {isSelected && (
                                                <View
                                                    style={[
                                                        styles.appliedBadge,
                                                        { backgroundColor: preset.accent },
                                                    ]}
                                                >
                                                    <Text style={styles.appliedBadgeText}>{t('customization.applied')}</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text style={[styles.presetSubtitle, ds.text.primary]}>
                                            {t(`customization.presets.${preset.id}.subtitle`)}
                                        </Text>
                                        <Text style={[styles.presetDetails, ds.text.primary]}>
                                            {`${boardTheme.name} + ${style.name}`}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <Text style={[paramsStyles.note, ds.text.primary]}>
                        {t('customization.note')}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
}

