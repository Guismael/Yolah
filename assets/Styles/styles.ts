import { StyleSheet, Dimensions, Platform } from 'react-native';

// Couleurs du thème
const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

// compute responsive badge size/font based on screen width
const BADGE_SIZE = Math.min(88, Math.max(48, Math.round(SCREEN_WIDTH * 0.14)));
const BADGE_FONT = Math.min(28, Math.max(16, Math.round(BADGE_SIZE * 0.35)));
const CARD_MAX_WIDTH = Math.min(500, Math.round(SCREEN_WIDTH * 0.86));
const CARD_MIN_HEIGHT = Math.min(360, Math.round(SCREEN_HEIGHT * 0.28));

export const COLORS = {
  primary: '#2E87AD',
  background: '#EAF6FB',
  white: '#FFFFFF',
  lightBlue: '#F5FFFF',
  border: '#DDEFF4',
  text: {
    primary: '#6C7A83',
    dark: '#153B4A',
  },
  game: {
    red: 'red',
    black: 'black',
    darkred: 'darkred',
    lightblue: 'lightblue',
    grey: 'grey',
    green: 'green',
    blue: 'blue',
    player1Color : "#F5F5F5",
    player2Color : "#212121", 
    boardColor1 : "#f4bd75ff",
    boardColor2 : "#5c370dff",
  }
};

// Espacements réutilisables pour les paddings et margins (pour garder une cohérence)
export const SPACING = {
  xs: 6,
  sm: 10,
  md: 12,
  lg: 16,
  xl: 18,
  xxl: 20,
};

// Ombres réutilisables
export const SHADOWS = {
  light: {
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  strong: {
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
  },
  fab: {
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 6,
  }
};
//Un styleSheet par ecran 
// Styles pour Index (Home)
export const homeStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xxl,
  },
  card: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.xl,
    alignItems: 'center',
    ...SHADOWS.strong,
  },
  logoWrap: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xs,
  },
  logo: {
    width: '92%',
    height: 200,
    borderRadius: 8,
    marginVertical: SPACING.xs,
    backgroundColor: 'transparent',
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '800',
    fontFamily: 'Poppins_600SemiBold',
    color: COLORS.text.dark,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: COLORS.text.primary,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  // NOUVEAU : Container pour tous les boutons
  buttonsContainer: {
    width: '100%',
    marginTop: SPACING.md,
    gap: 10,
    alignItems: 'center',
  },
  button: {
    paddingVertical: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    width: '100%', // Pleine largeur
    backgroundColor: COLORS.primary,
  },
  primaryText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
  },
  secondary: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  secondaryText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
    fontFamily: 'Poppins_600SemiBold',
  },
  // NOUVEAU : Ligne avec 2 boutons côte à côte
  buttonRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'space-between',
  },
  // NOUVEAU : Bouton qui prend la moitié de la largeur
  halfButton: {
    flex: 1,
  },
  iconButton: {
    marginTop: 8,
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: COLORS.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    marginTop: SPACING.lg,
    color: COLORS.text.primary,
    fontSize: 13,
    fontFamily: 'Poppins_600SemiBold',
  },
  
});

// Styles pour Game
export const gameStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    padding: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeButton: {
    position: 'absolute',
    top: 50,
    left: SPACING.xl,
    backgroundColor: COLORS.white,
    padding: SPACING.sm,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    ...SHADOWS.medium,
    elevation: 12,
    zIndex: 999,
  },
  fab: {
    position: 'absolute',
    right: SPACING.xl,
    bottom: 24,
    width: 52,
    height: 52,
    borderRadius: 52,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.fab,
  },
  iconBack: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// Styles pour Gameplay
