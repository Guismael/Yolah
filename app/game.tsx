import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useRoute, RouteProp } from "@react-navigation/native";
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { TouchableOpacity, View, StyleSheet } from "react-native";
import Board from '../components/Board';
import Timer from '../components/Timer'; // jai ajouté le timer dans components (rayen)


import { gameStyles, getDynamicStyles, gameBackgroundStyles as backgroundStyles } from '../assets/Styles/styles';
import { useGameSettings } from '../context/GameSettingsContext';
import { multiplayerService } from '../services/MultiplayerService';
import { DEFAULT_PLAYER_MODE, PlayerMode } from '../config/gameModes';
import { BoardTheme } from '../config/themes';

type GradientTriplet = readonly [string, string, string];

type ThemeBackground = {
  gradientColors: GradientTriplet;
  overlayOpacity: number;
  decorOpacity: number;
};

const CATEGORY_GRADIENTS: Record<BoardTheme['category'], { light: GradientTriplet; dark: GradientTriplet }> = {
  colors: {
    light: ['#E0C39A', '#AA7849', '#5A3A1E'],
    dark: ['#1F160F', '#3B291B', '#6A4A2D'],
  },
  medieval: {
    light: ['#D6C2AB', '#8F6E53', '#3A2A1F'],
    dark: ['#1C1916', '#3B2D22', '#6A4E39'],
  },
  nature: {
    light: ['#DDF0D7', '#7AAF68', '#2D5A2A'],
    dark: ['#0F1D12', '#1E3A23', '#2F5D3B'],
  },
  space: {
    light: ['#D7DEFF', '#707EC7', '#2B2E6E'],
    dark: ['#070B1E', '#141A3E', '#2C2A63'],
  },
};

const THEME_OVERRIDES: Partial<Record<string, { light: GradientTriplet; dark: GradientTriplet }>> = {
  'Classic Wood': {
    light: ['#E8CF9E', '#B07A42', '#5B3417'],
    dark: ['#1E130B', '#3E2816', '#6A4427'],
  },
  Forest: {
    light: ['#E5F6DF', '#7FB86E', '#315F31'],
    dark: ['#0D1A0F', '#1D3B23', '#356641'],
  },
  Desert: {
    light: ['#F2E3CA', '#C9995A', '#7B5330'],
    dark: ['#241A13', '#4B3222', '#7A5032'],
  },
  Galaxy: {
    light: ['#D6DAFF', '#7E6CDA', '#2E1F70'],
    dark: ['#060A19', '#12173A', '#271B5A'],
  },
  Moon: {
    light: ['#E6EEF2', '#99A7B5', '#4F5F6D'],
    dark: ['#0D141B', '#1D2A36', '#344657'],
  },
  'Castle Hall': {
    light: ['#E2D1BE', '#9D7C62', '#4A3528'],
    dark: ['#171310', '#33271E', '#5A4536'],
  },
};

const getThemeBackground = (theme: BoardTheme, darkMode: boolean): ThemeBackground => {
  const byName = THEME_OVERRIDES[theme.name];
  const byCategory = CATEGORY_GRADIENTS[theme.category];
  const gradientColors = darkMode
    ? (byName?.dark ?? byCategory.dark)
    : (byName?.light ?? byCategory.light);

  return {
    gradientColors,
    overlayOpacity: 1,
    decorOpacity: darkMode ? 0.32 : 0.4,
  };
};

const getThemeAccentColor = (theme: BoardTheme, darkMode: boolean): string => {
  if (theme.category === 'space') return darkMode ? '#C2CBFF' : '#5F6FCF';
  if (theme.category === 'nature') return darkMode ? '#9ED8A5' : '#3F8B4A';
  if (theme.category === 'medieval') return darkMode ? '#D9C7AE' : '#8E684D';
  return darkMode ? '#F2D2AB' : '#8A5B2F';
};

