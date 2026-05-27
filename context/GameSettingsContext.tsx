// Ce fichier permet de partager les paramètres dans toute l'app

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BoardTheme, DEFAULT_THEME } from '../config/themes';
import { PieceStyle, DEFAULT_PIECE_STYLE } from '../config/pieceStyles';
import { PlayerRole } from '../services/MultiplayerService';
import { AppLanguage } from '../config/i18n';

const SETTINGS_STORAGE_KEY = 'gameSettings';

type PersistedSettings = {
    darkMode: boolean;
    vibrationEnabled: boolean;
    soundEnabled: boolean;
    volume: number;
    language: AppLanguage;
};

type GameSettingsContextType = {
    theme: BoardTheme;
    setTheme: (theme: BoardTheme) => void;
    pieceStyle: PieceStyle;
    setPieceStyle: (style: PieceStyle) => void;
    darkMode: boolean;                              
    
    setDarkMode: (enabled: boolean) => void;        
    vibrationEnabled: boolean;      // Vibration activée ou non
    setVibrationEnabled: (enabled: boolean) => void; // Fonction pour changer la vibration
    soundEnabled: boolean;
    setSoundEnabled: (enabled: boolean) => void;
    volume: number;
    setVolume: (volume: number) => void;
    language: AppLanguage;
    setLanguage: (language: AppLanguage) => void;
    
    // Multiplayer settings
    multiplayerMode: boolean;
    setMultiplayerMode: (enabled: boolean) => void;
    playerRole: PlayerRole | null;
    setPlayerRole: (role: PlayerRole | null) => void;
    playerColor: 'b' | 'w' | null;
    setPlayerColor: (color: 'b' | 'w' | null) => void;
};

const GameSettingsContext = createContext<GameSettingsContextType | undefined>(undefined);

export function GameSettingsProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<BoardTheme>(DEFAULT_THEME);
    const [pieceStyle, setPieceStyle] = useState<PieceStyle>(DEFAULT_PIECE_STYLE);
    const [darkMode, setDarkMode] = useState<boolean>(false);  
    const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);
    const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
    const [volume, setVolume] = useState<number>(50);
    const [language, setLanguage] = useState<AppLanguage>('en');
    const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false);
    
    // Multiplayer state
    const [multiplayerMode, setMultiplayerMode] = useState<boolean>(false);
    const [playerRole, setPlayerRole] = useState<PlayerRole | null>(null);
    const [playerColor, setPlayerColor] = useState<'b' | 'w' | null>(null);

    useEffect(() => {
        const loadPersistedSettings = async () => {
            try {
                const raw = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
                if (!raw) return;

                const parsed: Partial<PersistedSettings> = JSON.parse(raw);
                if (typeof parsed.darkMode === 'boolean') setDarkMode(parsed.darkMode);
                if (typeof parsed.vibrationEnabled === 'boolean') setVibrationEnabled(parsed.vibrationEnabled);
                if (typeof parsed.soundEnabled === 'boolean') setSoundEnabled(parsed.soundEnabled);
                if (typeof parsed.volume === 'number') {
                    setVolume(Math.max(0, Math.min(100, parsed.volume)));
                }
                if (parsed.language === 'en' || parsed.language === 'fr') {
                    setLanguage(parsed.language);
                }
            } catch (error) {
                console.error('Failed to load game settings:', error);
            } finally {
                setSettingsLoaded(true);
            }
        };

        loadPersistedSettings();
    }, []);

    useEffect(() => {
        if (!settingsLoaded) return;

        const data: PersistedSettings = {
            darkMode,
            vibrationEnabled,
            soundEnabled,
            volume,
            language,
        };

        AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(data)).catch((error) => {
            console.error('Failed to save game settings:', error);
        });
    }, [darkMode, vibrationEnabled, soundEnabled, volume, language, settingsLoaded]);

    

    return (
        <GameSettingsContext.Provider value={{ 
            theme, setTheme, 
            pieceStyle, setPieceStyle,
            darkMode, setDarkMode ,vibrationEnabled, setVibrationEnabled,
            soundEnabled, setSoundEnabled,
            volume, setVolume,
            language, setLanguage,
            multiplayerMode, setMultiplayerMode,
            playerRole, setPlayerRole,
            playerColor, setPlayerColor,
        }}>
            {children}
        </GameSettingsContext.Provider>
    );
}

export function useGameSettings() {
    const context = useContext(GameSettingsContext);
    if (!context) {
        throw new Error('useGameSettings must be used within GameSettingsProvider');
    }
    return context;
}