export const gameplayStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
  },
  boardContainer: {
    position: 'relative',
  },
  scoreOverlay: {
    position: 'absolute',
    top: -36,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
    pointerEvents: 'none',
  },
  scoreCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 4,
  },
  scoreText: {
    fontSize: 15,
    fontWeight: '700',
  },
  scoreTextRed: {
    color: COLORS.game.red,
  },
  scoreTextBlack: {
    color: COLORS.game.black,
    marginLeft: SPACING.sm,
  },
  turnIndicatorContainer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  turnIndicator: {
    marginTop: SPACING.sm,
    alignItems: 'center',
  },
  turnText: {
    fontSize: 20,
    fontWeight: '700',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 8,
    borderRadius: 8,
  },
  homeButtonGameplay: {
    marginTop: SPACING.sm,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    ...SHADOWS.light,
  },
  homeButtonText: {
    color: COLORS.text.dark,
    fontWeight: '700',
  },
});

// Styles for board elements (squares/circles)
export const boardElementStyles = StyleSheet.create({
  square: {
    position: 'absolute',
  },
  circle: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// new: styles for Piece
export const pieceStyles = StyleSheet.create({
  white: { backgroundColor: COLORS.game.player1Color },
  black: { backgroundColor: COLORS.game.player2Color },
  selected: {
    backgroundColor: '#2E87AD',
    borderWidth: 3,
    borderColor: 'orange',
    // removed explicit width/height/borderRadius so scale preserves center
  },
  pressedFeedback: {
    borderWidth: 2,
    borderColor: 'orange',
  },
});

// new: styles for Square
export const squareStyles = StyleSheet.create({
  container: {
    // allows squares to stack in board container
  },
  pressable: {
    // any shared static styles can go here (size is set dynamically by TILE)
  },
});

// new: styles for Board component layout
export const boardStyles = StyleSheet.create({
  outerWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  boardContainer: {
    position: 'relative',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  outer: {
    alignItems: 'center',
    width: '100%',
    paddingVertical: 0,
  },
});

// Endgame panel / responsive placement styles
export const endgameStyles = StyleSheet.create({
  panel: {
    padding: 10,
    backgroundColor: '#fff8e1',
    marginBottom: 8,
    borderRadius: 6,
    alignItems: 'center',
    minWidth: 180,
  },
  computingBox: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#ffe6b3',
    minWidth: 140,
    alignItems: 'center',
  },
  endButton: {
    backgroundColor: '#007bff',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  endButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  titleText: {
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  // wrapper for right-side absolute placement — left/top provided dynamically by component
  panelRightWrapper: {
    position: 'absolute',
    transform: [{ translateY: -20 }],
  },
  // wrapper used when panel is placed under the board
  panelBottomWrapper: {
    marginTop: 12,
    alignItems: 'center',
  },
});

// Styles for GameOver modal / card
export const gameOverStyles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: Math.min(CARD_MAX_WIDTH, Math.round(SCREEN_WIDTH * 0.92)),
    minHeight: Math.max(CARD_MIN_HEIGHT, Math.round(SCREEN_HEIGHT * 0.22)),
    paddingVertical: Math.max(14, Math.round(SCREEN_HEIGHT * 0.02)),
    paddingHorizontal: Math.max(14, Math.round(SCREEN_WIDTH * 0.04)),
    borderRadius: Math.round(Math.min(24, SCREEN_WIDTH * 0.03)),
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.strong,
    ...Platform.select({ android: { elevation: Math.max(6, Math.round(SCREEN_WIDTH * 0.01)) } }),
  },
  title: {
    fontSize: Math.min(26, Math.max(16, Math.round(SCREEN_WIDTH * 0.06))),
    fontWeight: '800',
    marginBottom: SPACING.md,
    color: COLORS.text.dark,
    textAlign: 'center',
  },
  resultRow: {
    flexDirection: SCREEN_WIDTH < 420 ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  winnerBadge: {
    width: BADGE_SIZE,
    height: BADGE_SIZE,
    borderRadius: Math.round(BADGE_SIZE / 2),
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.medium,
    marginRight: SCREEN_WIDTH < 420 ? 0 : SPACING.md,
    marginBottom: SCREEN_WIDTH < 420 ? SPACING.sm : 0,
  },
  badgeBlack: {
    backgroundColor: COLORS.game.player2Color,
    borderWidth: 0,
  },
  badgeWhite: {
    backgroundColor: COLORS.game.player1Color,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeNeutral: {
    backgroundColor: COLORS.lightBlue,
  },
  badgeTextBlack: {
    color: COLORS.white,
    fontWeight: '800',
    fontSize: BADGE_FONT,
    textAlign: 'center',
  },
  badgeTextWhite: {
    color: COLORS.text.dark,
    fontWeight: '800',
    fontSize: BADGE_FONT,
    textAlign: 'center',
  },
  winner: {
    fontSize: Math.min(18, Math.max(14, Math.round(SCREEN_WIDTH * 0.045))),
    color: COLORS.text.primary,
    fontWeight: '700',
    flexShrink: 1,
    textAlign: 'center',
    marginHorizontal: SPACING.sm,
  },
  buttonRow: {
    width: '100%',
    flexDirection: SCREEN_WIDTH < 420 ? 'column' : 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: Math.max(14, Math.round(SCREEN_WIDTH * 0.04)),
    paddingVertical: Math.max(8, Math.round(SCREEN_HEIGHT * 0.012)),
    borderRadius: Math.round(Math.min(16, SCREEN_WIDTH * 0.02)),
    marginTop: SCREEN_WIDTH < 420 ? SPACING.sm : 0,
    marginLeft: SCREEN_WIDTH < 420 ? 0 : SPACING.sm,
    minWidth: Math.min(240, Math.max(120, Math.round(SCREEN_WIDTH * 0.36))),
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: '800',
    textAlign: 'center',
    fontSize: Math.min(16, Math.max(14, Math.round(SCREEN_WIDTH * 0.04))),
  },
});


// Styles pour Params (Settings)
export const paramsStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: SPACING.xxl,
    paddingBottom: 40,
  },
  card: {
    width: '100%',
    maxWidth: 680,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: SPACING.xl,
    ...SHADOWS.strong,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins_600SemiBold',
    color: COLORS.text.dark,
    marginBottom: SPACING.xs,
  },
  sub: {
    fontFamily: 'Poppins_600SemiBold',
    color: COLORS.text.primary,
    marginBottom: 14,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  valueBox: {
    width: 48,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.lightBlue,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0F4FA',
  },
  valueText: {
    color: COLORS.text.dark,
    fontWeight: '700',
  },
  note: {
    fontFamily: 'Poppins_600SemiBold',
    marginTop: SPACING.md,
    color: COLORS.text.primary,
    fontSize: 13,
  },
});

// Styles pour Rules
export const rulesStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 680,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: SPACING.xl,
    ...SHADOWS.strong,
  },
  heading: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Poppins_600SemiBold',
    color: COLORS.text.dark,
    marginBottom: SPACING.md,
  },
  ruleList: {
    gap: 8,
    marginBottom: SPACING.md,
  },
  rule: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#405A64',
    fontSize: 15,
    lineHeight: 20,
  },
  bullet: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  note: {
    fontFamily: 'Poppins_600SemiBold',
    marginTop: 8,
    color: COLORS.text.primary,
    fontSize: 13,
  },
  ruleSection: {
    marginBottom: SPACING.xxl,
  },
});
// Styles pour Rules (démos animées)
export const demoStyles = StyleSheet.create({
  container: {
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontFamily: 'Poppins_600SemiBold',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    fontStyle: 'italic',
    textAlign: 'center',
    fontWeight: '600',
  },
  boardContainer: {
    padding: 10,
    backgroundColor: 'rgba(46, 135, 173, 0.05)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  board: {
    width: 250,
    height: 250,
    position: 'relative',
  },
  row: {
    flexDirection: 'row',
  },
  square: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(46, 135, 173, 0.6)',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  piece: {
    position: 'absolute',
    left: 5,
    top: 5,
    width: 40,
    height: 40,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 5,
  },
  trailPiece: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: SPACING.sm,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  singleSquare: {
    width: 80,
    height: 80,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cross: {
    position: 'absolute',
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  crossLine: {
    position: 'absolute',
    width: 50,
    height: 4,
    backgroundColor: COLORS.game.player2Color,
    borderRadius: 2,
  },
});

//dark mode styles
export const DARK_COLORS = {
    ...COLORS,
    background: '#0D1B2A',
    white: '#1B263B',
    lightBlue: '#1e3b59ff',
    border: '#415A77',
    text: {
        primary: '#A8DADC',
        dark: '#F1FAEE',
    }
};

// Fonction pour obtenir les couleurs selon le mode
export function getColors(isDark: boolean) {
    return isDark ? DARK_COLORS : COLORS;
}

// Fonction pour obtenir les styles dynamiques facilement
export function getDynamicStyles(isDark: boolean) {
    const colors = getColors(isDark);
    
    return {
        // Textes
        text: {
            dark: { color: colors.text.dark },
            primary: { color: colors.text.primary },
        },
        // Backgrounds
        bg: {
            screen: { backgroundColor: colors.background },
            card: { backgroundColor: colors.white },
            lightBlue: { backgroundColor: colors.lightBlue },
        },
        // Bordures
        border: { borderColor: colors.border },
        // Primary
        primary: {
            bg: { backgroundColor: colors.primary },
            text: { color: colors.primary },
            border: { borderColor: colors.primary },
        }
    };
}

// Styles pour Customization
export const customStyles = StyleSheet.create({
  section: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Poppins_600SemiBold',
    marginBottom: SPACING.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.xs,
  },
  button: {
    width: 100,
    padding: SPACING.md,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOWS.light,
  },
  selectedButton: {
    ...SHADOWS.medium,
  },
  preview: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: SPACING.xs,
  },
  previewSquare: {
    width: 30,
    height: 30,
    borderRadius: 4,
  },
  piecePreview: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.xs,
    height: 36,
    alignItems: 'center',
  },
  miniPiece: {
    width: 28,
    height: 28,
  },
  emoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  name: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Poppins_600SemiBold',
    textAlign: 'center',
  },
  separator: {
    height: 1,
    marginVertical: SPACING.xl,
  },
  imagePreview: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginBottom: SPACING.xs,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Assombrit légèrement l'image
    borderRadius: 8,
  },
});

