import { useEffect, useState } from 'react';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { multiplayerService, GameMessage, PlayerRole } from '../services/MultiplayerService';
import { PlayerProfile } from '../components/Score';

type Player = 'b' | 'w';
type RootStackParamList = { Home: undefined };

interface UseMultiplayerProps {
    multiplayerMode: boolean;
    playerColor: Player | null;
    playerRole: PlayerRole | null;
    profile: { username: string; profileImage?: string | null } | null;
    applyMoveRef: React.MutableRefObject<(from: [number, number], to: [number, number], player: Player, sendToNetwork?: boolean) => void>;
    gameOverRef: React.MutableRefObject<(sendNetworkMessage?: boolean) => void>;
    onRestartRef: React.MutableRefObject<(() => void) | undefined>;
    ignoreNextRemoteRestartRef: React.MutableRefObject<boolean>;
    ignoreRestartTimeoutRef: React.MutableRefObject<ReturnType<typeof setTimeout> | null>;
    setWhiteProfile: (p: PlayerProfile | null) => void;
    setBlackProfile: (p: PlayerProfile | null) => void;
    setPlayerColor: (c: Player | null) => void;
    setMultiplayerMode: (v: boolean) => void;
    setPlayerRole: (r: PlayerRole | null) => void;
    setShowGameOver: (v: boolean) => void;
    setGameWinner: (w: Player | 'draw' | null) => void;
}

export function useMultiplayer({
    multiplayerMode,
    playerColor,
    playerRole,
    profile,
    applyMoveRef,
    gameOverRef,
    onRestartRef,
    ignoreNextRemoteRestartRef,
    ignoreRestartTimeoutRef,
    setWhiteProfile,
    setBlackProfile,
    setPlayerColor,
    setMultiplayerMode,
    setPlayerRole,
    setShowGameOver,
    setGameWinner,
}: UseMultiplayerProps) {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const [showDisconnectNotice, setShowDisconnectNotice] = useState(false);

    // Assign player color based on host/client role
    useEffect(() => {
        if (multiplayerMode && playerRole && !playerColor) {
            setPlayerColor(playerRole === 'host' ? 'w' : 'b');
        }
    }, [multiplayerMode, playerRole, playerColor, setPlayerColor]);

    // Set own profile on the correct side
    useEffect(() => {
        if (!multiplayerMode || !profile) return;
        const profileData: PlayerProfile = { username: profile.username, profileImage: profile.profileImage };
        if (playerColor === 'w') setWhiteProfile(profileData);
        else if (playerColor === 'b') setBlackProfile(profileData);
    }, [multiplayerMode, playerColor, profile]);

    // Handle incoming game messages
    useEffect(() => {
        if (!multiplayerMode) return;

        const handleMessage = (message: GameMessage) => {
            if (message.type === 'move') {
                applyMoveRef.current(message.from, message.to, message.player, false);
            } else if (message.type === 'profile') {
                const opponentProfile: PlayerProfile = {
                    username: message.username,
                    profileImage: message.profileImage,
                };
                if (playerColor === 'w') {
                    setBlackProfile(opponentProfile);
                } else if (playerColor === 'b') {
                    setWhiteProfile(opponentProfile);
                } else {
                    // playerColor not yet set — fall back to role
                    if (playerRole === 'host') setBlackProfile(opponentProfile);
                    else if (playerRole === 'client') setWhiteProfile(opponentProfile);
                }
            } else if (message.type === 'restart') {
                if (ignoreNextRemoteRestartRef.current) {
                    ignoreNextRemoteRestartRef.current = false;
                    if (ignoreRestartTimeoutRef.current) {
                        clearTimeout(ignoreRestartTimeoutRef.current);
                        ignoreRestartTimeoutRef.current = null;
                    }
                    return;
                }
                gameOverRef.current(false);
                setShowGameOver(false);
                setGameWinner(null);
                onRestartRef.current?.();
            } else if (message.type === 'disconnect') {
                setShowGameOver(false);
                setGameWinner(null);
                setShowDisconnectNotice(true);
            }
        };

        multiplayerService.setMessageCallback(handleMessage);
        return () => { multiplayerService.setMessageCallback(null); };
    }, [multiplayerMode, playerColor, playerRole]);

    // Handle connection drops
    useEffect(() => {
        if (!multiplayerMode) return;

        const unsubscribe = multiplayerService.addConnectionListener((connected) => {
            if (!connected) {
                setShowGameOver(false);
                setGameWinner(null);
                setShowDisconnectNotice(true);
            }
        });
        return () => { unsubscribe(); };
    }, [multiplayerMode]);

    function handleReturnHomeAfterDisconnect() {
        multiplayerService.disconnect();
        setMultiplayerMode(false);
        setPlayerRole(null);
        setPlayerColor(null);
        setShowDisconnectNotice(false);
        navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    }

    return { showDisconnectNotice, handleReturnHomeAfterDisconnect };
}
