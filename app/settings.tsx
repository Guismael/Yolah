import React from 'react';
import { Text, View, ScrollView, TouchableOpacity, Switch } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import ChessBackground from '../components/ChessBackground';
import { paramsStyles, headerStyles, settingsStyles, COLORS, getDynamicStyles } from '../assets/Styles/styles';
import { useGameSettings } from '../context/GameSettingsContext';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useI18n } from '../context/useI18n';

type RootStackParamList = {
  Home: undefined;
};

export default function Settings() {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const {
        vibrationEnabled,
        setVibrationEnabled,
        soundEnabled,
        setSoundEnabled,
        volume,
        setVolume,
        darkMode,
        setDarkMode,
        language,
        setLanguage,
    } = useGameSettings();
    const { t } = useI18n();

    const ds = getDynamicStyles(darkMode);

    const adjustVolume = (delta: number) => {
        setVolume(Math.max(0, Math.min(100, volume + delta)));
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
                <Text style={[headerStyles.headerTitle, ds.text.dark]}>{t('settings.title')}</Text>
                <View style={{ width: 24 }} />
            </View>
            <ScrollView contentContainerStyle={[paramsStyles.container, ds.bg.screen]}>
                <ChessBackground isDark={darkMode} />
                <View style={[paramsStyles.card, ds.bg.card]}>
                
                {/* AUDIO */}
                <Text style={[paramsStyles.heading, ds.text.dark]}>{t('settings.audioHeading')}</Text>
                <Text style={[paramsStyles.sub, ds.text.primary]}>{t('settings.audioSub')}</Text>

                <View style={[settingsStyles.settingRow, ds.bg.lightBlue]}>
                    <View style={settingsStyles.settingLeft}>
                        <Ionicons name="musical-notes" size={24} color={COLORS.primary} />
                        <Text style={[settingsStyles.settingLabel,ds.text.dark]}>{t('settings.soundEffects')}</Text>
                    </View>
                    <Switch
                        value={soundEnabled}
                        onValueChange={setSoundEnabled}
                        trackColor={{ false: '#ddd', true: COLORS.primary }}
                        thumbColor={COLORS.white}
                    />
                </View>

                {soundEnabled && (
                    <View style={[settingsStyles.volumeContainer, ds.bg.lightBlue]}>
                        <Text style={[settingsStyles.volumeLabel,ds.text.dark]}>{t('settings.volume', { value: volume })}</Text>
                        <View style={settingsStyles.volumeControls}>
                            <TouchableOpacity 
                                style={[settingsStyles.volumeButton, ds.bg.card]}
                                onPress={() => adjustVolume(-10)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="remove" size={20} color={COLORS.primary} />
                            </TouchableOpacity>

                            <View style={[settingsStyles.volumeBar, darkMode ? { backgroundColor: '#c6d1ddff' } : null]}>
                                <View style={[settingsStyles.volumeFill, { width: `${volume}%` }]} />
                            </View>

                            <TouchableOpacity 
                                style={[settingsStyles.volumeButton, ds.bg.card]}
                                onPress={() => adjustVolume(+10)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="add" size={20} color={COLORS.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                <View style={[settingsStyles.separator, ds.border]} />

                {/* DARK MODE */}
                <Text style={[paramsStyles.heading, ds.text.dark]}>{t('settings.appearanceHeading')}</Text>
                <Text style={[paramsStyles.sub, ds.text.primary]}>{t('settings.appearanceSub')}</Text>

                <View style={[settingsStyles.settingRow, ds.bg.lightBlue]}>
                    <View style={settingsStyles.settingLeft}>
                        <Ionicons name={darkMode ? "moon" : "sunny"} size={24} color={COLORS.primary} />
                        <Text style={[settingsStyles.settingLabel,ds.text.dark]}>{t('settings.darkMode')}</Text>
                    </View>
                    <Switch
                        value={darkMode}
                        onValueChange={setDarkMode}
                        trackColor={{ false: '#ddd', true: COLORS.primary }}
                        thumbColor={COLORS.white}
                    />
                </View>

                <View style={[settingsStyles.separator, ds.border]} />

                {/* LANGUAGE */}
                <Text style={[paramsStyles.heading, ds.text.dark]}>{t('settings.languageHeading')}</Text>
                <Text style={[paramsStyles.sub, ds.text.primary]}>{t('settings.languageSub')}</Text>

                <View style={[settingsStyles.settingRow, ds.bg.lightBlue]}>
                    <View style={settingsStyles.settingLeft}>
                        <Ionicons name="language" size={24} color={COLORS.primary} />
                        <Text style={[settingsStyles.settingLabel, ds.text.dark]}>{t('settings.language')}</Text>
                    </View>
                    <View style={settingsStyles.languageControls}>
                        <TouchableOpacity
                            style={[
                                settingsStyles.languageButton,
                                language === 'en' ? ds.primary.bg : ds.bg.card,
                            ]}
                            onPress={() => setLanguage('en')}
                            activeOpacity={0.7}
                        >
                            <Text style={[settingsStyles.languageButtonText, ds.text.dark]}>{t('settings.english')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                settingsStyles.languageButton,
                                language === 'fr' ? ds.primary.bg : ds.bg.card,
                            ]}
                            onPress={() => setLanguage('fr')}
                            activeOpacity={0.7}
                        >
                            <Text style={[settingsStyles.languageButtonText, ds.text.dark]}>{t('settings.french')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={[settingsStyles.separator, ds.border]} />

                {/* GAMEPLAY */}
                <Text style={[paramsStyles.heading, ds.text.dark]}>{t('settings.gameplayHeading')}</Text>
                <Text style={[paramsStyles.sub, ds.text.primary]}>{t('settings.gameplaySub')}</Text>

                <View style={[settingsStyles.settingRow, ds.bg.lightBlue]}>
                    <View style={settingsStyles.settingLeft}>
                        <Ionicons name="phone-portrait" size={24} color={COLORS.primary} />
                        <Text style={[settingsStyles.settingLabel,ds.text.dark]}>{t('settings.vibration')}</Text>
                    </View>
                    <Switch
                        value={vibrationEnabled}
                        onValueChange={setVibrationEnabled}
                        trackColor={{ false: '#ddd', true: COLORS.primary }}
                        thumbColor={COLORS.white}
                    />
                </View>

                <Text style={[paramsStyles.note, ds.text.primary]}>
                    {t('settings.autosave')}
                </Text>
            </View>
        </ScrollView>
        </View>
    );
}

