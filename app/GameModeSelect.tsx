import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import ChessBackground from '../components/ChessBackground';
import { useGameSettings } from '../context/GameSettingsContext';
import { gameStyles, getDynamicStyles, selectionScreenStyles, gameModeSelectStyles } from '../assets/Styles/styles';

const styles = { ...selectionScreenStyles, ...gameModeSelectStyles };
import {
  AI_DIFFICULTIES,
  AI_PLAYER_MODE,
  AI_VS_AI_PLAYER_MODE,
  AiDifficulty,
  DEFAULT_PLAYER_MODE,
  PlayerMode,
} from '../config/gameModes';
import { useI18n } from '../context/useI18n';

type RootStackParamList = {
  Home: undefined;
  GameModeSelect: { preselectedMode?: '2players' | 'ai' } | undefined;
  TimerSelect: { fromMultiplayer?: boolean; playerMode?: PlayerMode; forceTimerSelection?: boolean } | undefined;
  Game: { timer?: number; playerMode?: PlayerMode; aiDifficulty?: AiDifficulty; aiDifficultyB?: AiDifficulty; aiDifficultyW?: AiDifficulty };
};

export default function GameModeSelect() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'GameModeSelect'>>();
  const { darkMode } = useGameSettings();
  const { t } = useI18n();
  const ds = getDynamicStyles(darkMode);
  const [gameMode, setGameMode] = useState<'2players' | 'ai' | 'ai-vs-ai' | null>(route.params?.preselectedMode ?? null);
  const [aiVsAiBlackDifficulty, setAiVsAiBlackDifficulty] = useState<AiDifficulty | null>(null);

  useEffect(() => {
    setGameMode(route.params?.preselectedMode ?? null);
  }, [route.params?.preselectedMode]);

  return (
    <View style={[styles.screen, darkMode ? styles.screenDark : styles.screenLight]}>
      <ChessBackground isDark={darkMode} />

      <TouchableOpacity
        style={[gameStyles.homeButton, ds.bg.card]}
        accessibilityLabel="Home"
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          })
        }
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Ionicons name="home" size={20} color={darkMode ? '#A78BFA' : '#7C3AED'} />
      </TouchableOpacity>

      <View style={styles.content}>
        {gameMode === null ? (
          <>
            <Text style={[styles.title, darkMode && styles.titleDark]}>{t('gameMode.whoAgainst')}</Text>
            <View style={styles.choiceContainer}>
              <TouchableOpacity
                style={[styles.choiceButton, darkMode ? styles.noButtonDark : styles.noButton]}
                onPress={() => setGameMode('2players')}
              >
                <Text style={[styles.choiceTextNo, darkMode && styles.choiceTextDark]}>{t('gameMode.playerVsPlayer')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.choiceButton, darkMode ? styles.yesButtonDark : styles.yesButton]}
                onPress={() => setGameMode('ai')}
              >
                <Text style={[styles.choiceTextYes, darkMode && styles.choiceTextDark]}>{t('gameMode.playerVsAi')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.choiceButton, darkMode ? styles.noButtonDark : styles.noButton]}
                onPress={() => { setGameMode('ai-vs-ai'); setAiVsAiBlackDifficulty(null); }}
              >
                <Text style={[styles.choiceTextNo, darkMode && styles.choiceTextDark]}>{t('gameMode.aiVsAi')}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : gameMode === 'ai-vs-ai' ? (
          <>
            <Text style={[styles.title, darkMode && styles.titleDark]}>
              {aiVsAiBlackDifficulty === null ? t('gameMode.pickBlackAi') : t('gameMode.pickWhiteAi')}
            </Text>
            <View style={styles.difficultyContainer}>
              {AI_DIFFICULTIES.map((d) => (
                <TouchableOpacity
                  key={d.key}
                  style={[styles.difficultyButton, darkMode ? styles.noButtonDark : styles.noButton]}
                  onPress={() => {
                    if (aiVsAiBlackDifficulty === null) {
                      setAiVsAiBlackDifficulty(d.key);
                    } else {
                      navigation.navigate('Game', {
                        playerMode: AI_VS_AI_PLAYER_MODE,
                        aiDifficultyB: aiVsAiBlackDifficulty,
                        aiDifficultyW: d.key,
                      });
                    }
                  }}
                >
                  <Text style={[styles.choiceTextNo, darkMode && styles.choiceTextDark]}>{t(`difficulty.${d.key}`)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.backBtn, darkMode && styles.backBtnDark, { alignSelf: 'center', marginTop: 4 }]}
              onPress={() => {
                if (aiVsAiBlackDifficulty !== null) {
                  setAiVsAiBlackDifficulty(null);
                } else {
                  setGameMode(null);
                }
              }}
            >
              <Text style={[styles.backText, darkMode && styles.backTextDark]}>← {t('common.goBack')}</Text>
            </TouchableOpacity>
          </>
        ) : gameMode === 'ai' ? (
          <>
            <Text style={[styles.title, darkMode && styles.titleDark]}>{t('gameMode.chooseDifficulty')}</Text>
            <View style={styles.difficultyContainer}>
              {AI_DIFFICULTIES.map((d) => (
                <TouchableOpacity
                  key={d.key}
                  style={[styles.difficultyButton, darkMode ? styles.noButtonDark : styles.noButton]}
                  onPress={() => navigation.navigate('Game', { playerMode: AI_PLAYER_MODE, aiDifficulty: d.key })}
                >
                  <Text style={[styles.choiceTextNo, darkMode && styles.choiceTextDark]}>{t(`difficulty.${d.key}`)}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity
              style={[styles.backBtn, darkMode && styles.backBtnDark, { alignSelf: 'center', marginTop: 4 }]}
              onPress={() => setGameMode(null)}
            >
              <Text style={[styles.backText, darkMode && styles.backTextDark]}>← {t('common.goBack')}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={[styles.title, darkMode && styles.titleDark]}>{t('gameMode.wantTimer')}</Text>
            <View style={styles.choiceContainer}>
              <TouchableOpacity
                style={[styles.choiceButton, darkMode ? styles.noButtonDark : styles.noButton]}
                onPress={() => navigation.navigate('Game', { playerMode: DEFAULT_PLAYER_MODE })}
              >
                <Text style={[styles.choiceTextNo, darkMode && styles.choiceTextDark]}>{t('common.no')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.choiceButton, darkMode ? styles.yesButtonDark : styles.yesButton]}
                onPress={() =>
                  navigation.navigate('TimerSelect', {
                    playerMode: DEFAULT_PLAYER_MODE,
                    forceTimerSelection: true,
                  })
                }
              >
                <Text style={[styles.choiceTextYes, darkMode && styles.choiceTextDark]}>{t('common.yes')}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.backBtn, darkMode && styles.backBtnDark, { alignSelf: 'center' }]}
              onPress={() => setGameMode(null)}
            >
              <Text style={[styles.backText, darkMode && styles.backTextDark]}>← {t('common.goBack')}</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </View>
  );
}