// Styles pour Header custom (Settings, Customization, Rules)
export const headerStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingTop: 50, // Espace pour status bar
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    ...SHADOWS.light,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Poppins_600SemiBold',
  },
});

//Styles pour settings
export const settingsStyles = StyleSheet.create({
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.sm,
        borderRadius: 12,
        marginBottom: SPACING.sm,
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    settingLabel: {
        fontSize: 16,
        fontWeight: '600',
        fontFamily: 'Poppins_600SemiBold',
    },
    volumeContainer: {
        borderRadius: 12,
        padding: SPACING.md,
        marginBottom: SPACING.sm,
    },
    volumeLabel: {
        fontSize: 14,
        fontWeight: '600',
        fontFamily: 'Poppins_600SemiBold',
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    volumeControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACING.md,
    },
    languageControls: {
      flexDirection: 'row',
      gap: 8,
      flexShrink: 1,
    },
    volumeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        ...SHADOWS.light,
    },
    languageButton: {
      minHeight: 40,
      minWidth: 72,
      paddingHorizontal: 12,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      ...SHADOWS.light,
    },
    languageButtonText: {
      fontSize: 13,
      fontWeight: '700',
      textAlign: 'center',
      fontFamily: 'Poppins_600SemiBold',
    },
    volumeBar: {
        flex: 1,
        height: 8,
        backgroundColor: COLORS.white,
        borderRadius: 4,
        overflow: 'hidden',
    },
    volumeFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 4,
    },
    separator: {
        height: 1,
        marginVertical: SPACING.xl,
    },
});

