import { Ionicons } from '@expo/vector-icons';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { getDynamicStyles, profileScreenStyles, profileStatsStyles } from '../assets/Styles/styles';

const styles = { ...profileScreenStyles, ...profileStatsStyles };
import ChessBackground from '../components/ChessBackground';
import { useGameSettings } from '../context/GameSettingsContext';
import { useProfile } from '../context/ProfileContext';
import { AI_DIFFICULTIES, AiDifficulty } from '../config/gameModes';
import { BADGES, Badge } from '../config/badges';
import { useI18n } from '../context/useI18n';

type RootStackParamList = {
  Multiplayer: undefined;
  ProfileSetup: undefined;
};

export default function ProfileStats() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { darkMode } = useGameSettings();
  const { profile } = useProfile();
  const { t } = useI18n();
  const ds = getDynamicStyles(darkMode);

  const colors = darkMode
    ? {
        primary: '#7C3AED',
        cardBg: 'rgba(27, 38, 59, 0.95)',
        text: '#E0E7FF',
        rowAlt: 'rgba(255,255,255,0.05)',
      }
    : {
        primary: '#9e6df7',
        cardBg: 'rgba(255, 255, 255, 0.95)',
        text: '#1F2937',
        rowAlt: 'rgba(0,0,0,0.04)',
      };

  const multiplayerStats = profile?.multiplayerStats ?? {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
  };

  const winRate = multiplayerStats.gamesPlayed
    ? Math.round((multiplayerStats.wins / multiplayerStats.gamesPlayed) * 100)
    : 0;

  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const unlockedCount = profile ? BADGES.filter(b => b.unlocked(profile)).length : 0;

  return (
    <View style={{ flex: 1, backgroundColor: ds.bg.screen.backgroundColor }}>
      <ChessBackground isDark={darkMode} />

      <TouchableOpacity
        style={[styles.backButton, ds.bg.card]}
        onPress={() => navigation.goBack()}
        accessibilityLabel={t('common.back')}
      >
        <Ionicons name="chevron-back" size={24} color={colors.primary} />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.backButton, ds.bg.card, { left: undefined, right: 20 }]}
        onPress={() => navigation.navigate('ProfileSetup')}
        accessibilityLabel="Edit profile"
      >
        <Ionicons name="pencil" size={22} color={colors.primary} />
      </TouchableOpacity>

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 80,
          paddingBottom: 40,
          gap: 16,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Multiplayer card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.primary,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>{t('profileStats.title')}</Text>
          <Text style={[styles.subtitle, { color: colors.text, opacity: 0.7 }]}>
            {t('profileStats.subtitle')}
          </Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={[styles.statLabel, { color: colors.text, opacity: 0.7 }]}>{t('profileStats.games')}</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{multiplayerStats.gamesPlayed}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={[styles.statLabel, { color: colors.text, opacity: 0.7 }]}>{t('profileStats.wins')}</Text>
              <Text style={[styles.statValue, { color: '#22c55e' }]}>{multiplayerStats.wins}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={[styles.statLabel, { color: colors.text, opacity: 0.7 }]}>{t('profileStats.losses')}</Text>
              <Text style={[styles.statValue, { color: '#ef4444' }]}>{multiplayerStats.losses}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={[styles.statLabel, { color: colors.text, opacity: 0.7 }]}>{t('profileStats.draws')}</Text>
              <Text style={[styles.statValue, { color: colors.text }]}>{multiplayerStats.draws}</Text>
            </View>
          </View>

          <View style={styles.ratioRow}>
            <Text style={[styles.ratioText, { color: colors.text }]}>{t('profileStats.winRate', { rate: winRate })}</Text>
          </View>
        </View>

        {/* AI stats card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.cardBg,
              borderColor: colors.primary,
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text }]}>{t('aiStats.title')}</Text>
          <Text style={[styles.subtitle, { color: colors.text, opacity: 0.7 }]}>
            {t('aiStats.subtitle')}
          </Text>

          {/* Table header */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 4, marginBottom: 4 }}>
            <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: colors.text, opacity: 0.5, textTransform: 'uppercase' }}>
              {t('aiStats.difficulty')}
            </Text>
            {(['wHeader', 'lHeader', 'dHeader'] as const).map((key) => (
              <Text key={key} style={{ width: 36, textAlign: 'center', fontSize: 11, fontWeight: '700', color: colors.text, opacity: 0.5, textTransform: 'uppercase' }}>
                {t(`aiStats.${key}`)}
              </Text>
            ))}
          </View>

          {/* Rows */}
          {AI_DIFFICULTIES.map(({ key, label }, i) => {
            const s = profile?.aiStats?.[key as AiDifficulty] ?? { wins: 0, losses: 0, draws: 0 };
            return (
              <View
                key={key}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 4,
                  borderRadius: 8,
                  backgroundColor: i % 2 === 0 ? colors.rowAlt : 'transparent',
                }}
              >
                <Text style={{ flex: 1, fontSize: 15, fontWeight: '600', color: colors.text }}>{label}</Text>
                <Text style={{ width: 36, textAlign: 'center', fontSize: 15, fontWeight: '700', color: '#22c55e' }}>{s.wins}</Text>
                <Text style={{ width: 36, textAlign: 'center', fontSize: 15, fontWeight: '700', color: '#ef4444' }}>{s.losses}</Text>
                <Text style={{ width: 36, textAlign: 'center', fontSize: 15, fontWeight: '700', color: colors.text }}>{s.draws}</Text>
              </View>
            );
          })}
        </View>
        {/* Badges card */}
        <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.primary }]}>
          <Text style={[styles.title, { color: colors.text }]}>{t('badges.title')}</Text>
          <Text style={[styles.subtitle, { color: colors.text, opacity: 0.7 }]}>
            {t('badges.unlocked', { count: unlockedCount, total: BADGES.length })}
          </Text>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
            {BADGES.map(badge => {
              const isUnlocked = profile ? badge.unlocked(profile) : false;
              const isSelected = selectedBadge?.id === badge.id;
              return (
                <TouchableOpacity
                  key={badge.id}
                  onPress={() => setSelectedBadge(isSelected ? null : badge)}
                  style={{
                    width: '25%',
                    alignItems: 'center',
                    paddingVertical: 10,
                    paddingHorizontal: 4,
                  }}
                >
                  <View style={{
                    width: 52,
                    height: 52,
                    borderRadius: 14,
                    backgroundColor: isUnlocked
                      ? (darkMode ? 'rgba(124,58,237,0.25)' : 'rgba(158,109,247,0.15)')
                      : (darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'),
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected
                      ? colors.primary
                      : (isUnlocked ? colors.primary + '66' : (darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)')),
                    justifyContent: 'center',
                    alignItems: 'center',
                    opacity: isUnlocked ? 1 : 0.4,
                  }}>
                    <Text style={{ fontSize: 26 }}>{isUnlocked ? badge.emoji : '🔒'}</Text>
                  </View>
                  <Text style={{
                    fontSize: 10,
                    fontWeight: '600',
                    color: isUnlocked ? colors.text : (darkMode ? '#888' : '#aaa'),
                    textAlign: 'center',
                    marginTop: 5,
                    lineHeight: 13,
                  }} numberOfLines={2}>
                    {t(badge.nameKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedBadge && (
            <View style={{
              marginTop: 12,
              padding: 12,
              borderRadius: 10,
              backgroundColor: darkMode ? 'rgba(124,58,237,0.15)' : 'rgba(158,109,247,0.1)',
              borderLeftWidth: 3,
              borderLeftColor: colors.primary,
            }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
                {selectedBadge.emoji}  {t(selectedBadge.nameKey)}
              </Text>
              <Text style={{ fontSize: 12, color: colors.text, opacity: 0.75, marginTop: 3 }}>
                {t(selectedBadge.descKey)}
              </Text>
            </View>
          )}
        </View>

      </ScrollView>
    </View>
  );
}