const renderBackgroundDecor = (theme: BoardTheme, darkMode: boolean) => {
  const accent = getThemeAccentColor(theme, darkMode);
  const soft = `${accent}33`;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[backgroundStyles.largeOrb, { backgroundColor: `${theme.color1}44` }]} />
      <View style={[backgroundStyles.secondaryOrb, { backgroundColor: `${theme.color2}4D` }]} />
      {theme.category === 'medieval' && (
        <>
          <View style={[backgroundStyles.medievalStripe, backgroundStyles.medievalStripeLeft, { backgroundColor: soft }]} />
          <View style={[backgroundStyles.medievalStripe, backgroundStyles.medievalStripeRight, { backgroundColor: soft }]} />
          <View style={[backgroundStyles.medievalRing, { borderColor: `${accent}66` }]} />
        </>
      )}
      {theme.category === 'nature' && (
        <>
          <View style={[backgroundStyles.natureLeaf, backgroundStyles.natureLeafTop, { backgroundColor: `${accent}4D` }]} />
          <View style={[backgroundStyles.natureLeaf, backgroundStyles.natureLeafBottom, { backgroundColor: `${theme.color2}55` }]} />
          <View style={[backgroundStyles.natureStem, { backgroundColor: `${accent}66` }]} />
        </>
      )}
      {theme.category === 'space' && (
        <>
          <View style={[backgroundStyles.star, backgroundStyles.starOne, { backgroundColor: `${accent}CC` }]} />
          <View style={[backgroundStyles.star, backgroundStyles.starTwo, { backgroundColor: `${accent}AA` }]} />
          <View style={[backgroundStyles.star, backgroundStyles.starThree, { backgroundColor: `${theme.color1}CC` }]} />
          <View style={[backgroundStyles.cometTrail, { backgroundColor: `${accent}55` }]} />
        </>
      )}
      {theme.category === 'colors' && (
        <>
          <View style={[backgroundStyles.colorBand, backgroundStyles.colorBandTop, { backgroundColor: `${theme.color1}33` }]} />
          <View style={[backgroundStyles.colorBand, backgroundStyles.colorBandBottom, { backgroundColor: `${theme.color2}3D` }]} />
        </>
      )}
    </View>
  );
};

type RootStackParamList = {
  Home: undefined;
  Rules: undefined;
  Game: { timer?: number; multiplayer?: boolean; playerMode?: PlayerMode; aiDifficulty?: string; aiDifficultyB?: string; aiDifficultyW?: string; vsAI?: boolean };
};

