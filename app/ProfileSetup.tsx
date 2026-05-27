import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import ChessBackground from '../components/ChessBackground';
import { useGameSettings } from '../context/GameSettingsContext';
import { useProfile } from '../context/ProfileContext';
import { getDynamicStyles, profileScreenStyles, profileSetupStyles } from '../assets/Styles/styles';

const styles = { ...profileScreenStyles, ...profileSetupStyles };
import { useI18n } from '../context/useI18n';

type RootStackParamList = {
  Home: undefined;
  Multiplayer: undefined;
};

export default function ProfileSetup() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { darkMode } = useGameSettings();
  const { profile, saveProfile } = useProfile();
  const { t } = useI18n();
  const ds = getDynamicStyles(darkMode);

  const [username, setUsername] = useState(profile?.username || '');
  const [profileImage, setProfileImage] = useState<string | null>(profile?.profileImage || null);
  const [isSaving, setIsSaving] = useState(false);

  const colors = darkMode ? {
    primary: '#7C3AED',
    cardBg: 'rgba(27, 38, 59, 0.95)',
    text: '#E0E7FF',
    border: '#4C1D95',
  } : {
    primary: '#9e6df7',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    text: '#1F2937',
    border: '#A855F7',
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
        setProfileImage(base64Image);
      }
    } catch (error) {
      Alert.alert(t('profileSetup.errorTitle'), t('profileSetup.pickImageError'));
      console.error(error);
    }
  };

  const handleSaveProfile = async () => {
    if (!username.trim()) {
      Alert.alert(t('profileSetup.invalidTitle'), t('profileSetup.invalidUsername'));
      return;
    }

    if (username.trim().length < 2) {
      Alert.alert(t('profileSetup.invalidTitle'), t('profileSetup.invalidShortUsername'));
      return;
    }

    try {
      setIsSaving(true);
      await saveProfile({
        username: username.trim(),
        profileImage,
      });
      Alert.alert(t('profileSetup.successTitle'), t('profileSetup.successBody'));
      navigation.goBack();
    } catch (error) {
      Alert.alert(t('profileSetup.errorTitle'), t('profileSetup.saveError'));
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View style={[styles.container, ds.bg.screen]}>
      <ChessBackground isDark={darkMode} />

      <TouchableOpacity
        style={[styles.backButton, ds.bg.card]}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={24} color={colors.primary} />
      </TouchableOpacity>

      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.cardBg,
            borderColor: colors.primary,
          },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>{t('profileSetup.title')}</Text>

        {/* Profile Picture Section */}
        <View style={styles.pictureSection}>
          <TouchableOpacity
            style={[
              styles.pictureContainer,
              {
                borderColor: colors.primary,
                backgroundColor: darkMode ? 'rgba(124, 58, 237, 0.1)' : 'rgba(158, 109, 247, 0.1)',
              },
            ]}
            onPress={pickImage}
          >
            {profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
            ) : (
              <>
                <Ionicons name="camera" size={48} color={colors.primary} />
                <Text style={[styles.cameraText, { color: colors.primary }]}>
                  {t('profileSetup.tapAddPhoto')}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {profileImage && (
            <TouchableOpacity
              onPress={() => setProfileImage(null)}
              style={styles.removeButton}
            >
              <Ionicons name="trash" size={18} color="#ff4444" />
              <Text style={styles.removeText}>{t('common.remove')}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Username Section */}
        <View style={styles.inputSection}>
          <Text style={[styles.label, { color: colors.text }]}>{t('profileSetup.username')}</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: colors.text,
                borderColor: colors.primary,
              },
            ]}
            placeholder={t('profileSetup.placeholder')}
            placeholderTextColor={darkMode ? '#9CA3AF' : '#6B7280'}
            value={username}
            onChangeText={setUsername}
            maxLength={20}
          />
          <Text style={[styles.charCount, { color: colors.text, opacity: 0.6 }]}>
            {username.length}/20
          </Text>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            {
              backgroundColor: colors.primary,
              opacity: isSaving ? 0.6 : 1,
            },
          ]}
          onPress={handleSaveProfile}
          disabled={isSaving}
        >
          <Text style={styles.saveButtonText}>
            {isSaving ? t('profileSetup.saving') : t('profileSetup.saveProfile')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

