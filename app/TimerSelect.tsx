import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import ChessBackground from "../components/ChessBackground";
import { useGameSettings } from "../context/GameSettingsContext";
import { gameStyles, getDynamicStyles, selectionScreenStyles, timerSelectStyles } from '../assets/Styles/styles';

const styles = { ...selectionScreenStyles, ...timerSelectStyles };
import {
  DEFAULT_PLAYER_MODE,
  PlayerMode,
} from '../config/gameModes';
import { useI18n } from '../context/useI18n';

type RootStackParamList = {
  Home: undefined;
  GameModeSelect: { preselectedMode?: '2players' | 'ai' } | undefined;
  TimerSelect: { fromMultiplayer?: boolean; playerMode?: PlayerMode; forceTimerSelection?: boolean } | undefined;
  Multiplayer: { timer?: number; useTimer?: boolean };
  Game: { timer?: number; playerMode?: PlayerMode };
};

export default function TimerSelect() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'TimerSelect'>>();
  const { darkMode } = useGameSettings();
  const { t } = useI18n();
  const ds = getDynamicStyles(darkMode);
  const forceTimerSelection = !!route.params?.forceTimerSelection;
  const selectedMode = route.params?.playerMode ?? DEFAULT_PLAYER_MODE;
  const preselectedMode = selectedMode === 'Human vs AI' ? 'ai' : '2players';
  const [useTimer, setUseTimer] = useState<boolean | null>(forceTimerSelection ? true : null);
  const [selected, setSelected] = useState<number | null>(null);

  const timers = [30, 60, 90, 120];

  const handleStartGame = () => {
    const fromMultiplayer = route.params?.fromMultiplayer;
    
    if (fromMultiplayer) {
      // Return to multiplayer with timer selection
      if (useTimer === false) {
        navigation.navigate("Multiplayer", { useTimer: false });
      } else if (useTimer === true && selected !== null) {
        navigation.navigate("Multiplayer", { timer: selected, useTimer: true });
      }
    } else {
      // Single-device mode (typically PVP) with optional timer
      if (useTimer === false) {
        navigation.navigate("Game", { playerMode: selectedMode });
      } else if (useTimer === true && selected !== null) {
        navigation.navigate("Game", { timer: selected, playerMode: selectedMode });
      }
    }
  };

  return (
    <View style={[styles.screen, darkMode ? styles.screenDark : styles.screenLight]}>
      <ChessBackground isDark={darkMode} />
      {/* Home button like in Game screen */}
      <TouchableOpacity 
        style={[gameStyles.homeButton, ds.bg.card]}
        accessibilityLabel="Home"
        onPress={() => navigation.reset({
          index: 0,
          routes: [{ name: 'Home' }],
        })}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="home" size={20} color={darkMode ? '#A78BFA' : '#7C3AED'} />
      </TouchableOpacity>
      <View style={styles.content}>
        {useTimer === null && !forceTimerSelection ? (
          <>           
          
            <Text style={[styles.title, darkMode && styles.titleDark]}>{t('gameMode.wantTimer')}</Text>
            <View style={styles.choiceContainer}>
              <TouchableOpacity
                style={[styles.choiceButton, darkMode ? styles.noButtonDark : styles.noButton]}
                onPress={() => setUseTimer(false)}
              >
                <Text style={[styles.choiceTextNo, darkMode && styles.choiceTextDark]}>{t('common.no')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.choiceButton, darkMode ? styles.yesButtonDark : styles.yesButton]}
                onPress={() => setUseTimer(true)}
              >
                <Text style={[styles.choiceTextYes, darkMode && styles.choiceTextDark]}>{t('common.yes')}</Text>
              </TouchableOpacity>
            </View>
            {!route.params?.fromMultiplayer && (
              <TouchableOpacity
                style={[styles.backBtn, darkMode && styles.backBtnDark, { alignSelf: 'center' }]}
                onPress={() => navigation.navigate('GameModeSelect', { preselectedMode })}
              >
                <Text style={[styles.backText, darkMode && styles.backTextDark]}>← {t('common.goBack')}</Text>
              </TouchableOpacity>
            )}
          </>
        ) : useTimer === false ? (
          <>
            <Text style={[styles.title, darkMode && styles.titleDark]}>{t('timer.noTimerSelected')}</Text>
            <Text style={[styles.subtitle, darkMode && styles.subtitleDark]}>{t('timer.playWithoutLimits')}</Text>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.backBtn, darkMode && styles.backBtnDark]}
                onPress={() => {
                  if (forceTimerSelection) {
                    navigation.navigate('GameModeSelect', { preselectedMode });
                    return;
                  }
                  setUseTimer(null);
                  setSelected(null);
                }}
              >
                <Text style={[styles.backText, darkMode && styles.backTextDark]}>← {t('common.goBack')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.startBtn, darkMode && styles.startBtnDark]}
                onPress={handleStartGame}
              >
                <Text style={[styles.startText, darkMode && styles.startTextDark]}>{t('common.startGame')}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={[styles.title, darkMode && styles.titleDark]}>⏳ {t('timer.chooseTimer')}</Text>

            <View style={styles.grid}>
              {timers.map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[
                    styles.button,
                    darkMode && styles.buttonDark,
                    selected === t && (darkMode ? styles.selectedButtonDark : styles.selectedButton),
                  ]}
                  onPress={() => setSelected(t)}
                >
                  <Text
                    style={[
                      styles.text,
                      darkMode && styles.textDark,
                      selected === t && (darkMode ? styles.selectedTextDark : styles.selectedText),
                    ]}
                  >
                    {t}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.buttonGroup}>
              <TouchableOpacity
                style={[styles.backBtn, darkMode && styles.backBtnDark]}
                onPress={() => {
                  if (forceTimerSelection) {
                    navigation.navigate('GameModeSelect', { preselectedMode });
                    return;
                  }
                  setUseTimer(null);
                  setSelected(null);
                }}
              >
                <Text style={[styles.backText, darkMode && styles.backTextDark]}>← {t('common.goBack')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.startBtn, darkMode && styles.startBtnDark, !selected && { opacity: 0.4 }]}
                disabled={!selected}
                onPress={handleStartGame}
              >
                <Text style={[styles.startText, darkMode && styles.startTextDark]}>{t('common.startGame')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}