export default function Game() {
  const route = useRoute<RouteProp<RootStackParamList, 'Game'>>();
  const selectedTimer = route.params?.timer;
  const aiDifficulty = route.params?.aiDifficulty;
  const aiDifficultyB = route.params?.aiDifficultyB;
  const aiDifficultyW = route.params?.aiDifficultyW;

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { darkMode, theme, multiplayerMode, setMultiplayerMode, setPlayerRole, setPlayerColor, playerRole } = useGameSettings();
  const ds = getDynamicStyles(darkMode);

  // Set multiplayer mode based on route params
  React.useEffect(() => {
    if (route.params?.multiplayer === true) {
      setMultiplayerMode(true);
    }
  }, [route.params?.multiplayer, setMultiplayerMode]);

  // Keep vsAI fallback for compatibility with older navigation payloads.
  const playerMode: PlayerMode = route.params?.playerMode ?? (route.params?.vsAI ? "Human vs AI" : DEFAULT_PLAYER_MODE);
  const [chronoStart, setChronoStart] = React.useState(false);
  const [chronoDuration, setChronoDuration] = React.useState(selectedTimer || 60);
  const [timeExpired, setTimeExpired] = React.useState(false);
  const [hasGameStarted, setHasGameStarted] = React.useState(false);
  const [receivedTimer, setReceivedTimer] = React.useState(false);
  const [timerResetKey, setTimerResetKey] = React.useState(0);

  // Timer is active if explicitly set or received from host
  const hasTimer = selectedTimer !== undefined || receivedTimer;

  // Callback for when timer is received from host in multiplayer
  const handleTimerReceived = React.useCallback((timer: number) => {
    setChronoDuration(timer);
    setWhiteTime(timer);
    setBlackTime(timer);
    setReceivedTimer(true);
  }, []);

  const handleStart = React.useCallback(() => {
    setHasGameStarted(true);
    setWhiteStart(true);
  }, []);

  const handleTurnSwitch = React.useCallback((player: 'w' | 'b') => {
    if (player === 'w') {
      setWhiteStart(true);
      setBlackStart(false);
    } else {
      setBlackStart(true);
      setWhiteStart(false);
    }
  }, []);

  const handleRestart = React.useCallback(() => {
    resetTimer();
  }, [chronoDuration]);

  // In multiplayer, host sends timer info to client
  React.useEffect(() => {
    if (multiplayerMode && playerRole === 'host' && selectedTimer !== undefined) {
      // Host sends the timer value to client
      setTimeout(() => {
        multiplayerService.sendMessage({
          type: 'start',
          hostColor: 'w',
          timer: selectedTimer
        });
      }, 500);
    }
  }, [multiplayerMode, playerRole, selectedTimer]);

  const resetTimer = () => {
    setWhiteStart(false);
    setBlackStart(false);

    setWhiteTime(chronoDuration);
    setBlackTime(chronoDuration);

    setHasGameStarted(false);
    setTimeExpired(false);
    setWinner(null);
    setTimerResetKey((prev) => prev + 1); // Force timer components to remount
  };

// deux timers séparés
const [whiteStart, setWhiteStart] = React.useState(false);
const [blackStart, setBlackStart] = React.useState(false);

const [whiteTime, setWhiteTime] = React.useState(chronoDuration);
const [blackTime, setBlackTime] = React.useState(chronoDuration);

const [winner, setWinner] = React.useState<'w' | 'b' | null>(null);

  const gameBackground = React.useMemo(() => {
    return getThemeBackground(theme, darkMode);
  }, [theme, darkMode]);

  return (
    <View style={[gameStyles.root,ds.bg.screen]}>
      <LinearGradient
        colors={gameBackground.gradientColors}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={[StyleSheet.absoluteFillObject, { opacity: gameBackground.overlayOpacity }]}
        pointerEvents="none"
      />
      <View style={[StyleSheet.absoluteFillObject, { opacity: gameBackground.decorOpacity }]}>
        {renderBackgroundDecor(theme, darkMode)}
      </View>
      <View style={gameStyles.container}>
        <TouchableOpacity style={gameStyles.fab}
          accessibilityLabel="Open rules"
          onPress={() => navigation.navigate('Rules')}>
          <Ionicons 
        name="help-circle" 
        size={20} 
        color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={[gameStyles.homeButton, ds.bg.card]}
          accessibilityLabel="Home"
              onPress={() => {
                if (multiplayerMode) {
                  multiplayerService.disconnect();
                  setMultiplayerMode(false);
                  setPlayerRole(null);
                  setPlayerColor(null);
                }

                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Home' }],
                });
              }}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Ionicons 
        name="home" 
        size={20} 
        color={darkMode ? '#A78BFA' : '#7C3AED'} />
        </TouchableOpacity>
        {/* DEUX TIMERS CÔTE À CÔTE - SEULEMENT SI TIMER EST ACTIF */}
        {hasTimer && (
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          width: '100%',
          paddingHorizontal: 10,
          marginBottom: 8,
        }}
      >
        <Timer
          key={`white-timer-${timerResetKey}`}
          start={whiteStart}
          duration={chronoDuration}
          onTick={(t) => setWhiteTime(t)}
          onFinish={() => {
        setTimeExpired(true);
        setWinner('b');  // Noir gagne
          }}
        />

        <Timer
          key={`black-timer-${timerResetKey}`}
          start={blackStart}
          duration={chronoDuration}
          onTick={(t) => setBlackTime(t)}
          onFinish={() => {
        setTimeExpired(true);
        setWinner('w');  // Blanc gagne
          }}
        />
      </View>
        )}

        <Board
          PlayerModes={playerMode}
          onStart={handleStart}
          onTurnSwitch={handleTurnSwitch}
          timeExpired={timeExpired}
          onRestart={handleRestart}
          onTimerReceived={handleTimerReceived}
          aiDifficulty={aiDifficulty}
          aiDifficultyB={aiDifficultyB}
          aiDifficultyW={aiDifficultyW}
        />
      </View>
    </View>
  )
}

