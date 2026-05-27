import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AiDifficulty } from '../config/gameModes';

export interface MultiplayerStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface AIGameStats {
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
}

export type AIStats = Record<AiDifficulty, AIGameStats>;

export interface UserProfile {
  username: string;
  profileImage: string | null; // base64 encoded image
  multiplayerStats: MultiplayerStats;
  aiStats: AIStats;
  bestWinMargin: number;
}

const defaultMultiplayerStats: MultiplayerStats = {
  gamesPlayed: 0,
  wins: 0,
  losses: 0,
  draws: 0,
};

const defaultAIGameStats: AIGameStats = { gamesPlayed: 0, wins: 0, losses: 0, draws: 0 };

const defaultAIStats: AIStats = {
  easy: { ...defaultAIGameStats },
  medium: { ...defaultAIGameStats },
  hard: { ...defaultAIGameStats },
  expert: { ...defaultAIGameStats },
};

type SaveProfileInput = {
  username: string;
  profileImage: string | null;
  multiplayerStats?: MultiplayerStats;
  aiStats?: AIStats;
  bestWinMargin?: number;
};

type MatchWinner = 'w' | 'b' | 'draw';
type PlayerColor = 'w' | 'b';

interface ProfileContextType {
  profile: UserProfile | null;
  isLoading: boolean;
  saveProfile: (profile: SaveProfileInput) => Promise<void>;
  recordMultiplayerResult: (winner: MatchWinner, playerColor: PlayerColor, scoreB: number, scoreW: number) => Promise<void>;
  recordAIResult: (winner: MatchWinner, difficulty: AiDifficulty, scoreB: number, scoreW: number) => Promise<void>;
  clearProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, []);

  const normalizeProfile = (raw: SaveProfileInput | UserProfile): UserProfile => {
    return {
      username: raw.username,
      profileImage: raw.profileImage,
      multiplayerStats: {
        gamesPlayed: raw.multiplayerStats?.gamesPlayed ?? 0,
        wins: raw.multiplayerStats?.wins ?? 0,
        losses: raw.multiplayerStats?.losses ?? 0,
        draws: raw.multiplayerStats?.draws ?? 0,
      },
      aiStats: {
        easy: raw.aiStats?.easy ?? { ...defaultAIGameStats },
        medium: raw.aiStats?.medium ?? { ...defaultAIGameStats },
        hard: raw.aiStats?.hard ?? { ...defaultAIGameStats },
        expert: raw.aiStats?.expert ?? { ...defaultAIGameStats },
      },
      bestWinMargin: raw.bestWinMargin ?? 0,
    };
  };

  const loadProfile = async () => {
    try {
      const savedProfile = await AsyncStorage.getItem('userProfile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile) as SaveProfileInput;
        setProfile(normalizeProfile(parsed));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfile = async (newProfile: SaveProfileInput) => {
    try {
      const normalizedProfile = normalizeProfile({
        ...newProfile,
        multiplayerStats: newProfile.multiplayerStats ?? profile?.multiplayerStats ?? defaultMultiplayerStats,
      });
      await AsyncStorage.setItem('userProfile', JSON.stringify(normalizedProfile));
      setProfile(normalizedProfile);
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  };

  const recordMultiplayerResult = async (winner: MatchWinner, playerColor: PlayerColor, scoreB: number, scoreW: number) => {
    if (!profile) return;

    const baseStats = profile.multiplayerStats ?? defaultMultiplayerStats;
    const updatedStats: MultiplayerStats = {
      ...baseStats,
      gamesPlayed: baseStats.gamesPlayed + 1,
      wins: baseStats.wins,
      losses: baseStats.losses,
      draws: baseStats.draws,
    };

    if (winner === 'draw') {
      updatedStats.draws += 1;
    } else if (winner === playerColor) {
      updatedStats.wins += 1;
    } else {
      updatedStats.losses += 1;
    }

    let bestWinMargin = profile.bestWinMargin ?? 0;
    if (winner === playerColor) {
      const margin = (playerColor === 'w' ? scoreW - scoreB : scoreB - scoreW);
      if (margin > bestWinMargin) bestWinMargin = margin;
    }

    await saveProfile({
      username: profile.username,
      profileImage: profile.profileImage,
      multiplayerStats: updatedStats,
      aiStats: profile.aiStats,
      bestWinMargin,
    });
  };

  const recordAIResult = async (winner: MatchWinner, difficulty: AiDifficulty, scoreB: number, scoreW: number) => {
    const base = profile ?? {
      username: '',
      profileImage: null,
      multiplayerStats: { ...defaultMultiplayerStats },
      aiStats: { ...defaultAIStats },
      bestWinMargin: 0,
    };

    const current = base.aiStats?.[difficulty] ?? { ...defaultAIGameStats };
    const updated: AIGameStats = {
      gamesPlayed: current.gamesPlayed + 1,
      wins: current.wins + (winner === 'w' ? 1 : 0),
      losses: current.losses + (winner === 'b' ? 1 : 0),
      draws: current.draws + (winner === 'draw' ? 1 : 0),
    };

    let bestWinMargin = base.bestWinMargin ?? 0;
    if (winner === 'w') {
      const margin = scoreW - scoreB;
      if (margin > bestWinMargin) bestWinMargin = margin;
    }

    await saveProfile({
      username: base.username,
      profileImage: base.profileImage,
      multiplayerStats: base.multiplayerStats,
      aiStats: { ...base.aiStats, [difficulty]: updated },
      bestWinMargin,
    });
  };

  const clearProfile = async () => {
    try {
      await AsyncStorage.removeItem('userProfile');
      setProfile(null);
    } catch (error) {
      console.error('Error clearing profile:', error);
      throw error;
    }
  };

  return (
    <ProfileContext.Provider value={{ profile, isLoading, saveProfile, recordMultiplayerResult, recordAIResult, clearProfile }}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within ProfileProvider');
  }
  return context;
}
