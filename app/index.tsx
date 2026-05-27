import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { Image, Text, TouchableOpacity, View, Animated } from "react-native";
import { useEffect, useRef } from 'react';
import { homeStyles, getDynamicStyles } from '../assets/Styles/styles';
import { useGameSettings } from '../context/GameSettingsContext';
import ChessBackground from '../components/ChessBackground';
import { useI18n } from '../context/useI18n';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
  GameModeSelect: undefined;
  TimerSelect: undefined;
  Game: { timer?: number; multiplayer?: boolean } | undefined;
  Rules: undefined;
  Customization: undefined;
  Multiplayer: undefined;
  ProfileStats: undefined;
};

export default function Index() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { darkMode } = useGameSettings();
  const { t } = useI18n();
  const ds = getDynamicStyles(darkMode);
  
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  //animation de queens qui float
  const queen1 = useRef(new Animated.Value(0)).current;
  const queen2 = useRef(new Animated.Value(0)).current;
  const queen3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animation d'entrée
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Animations des queens
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(queen1, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }),
          Animated.timing(queen1, {
            toValue: 0,
            duration: 4000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(queen2, {
            toValue: 1,
            duration: 5000,
            useNativeDriver: true,
          }),
          Animated.timing(queen2, {
            toValue: 0,
            duration: 5000,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(queen3, {
            toValue: 1,
            duration: 6000,
            useNativeDriver: true,
          }),
          Animated.timing(queen3, {
            toValue: 0,
            duration: 6000,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    return;
  }, []);

  const queen1Y = queen1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const queen2Y = queen2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -40],
  });

  const queen3Y = queen3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -25],
  });

  //couleurs selon le mode
  const colors = darkMode ? {
    square1: '#1E3A8A',
    square2: '#7C3AED',
    queen: '#A78BFA',
    cardBg: 'rgba(27, 38, 59, 0.95)',
  } : {
    square1: '#9e6df7',
    square2: '#A855F7',
    queen: '#2b0965ff',
    cardBg: 'rgba(255, 255, 255, 0.95)',
  };

  return (
    // homeStyles.screen + background pour dark mode
    <View style={[homeStyles.screen, ds.bg.screen]}>

      {/*background squares*/}
      <ChessBackground isDark={darkMode} />

      {/*queens qui float au premier plan avec le zindex*/}
      <Animated.Text
        style={{
          position: 'absolute',
          top: '12%',
          left: '8%',
          fontSize: 70,
          color: colors.queen,
          opacity: 0.8,
          transform: [{ translateY: queen1Y }, { rotate: '-12deg' }],
          zIndex: 2,
        }}
      >
        ♕
      </Animated.Text>
      
      <Animated.Text
        style={{
          position: 'absolute',
          top: '18%',
          right: '10%',
          fontSize: 60,
          color: colors.queen,
          opacity: 0.5,
          transform: [{ translateY: queen2Y }, { rotate: '15deg' }],
          zIndex: 2,
        }}
      >
        ♛
      </Animated.Text>

      <Animated.Text
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '12%',
          fontSize: 65,
          color: colors.queen,
          opacity: 0.8,
          transform: [{ translateY: queen3Y }, { rotate: '8deg' }],
          zIndex: 2,
        }}
      >
        ♕
      </Animated.Text>

      <Animated.View 
        style={[
          homeStyles.card,
          {
            backgroundColor: colors.cardBg,
            borderWidth: 2,
            borderColor: darkMode ? colors.square2 : colors.square1,
            shadowColor: colors.square1,
            shadowOpacity: 0.3,
            shadowRadius: 20,
            elevation: 10,
          },
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* Logo */}
        <View style={homeStyles.logoWrap}>
          <Image
            source={require('../assets/images/yolah-logo.png')}
            style={homeStyles.logo}
            resizeMode="contain"
          />
        </View>


        {/* TODO : change this to random tips */}
        {/* <Text style={[homeStyles.subtitle, ds.text.primary]}>
          {t('home.subtitle')}
        </Text> */}

        {/* Boutons */}
        <View style={homeStyles.buttonsContainer}>

          {/* Primary play buttons */}
          <TouchableOpacity
            style={[homeStyles.button, homeStyles.primary, { backgroundColor: darkMode ? colors.square2 : colors.square1, shadowColor: colors.square2, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 }]}
            onPress={() => navigation.navigate('GameModeSelect')}
            activeOpacity={0.8}
          >
            <Text style={homeStyles.primaryText}>{t('home.onePhone')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[homeStyles.button, homeStyles.primary, { backgroundColor: darkMode ? colors.square2 : colors.square1, shadowColor: colors.square2, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 }]}
            onPress={() => navigation.navigate('Multiplayer')}
            activeOpacity={0.8}
          >
            <Text style={homeStyles.primaryText}>{t('home.localMultiplayer')}</Text>
          </TouchableOpacity>

          {/* 2×2 tile grid */}
          {(
            [
              [
                { icon: 'person' as const,       label: t('home.profile'),   route: 'ProfileStats' as const },
                { icon: 'color-palette' as const, label: t('home.customize'), route: 'Customization' as const },
              ],
              [
                { icon: 'book' as const,          label: t('home.howToPlay'), route: 'Rules' as const },
                { icon: 'settings' as const,      label: t('settings.title'), route: 'Settings' as const },
              ],
            ] as const
          ).map((row, ri) => (
            <View key={ri} style={homeStyles.buttonRow}>
              {row.map(({ icon, label, route }) => (
                <TouchableOpacity
                  key={route}
                  style={{
                    flex: 1,
                    paddingVertical: 12,
                    paddingHorizontal: 8,
                    borderRadius: 14,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: darkMode ? 'rgba(124, 58, 237, 0.15)' : 'rgba(183, 96, 250, 0.15)',
                    borderColor: darkMode ? colors.square2 : colors.square1,
                    borderWidth: 2,
                  }}
                  onPress={() => navigation.navigate(route)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={icon} size={18} color={darkMode ? colors.square2 : colors.square1} />
                  <Text style={[homeStyles.secondaryText, { color: darkMode ? colors.square2 : colors.square1, fontSize: 12 }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </View>
      </Animated.View>

      {/* Footer */}
      <Text style={[homeStyles.footer, ds.text.primary]}>
        {t('home.footer')} ❤️
      </Text>
    </View>
  );
}