// Shared selection screen styles (TimerSelect + GameModeSelect)
export const selectionScreenStyles = StyleSheet.create({
    screen: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    screenLight: { backgroundColor: '#EAF6FB' },
    screenDark: { backgroundColor: '#0f172a' },
    content: { padding: 20, width: '100%', maxWidth: 420, gap: 20 },
    title: { color: '#111827', fontWeight: '600', fontSize: 25, fontFamily: 'Poppins_600SemiBold', textAlign: 'center' },
    titleDark: { color: '#f8fafc' },
    choiceContainer: { flexDirection: 'column', gap: 20, width: '100%', maxWidth: 300, alignSelf: 'center' },
    choiceButton: { paddingVertical: 18, paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
    noButton: { backgroundColor: '#F3E8FF', borderColor: '#9e6df7' },
    yesButton: { backgroundColor: '#EDE9FE', borderColor: '#A855F7' },
    noButtonDark: { backgroundColor: '#312E81', borderColor: '#7C3AED' },
    yesButtonDark: { backgroundColor: '#4C1D95', borderColor: '#7C3AED' },
    choiceTextNo: { fontSize: 18, fontWeight: '700', textAlign: 'center', color: '#7C3AED', fontFamily: 'Poppins_600SemiBold' },
    choiceTextYes: { fontSize: 18, fontWeight: '700', textAlign: 'center', color: '#7C3AED', fontFamily: 'Poppins_600SemiBold' },
    choiceTextDark: { color: '#f8fafc' },
    backBtn: { paddingHorizontal: 25, paddingVertical: 12, backgroundColor: '#F3E8FF', borderWidth: 2, borderColor: '#9e6df7', borderRadius: 12 },
    backBtnDark: { backgroundColor: '#312E81', borderColor: '#7C3AED' },
    backText: { color: '#7C3AED', fontWeight: '700', fontSize: 16, fontFamily: 'Poppins_600SemiBold' },
    backTextDark: { color: '#A78BFA' },
});

// TimerSelect-only styles
export const timerSelectStyles = StyleSheet.create({
    subtitle: { color: '#374151', fontSize: 16, textAlign: 'center', fontFamily: 'Poppins_600SemiBold' },
    subtitleDark: { color: '#e2e8f0' },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, justifyContent: 'center', marginBottom: 20 },
    button: { width: 80, height: 80, borderRadius: 12, backgroundColor: '#F3E8FF', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#9e6df7' },
    buttonDark: { backgroundColor: '#312E81', borderColor: '#7C3AED' },
    selectedButton: { backgroundColor: '#9e6df7', borderColor: '#A855F7' },
    selectedButtonDark: { backgroundColor: '#7C3AED', borderColor: '#A78BFA' },
    text: { fontSize: 20, fontWeight: '600', color: '#111827', fontFamily: 'Poppins_600SemiBold' },
    textDark: { color: '#e5e7eb' },
    selectedText: { color: 'white' },
    selectedTextDark: { color: '#ffffff' },
    buttonGroup: { flexDirection: 'row', gap: 15, justifyContent: 'center', width: '100%' },
    startBtn: { paddingHorizontal: 30, paddingVertical: 12, backgroundColor: '#9e6df7', borderRadius: 12 },
    startBtnDark: { backgroundColor: '#7C3AED' },
    startText: { color: 'white', fontWeight: '700', fontSize: 16, fontFamily: 'Poppins_600SemiBold' },
    startTextDark: { color: '#ffffff' },
});

// GameModeSelect-only styles
export const gameModeSelectStyles = StyleSheet.create({
    difficultyContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center', width: '100%', maxWidth: 360, alignSelf: 'center' },
    difficultyButton: { width: 140, paddingVertical: 20, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2 },
});

// Shared profile screen styles (ProfileSetup + ProfileStats)
export const profileScreenStyles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    backButton: { position: 'absolute', top: 50, left: 20, width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
    card: { width: '100%', maxWidth: 380, padding: 30, borderRadius: 20, borderWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
});

// ProfileSetup-specific styles
export const profileSetupStyles = StyleSheet.create({
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
    pictureSection: { alignItems: 'center', marginBottom: 30 },
    pictureContainer: { width: 140, height: 140, borderRadius: 70, borderWidth: 3, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    profileImage: { width: '100%', height: '100%', borderRadius: 67 },
    cameraText: { fontSize: 12, fontWeight: '600', marginTop: 8, textAlign: 'center' },
    removeButton: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    removeText: { color: '#ff4444', fontSize: 14, fontWeight: '600' },
    inputSection: { marginBottom: 24 },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
    input: { borderWidth: 2, borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16, fontSize: 16, marginBottom: 6 },
    charCount: { fontSize: 12, textAlign: 'right', marginTop: 4 },
    saveButton: { paddingVertical: 16, borderRadius: 12, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
    saveButtonText: { color: 'white', fontSize: 18, fontWeight: '700' },
});

// ProfileStats-specific styles
export const profileStatsStyles = StyleSheet.create({
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center' },
    subtitle: { fontSize: 14, textAlign: 'center', marginTop: 6, marginBottom: 20 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
    statCard: { width: '48%', borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: 'rgba(0,0,0,0.08)' },
    statLabel: { fontSize: 12, fontWeight: '600' },
    statValue: { fontSize: 22, fontWeight: '800', marginTop: 2 },
    ratioRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 12 },
    ratioText: { fontSize: 13, fontWeight: '700' },
});

// Multiplayer screen styles
export const multiplayerStyles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    card: { width: '100%', maxWidth: 400, padding: 30, borderRadius: 20, borderWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8, zIndex: 10 },
    title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 30 },
    button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, paddingHorizontal: 24, borderRadius: 12, marginVertical: 8, gap: 10 },
    primaryButton: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4 },
    secondaryButton: { backgroundColor: 'transparent', borderWidth: 2 },
    buttonText: { color: 'white', fontSize: 18, fontWeight: '600' },
    secondaryButtonText: { fontSize: 18, fontWeight: '600' },
    inputContainer: { marginBottom: 20 },
    label: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
    input: { borderWidth: 2, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, fontSize: 16 },
    infoBox: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, borderRadius: 8, backgroundColor: 'rgba(124, 58, 237, 0.1)', marginBottom: 20, gap: 10 },
    infoText: { fontSize: 14, lineHeight: 20 },
    infoContent: { flex: 1, gap: 8 },
    ipHighlight: { borderWidth: 1, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, fontSize: 24, fontWeight: '800', textAlign: 'center', letterSpacing: 0.5 },
    statusBox: { padding: 12, borderRadius: 8, marginBottom: 20 },
    statusText: { fontSize: 14, textAlign: 'center', fontWeight: '500' },
    logBox: { borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 20, maxHeight: 180 },
    logTitle: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
    logScroll: { flexGrow: 0 },
    logScrollContent: { gap: 4 },
    logText: { fontSize: 12, lineHeight: 16 },
    roomCard: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10, gap: 4 },
    roomTitle: { fontSize: 16, fontWeight: '700' },
    joinButton: { marginTop: 10, alignSelf: 'flex-start', paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10 },
    joinButtonText: { color: 'white', fontSize: 14, fontWeight: '700' },
});

