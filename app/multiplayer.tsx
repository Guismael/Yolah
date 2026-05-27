import { Ionicons } from '@expo/vector-icons';
import * as Network from 'expo-network';
import { NavigationProp, useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useGameSettings } from '../context/GameSettingsContext';
import { useProfile } from '../context/ProfileContext';
import {
  DEFAULT_DISCOVERY_PORT,
  DEFAULT_MULTIPLAYER_PORT,
  multiplayerService,
} from '../services/MultiplayerService';
import ChessBackground from '../components/ChessBackground';
import { getDynamicStyles, multiplayerStyles as styles } from '../assets/Styles/styles';
import { useI18n } from '../context/useI18n';

type RootStackParamList = {
  Home: undefined;
  Multiplayer: { timer?: number; useTimer?: boolean } | undefined;
  TimerSelect: { fromMultiplayer?: boolean };
  Game: { timer?: number; multiplayer?: boolean } | undefined;
  ProfileSetup: undefined;
  ProfileStats: undefined;
};

type DiscoveredRoom = {
  roomId: string;
  hostIp: string;
  senderIp: string;
  rawMessage: string;
  lastSeen: number;
};

export default function Multiplayer() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'Multiplayer'>>();
  const { darkMode, setMultiplayerMode, setPlayerRole } = useGameSettings();
  const { profile } = useProfile();
  const { t } = useI18n();
  const ds = getDynamicStyles(darkMode);

  const [mode, setMode] = useState<'menu' | 'host' | 'rooms'>('menu');
  const [status, setStatus] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hostDeviceIP, setHostDeviceIP] = useState('');
  const [isFetchingIP, setIsFetchingIP] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [rooms, setRooms] = useState<DiscoveredRoom[]>([]);
  const [selectedTimer, setSelectedTimer] = useState<number | null>(null);
  const [useTimer, setUseTimer] = useState<boolean>(false);
  const [discoveryLogs, setDiscoveryLogs] = useState<string[]>([]);
  const isConnectedRef = useRef(false);
  const isConnectingRef = useRef(false);

  const appendDiscoveryLog = (entry: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const line = `[${timestamp}] ${entry}`;
    console.log(`[MultiplayerDiscoveryUI] ${line}`);
    setDiscoveryLogs((previous) => {
      const next = [...previous, line];
      return next.slice(-40);
    });
  };

  const upsertRoom = (room: DiscoveredRoom) => {
    setRooms((previous) => {
      const existingIndex = previous.findIndex((item) => item.roomId === room.roomId && item.hostIp === room.hostIp);
      if (existingIndex === -1) {
        return [room, ...previous].slice(0, 30);
      }

      const next = [...previous];
      next[existingIndex] = room;
      return next.sort((a, b) => b.lastSeen - a.lastSeen);
    });
  };

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  useEffect(() => {
    isConnectingRef.current = isConnecting;
  }, [isConnecting]);

  // Handle timer selection from TimerSelect screen
  useEffect(() => {
    if (route.params?.timer !== undefined || route.params?.useTimer !== undefined) {
      const timer = route.params.timer;
      const hasTimer = route.params.useTimer ?? (timer !== undefined);
      
      setSelectedTimer(timer || null);
      setUseTimer(hasTimer);
      
      // After timer selection, go to host setup
      setMode('host');
      
      // Clear the route params
      navigation.setParams({ timer: undefined, useTimer: undefined } as any);
    }
  }, [route.params?.timer, route.params?.useTimer]);

  const colors = darkMode ? {
    primary: '#7C3AED',
    secondary: '#1E3A8A',
    cardBg: 'rgba(27, 38, 59, 0.95)',
    text: '#E0E7FF',
  } : {
    primary: '#9e6df7',
    secondary: '#A855F7',
    cardBg: 'rgba(255, 255, 255, 0.95)',
    text: '#1F2937',
  };

  useEffect(() => {
    // Set up callbacks
    multiplayerService.setConnectionCallback((connected, role) => {
      setIsConnected(connected);
      isConnectedRef.current = connected;
      setIsConnecting(false);
      isConnectingRef.current = false;

      if (connected) {
        multiplayerService.stopRoomDiscovery();
      }

      if (connected) {
        setStatus(t('multiplayer.connectedAs', { role }));
        setPlayerRole(role);

        if (role === 'host') {
          multiplayerService.stopRoomBroadcast();
        }
        
        // Navigate to game after a short delay
        setTimeout(() => {
          // Only host passes timer to game, client will receive it via message
          const timerParam = role === 'host' && useTimer && selectedTimer ? selectedTimer : undefined;
          navigation.navigate('Game', { 
            multiplayer: true,
            timer: timerParam,
          });
        }, 1000);
      } else {
        setStatus(t('multiplayer.disconnected'));
        setMultiplayerMode(false);
      }
    });

    multiplayerService.setErrorCallback((error) => {
      setIsConnecting(false);
      setStatus(`${t('multiplayer.connectionError')}: ${error}`);
      Alert.alert(t('multiplayer.connectionError'), error);
    });

    return () => {
      // Cleanup on unmount
      if (!isConnectedRef.current) {
        multiplayerService.disconnect();
      }
    };
  }, [selectedTimer, t, useTimer]);

  // Send profile when connected and profile is available
  useEffect(() => {
    if (isConnected && profile && profile.username) {
      console.log('[Multiplayer] Sending profile, connected:', isConnected, 'profile:', profile.username);
      multiplayerService.sendMessage({
        type: 'profile',
        username: profile.username,
        profileImage: profile.profileImage,
      });
    }
  }, [isConnected, profile]);

  useEffect(() => {
    const fetchHostIP = async () => {
      if (mode !== 'host' || hostDeviceIP || isFetchingIP) {
        return;
      }

      setIsFetchingIP(true);
      try {
        const ip = await Network.getIpAddressAsync();
        setHostDeviceIP(ip);
      } catch {
        setHostDeviceIP('Unavailable');
      } finally {
        setIsFetchingIP(false);
      }
    };

    fetchHostIP();
  }, [mode, hostDeviceIP, isFetchingIP]);

  useEffect(() => {
    let cancelled = false;

    if (mode !== 'rooms') {
      multiplayerService.stopRoomDiscovery();
      multiplayerService.setDiscoveryLogCallback(null);
      multiplayerService.setRoomAnnouncementCallback(null);
      setRooms([]);
      return;
    }

    setDiscoveryLogs([]);
    appendDiscoveryLog(`Starting multicast discovery on UDP ${DEFAULT_DISCOVERY_PORT}`);

    multiplayerService.setDiscoveryLogCallback((entry) => {
      appendDiscoveryLog(entry);
    });

    multiplayerService.setRoomAnnouncementCallback((announcedRoomId, announcedIp, senderIp, rawMessage) => {
      upsertRoom({
        roomId: announcedRoomId,
        hostIp: announcedIp,
        senderIp,
        rawMessage,
        lastSeen: Date.now(),
      });
      appendDiscoveryLog(`Announcement parsed: room=${announcedRoomId} host=${announcedIp} sender=${senderIp}`);
    });

    const startDiscovery = async () => {
      let localIp = '';
      try {
        localIp = await Network.getIpAddressAsync();
      } catch {
        localIp = '';
      }

      if (cancelled) {
        return;
      }

      if (localIp) {
        appendDiscoveryLog(`Joiner local IP: ${localIp}`);
      } else {
        appendDiscoveryLog('Joiner local IP unavailable.');
      }

      multiplayerService.startRoomDiscovery(DEFAULT_DISCOVERY_PORT, localIp || undefined);
    };

    startDiscovery();

    return () => {
      cancelled = true;
      multiplayerService.stopRoomDiscovery();
      multiplayerService.setDiscoveryLogCallback(null);
      multiplayerService.setRoomAnnouncementCallback(null);
    };
  }, [mode]);

  const handleHostGame = async () => {
    if (!roomId.trim()) {
      Alert.alert(t('multiplayer.missingRoomTitle'), t('multiplayer.missingRoomBody'));
      return;
    }

    let ipToBroadcast = hostDeviceIP;
    if (!ipToBroadcast || ipToBroadcast === 'Unavailable') {
      try {
        ipToBroadcast = await Network.getIpAddressAsync();
        setHostDeviceIP(ipToBroadcast);
      } catch {
        ipToBroadcast = '';
      }
    }

    setStatus(t('multiplayer.roomCreated'));
    setIsConnecting(false);
    multiplayerService.startHost(DEFAULT_MULTIPLAYER_PORT);

    if (ipToBroadcast) {
      multiplayerService.startRoomBroadcast(ipToBroadcast, roomId.trim(), DEFAULT_DISCOVERY_PORT);
    } else {
      setStatus(t('multiplayer.roomMaybeHidden'));
    }

    setMode('host');
  };

  const handleOpenRooms = () => {
    setMode('rooms');
    setDiscoveryLogs([]);
    setRooms([]);
    setStatus(t('multiplayer.lookingRooms'));
  };

  const handleRefreshRooms = () => {
    setRooms([]);
    setDiscoveryLogs([]);
    setStatus(t('multiplayer.lookingRooms'));
    multiplayerService.stopRoomDiscovery();
    multiplayerService.startRoomDiscovery(DEFAULT_DISCOVERY_PORT);
  };

  const handleConnectToRoom = (room: DiscoveredRoom) => {
    if (isConnectingRef.current) {
      return;
    }

    multiplayerService.stopRoomDiscovery();
    setStatus(`Joining "${room.roomId}"...`);
    setIsConnecting(true);
    isConnectingRef.current = true;
    multiplayerService.connectToHost(room.hostIp, DEFAULT_MULTIPLAYER_PORT);
    setMode('rooms');
  };

  const handleBack = () => {
    if (mode === 'host') {
      multiplayerService.stopRoomBroadcast();
      multiplayerService.stopRoomDiscovery();
      setMode('menu');
      setStatus('');
      setIsConnected(false);
      setIsConnecting(false);
      setDiscoveryLogs([]);
      setRoomId('');
      setRooms([]);
    } else if (mode === 'rooms') {
      multiplayerService.stopRoomBroadcast();
      multiplayerService.stopRoomDiscovery();
      setStatus('');
      setIsConnected(false);
      setIsConnecting(false);
      setDiscoveryLogs([]);
      setRoomId('');
      setRooms([]);
      navigation.navigate('Home');
    } else {
      navigation.navigate('Home');
    }
  };

  const renderMenu = () => (
    <>
      <Text style={[styles.title, { color: colors.text }]}>
        {t('multiplayer.title')}
      </Text>
      <Text style={[styles.subtitle, { color: colors.text, opacity: 0.7 }]}>
        {t('multiplayer.subtitle')}
      </Text>

      <TouchableOpacity
        style={[styles.button, styles.primaryButton, { backgroundColor: colors.primary }]}
        onPress={() => {
          navigation.navigate('TimerSelect', { fromMultiplayer: true });
        }}
      >
        <Ionicons name="wifi" size={24} color="white" />
        <Text style={styles.buttonText}>{t('common.hostGame')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.primaryButton, { backgroundColor: colors.primary }]}
        onPress={handleOpenRooms}
      >
        <Ionicons name="list" size={24} color="white" />
        <Text style={styles.buttonText}>{t('multiplayer.findRooms')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton, { borderColor: colors.primary }]}
        onPress={handleBack}
      >
        <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
          {t('multiplayer.backHome')}
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderHostSetup = () => (
    <>
      <Text style={[styles.title, { color: colors.text }]}>
        {t('multiplayer.createRoom')}
      </Text>

      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>{t('multiplayer.roomName')}</Text>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              color: colors.text,
              borderColor: colors.primary,
            },
          ]}
          value={roomId}
          onChangeText={setRoomId}
          placeholder={t('multiplayer.roomPlaceholder')}
          placeholderTextColor={darkMode ? '#9CA3AF' : '#6B7280'}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle" size={20} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.text }]}> 
          {t('multiplayer.hostInfo')}
        </Text>
      </View>

      {status && (
        <View style={[styles.statusBox, { backgroundColor: darkMode ? 'rgba(124, 58, 237, 0.2)' : 'rgba(158, 109, 247, 0.2)' }]}>
          <Text style={[styles.statusText, { color: colors.text }]}>{status}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, styles.primaryButton, { backgroundColor: colors.primary }]}
        onPress={handleHostGame}
        disabled={isConnected}
      >
        <Text style={styles.buttonText}>
          {isConnected ? t('common.waiting') : t('multiplayer.startHosting')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton, { borderColor: colors.primary }]}
        onPress={handleBack}
      >
        <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
          {t('multiplayer.backToMenu')}
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderRoomsScreen = () => (
    <>
      <Text style={[styles.title, { color: colors.text }]}>{t('multiplayer.joinRoom')}</Text>
      <Text style={[styles.subtitle, { color: colors.text, opacity: 0.7 }]}>{t('multiplayer.joinSubtitle')}</Text>

      <View style={styles.infoBox}>
        <Ionicons name="radio" size={20} color={colors.primary} />
        <Text style={[styles.infoText, { color: colors.text }]}> 
          {t('multiplayer.joinInfo')}
        </Text>
      </View>

      <View style={[styles.logBox, { borderColor: colors.primary, backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }]}> 
        <Text style={[styles.logTitle, { color: colors.text }]}>{t('multiplayer.availableRooms')}</Text>
        <ScrollView style={styles.logScroll} contentContainerStyle={styles.logScrollContent}>
          {rooms.length === 0 ? (
            <Text style={[styles.logText, { color: colors.text, opacity: 0.7 }]}>{t('multiplayer.noRooms')}</Text>
          ) : (
            rooms.map((room) => (
              <TouchableOpacity
                key={`${room.roomId}-${room.hostIp}`}
                style={[
                  styles.roomCard,
                  { borderColor: colors.primary, backgroundColor: darkMode ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.8)' },
                ]}
                onPress={() => handleConnectToRoom(room)}
                disabled={isConnecting}
              >
                <Text style={[styles.roomTitle, { color: colors.text }]}>{room.roomId}</Text>
                <TouchableOpacity
                  style={[styles.joinButton, { backgroundColor: colors.primary }]}
                  onPress={() => handleConnectToRoom(room)}
                  disabled={isConnecting}
                >
                  <Text style={styles.joinButtonText}>{isConnecting ? t('multiplayer.joining') : t('multiplayer.join')}</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {status ? (
        <View style={[styles.statusBox, { backgroundColor: darkMode ? 'rgba(124, 58, 237, 0.2)' : 'rgba(158, 109, 247, 0.2)' }]}>
          <Text style={[styles.statusText, { color: colors.text }]}>{status}</Text>
        </View>
      ) : null}

      <TouchableOpacity
        style={[styles.button, styles.primaryButton, { backgroundColor: colors.primary }]}
        onPress={handleRefreshRooms}
      >
        <Ionicons name="refresh" size={24} color="white" />
        <Text style={styles.buttonText}>{t('common.refresh')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.primaryButton, { backgroundColor: colors.secondary }]}
        onPress={() => setMode('host')}
      >
        <Ionicons name="wifi" size={24} color="white" />
        <Text style={styles.buttonText}>{t('common.hostGame')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton, { borderColor: colors.primary }]}
        onPress={handleBack}
      >
        <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>{t('multiplayer.backToMenu')}</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={[styles.container, ds.bg.screen]}>
      <ChessBackground isDark={darkMode} />
      
      <View style={[styles.card, { 
        backgroundColor: colors.cardBg,
        borderColor: colors.primary,
      }]}>
        {mode === 'menu' && renderMenu()}
        {mode === 'host' && renderHostSetup()}
        {mode === 'rooms' && renderRoomsScreen()}
      </View>
    </View>
  );
}