// Score component styles
export const scoreStyles = StyleSheet.create({
    container: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, borderBottomWidth: 2, borderBottomColor: COLORS.border, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, elevation: 4 },
    profileImage: { width: 32, height: 32, borderRadius: 16, borderWidth: 2 },
    player: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    colorDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2 },
    label: { color: '#666', fontWeight: '600', fontFamily: 'Poppins_600SemiBold', marginHorizontal: 8, fontSize: 14 },
    activeLabel: { color: COLORS.primary, fontWeight: '700' },
    score: { color: '#111', fontWeight: '700', fontFamily: 'Poppins_700Bold', fontSize: 16 },
    activeScore: { color: COLORS.primary, fontSize: 18 },
    center: { alignItems: 'center' },
    arrow: { fontWeight: '800' },
    title: { fontWeight: '800', fontFamily: 'Poppins_700Bold', fontSize: 16, color: COLORS.text.dark },
    hint: { fontSize: 10, fontFamily: 'Poppins_400Regular', color: '#999' },
});

// CapturedMarker component styles
export const capturedMarkerStyles = StyleSheet.create({
    container: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', pointerEvents: 'none', justifyContent: 'center', alignItems: 'center' },
    pulse: { position: 'absolute', width: '100%', height: '100%', borderRadius: 1000, overflow: 'hidden' },
    fullSquare: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%' },
    voidPulse: { position: 'absolute', width: '100%', height: '100%' },
    particle: { position: 'absolute', width: 10, height: 10, borderRadius: 5, marginLeft: -5, marginTop: -5 },
    innerShadow: { position: 'absolute', left: 0, top: 0, width: '100%', height: '100%', shadowColor: '#000', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, borderWidth: 1, borderColor: 'rgba(0,0,0,0.2)' },
});

// Timer component styles
export const timerStyles = StyleSheet.create({
    container: { backgroundColor: '#f0f4f7', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 16, minWidth: 80, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#d4e4ed' },
    warning: { backgroundColor: '#ffe8e8', borderColor: '#ff9999' },
    timer: { fontSize: 36, fontWeight: '700', textAlign: 'center', letterSpacing: 1 },
});

// DisconnectNotice component styles
export const disconnectStyles = StyleSheet.create({
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    card: { width: '82%', maxWidth: 360, backgroundColor: COLORS.white, borderRadius: 14, paddingVertical: 22, paddingHorizontal: 18, alignItems: 'center' },
    title: { fontSize: 22, fontWeight: '800', color: COLORS.text.dark, marginBottom: 10, textAlign: 'center' },
    body: { fontSize: 15, color: COLORS.text.primary, textAlign: 'center', marginBottom: 18 },
    button: { backgroundColor: COLORS.primary, paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10 },
    buttonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});

// MultiplayerTurnBar component styles
export const turnBarStyles = StyleSheet.create({
    wrapper: { width: '100%', alignItems: 'center', marginTop: 12, marginBottom: 4 },
    bar: { width: '94%', minHeight: 56, backgroundColor: 'rgba(0,0,0,0.9)', borderRadius: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.2)', paddingVertical: 12, paddingHorizontal: 16, justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.28, shadowRadius: 6, elevation: 6 },
    text: { color: COLORS.white, textAlign: 'center', fontSize: 16, fontWeight: '800', letterSpacing: 0.2 },
});

// game.tsx background decor styles
export const gameBackgroundStyles = StyleSheet.create({
    largeOrb: { position: 'absolute', width: 320, height: 320, borderRadius: 999, top: -90, right: -70 },
    secondaryOrb: { position: 'absolute', width: 280, height: 280, borderRadius: 999, bottom: -80, left: -80 },
    medievalStripe: { position: 'absolute', width: 180, height: 40, borderRadius: 20, transform: [{ rotate: '-28deg' }] },
    medievalStripeLeft: { top: 140, left: -30 },
    medievalStripeRight: { bottom: 160, right: -35 },
    medievalRing: { position: 'absolute', width: 180, height: 180, borderRadius: 999, borderWidth: 16, right: 26, bottom: 84 },
    natureLeaf: { position: 'absolute', width: 130, height: 84, borderRadius: 100, transform: [{ rotate: '-22deg' }] },
    natureLeafTop: { top: 120, right: 24 },
    natureLeafBottom: { bottom: 140, left: 20, transform: [{ rotate: '22deg' }] },
    natureStem: { position: 'absolute', width: 14, height: 180, borderRadius: 10, bottom: 42, right: 72, transform: [{ rotate: '-18deg' }] },
    star: { position: 'absolute', width: 10, height: 10, borderRadius: 99 },
    starOne: { top: 120, right: 80 },
    starTwo: { top: 220, left: 80, width: 7, height: 7 },
    starThree: { top: 70, left: 150, width: 6, height: 6 },
    cometTrail: { position: 'absolute', width: 180, height: 24, borderRadius: 20, top: 190, right: -40, transform: [{ rotate: '-32deg' }] },
    colorBand: { position: 'absolute', width: '125%', height: 78 },
    colorBandTop: { top: 105, left: -35, transform: [{ rotate: '-10deg' }] },
    colorBandBottom: { bottom: 110, left: -32, transform: [{ rotate: '7deg' }] },
});

// Customization screen styles
export const customizationStyles = StyleSheet.create({
    presetList: { gap: SPACING.md },
    presetCard: { flexDirection: 'row', borderRadius: 14, borderWidth: 2, borderColor: 'transparent', padding: SPACING.md, gap: SPACING.md, ...SHADOWS.light },
    selectedPresetCard: { ...SHADOWS.medium },
    previewCol: { width: 86, alignItems: 'center', justifyContent: 'center', gap: SPACING.xs },
    shapePreview: { width: 72, height: 72, borderRadius: 10, overflow: 'hidden', position: 'relative' },
    shapeOrbPrimary: { position: 'absolute', width: 48, height: 48, borderRadius: 999, top: -10, right: -10 },
    shapeOrbSecondary: { position: 'absolute', width: 38, height: 38, borderRadius: 999, bottom: -8, left: -8 },
    shapeBand: { position: 'absolute', width: 58, height: 12, borderRadius: 10, transform: [{ rotate: '-22deg' }] },
    shapeBandLeft: { top: 20, left: -8 },
    shapeBandRight: { bottom: 18, right: -8 },
    shapeLeaf: { position: 'absolute', width: 34, height: 22, borderRadius: 20, transform: [{ rotate: '-18deg' }] },
    shapeLeafTop: { top: 22, right: 8 },
    shapeLeafBottom: { bottom: 16, left: 6, transform: [{ rotate: '18deg' }] },
    shapeStar: { position: 'absolute', borderRadius: 99 },
    shapeStarOne: { width: 7, height: 7, top: 16, right: 14 },
    shapeStarTwo: { width: 5, height: 5, top: 38, left: 14 },
    shapeComet: { position: 'absolute', width: 46, height: 10, borderRadius: 10, top: 42, right: -8, transform: [{ rotate: '-24deg' }] },
    shapeStripe: { position: 'absolute', width: 96, height: 14 },
    shapeStripeTop: { top: 16, left: -12, transform: [{ rotate: '-8deg' }] },
    shapeStripeBottom: { bottom: 16, left: -10, transform: [{ rotate: '8deg' }] },
    piecePreviewRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
    miniPiece: { width: 22, height: 22 },
    textCol: { flex: 1, justifyContent: 'center', gap: 4 },
    titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    packIcon: { fontSize: 18 },
    presetTitle: { flex: 1, fontSize: 16, fontWeight: '700', fontFamily: 'Poppins_600SemiBold' },
    presetSubtitle: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', lineHeight: 18 },
    presetDetails: { fontSize: 12, fontFamily: 'Poppins_600SemiBold', opacity: 0.85 },
    appliedBadge: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
    appliedBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', fontFamily: 'Poppins_700Bold', textTransform: 'uppercase', letterSpacing: 0.4 },
});