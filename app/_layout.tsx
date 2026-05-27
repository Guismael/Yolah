import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as React from 'react';
import { useFonts } from 'expo-font';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { StatusBar } from 'expo-status-bar';
import {
  Poppins_400Regular,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import Game from './game';
import Index from './index';
import Settings from './settings';
import Customization from './customization';
import Rules from './rules';
import Multiplayer from './multiplayer';
import ProfileSetup from './ProfileSetup';
import ProfileStats from './ProfileStats';
import { GameSettingsProvider } from '../context/GameSettingsContext';
import { ProfileProvider } from '../context/ProfileContext';
import TimerSelect from './TimerSelect';
import GameModeSelect from './GameModeSelect';
import { useBackgroundMusic } from '../hooks/useBackgroundMusic';

/** Invisible component that keeps the background music alive for the whole app. */
function BackgroundMusicManager() {
  useBackgroundMusic();
  return null;
}


const Stack = createNativeStackNavigator();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  React.useEffect(() => {
    const setImmersiveMode = async () => {
      if (Platform.OS !== 'android') {
        return;
      }

      await NavigationBar.setVisibilityAsync('hidden');
      await NavigationBar.setBehaviorAsync('overlay-swipe');
    };

    setImmersiveMode();
  }, []);

  if (!fontsLoaded) {
    return null;
  }
  return (
    <ProfileProvider>
      <GameSettingsProvider>
        <BackgroundMusicManager />
        <StatusBar hidden />
        <Stack.Navigator>
        <Stack.Screen 
          name="Home" 
          component={Index} 
          options={{headerShown: false}} 
        />
        <Stack.Screen 
          name="Settings" 
          component={Settings} 
          options={{headerShown: false}}  
        />
        <Stack.Screen 
          name="Customization" 
          component={Customization} 
          options={{headerShown: false}}  
        />
        <Stack.Screen 
          name="Rules" 
          component={Rules} 
          options={{headerShown: false}}  
        />
        <Stack.Screen 
          name="Multiplayer" 
          component={Multiplayer} 
          options={{headerShown: false}}  
        />
        <Stack.Screen 
          name="ProfileSetup" 
          component={ProfileSetup} 
          options={{headerShown: false}}  
        />
        <Stack.Screen 
          name="ProfileStats" 
          component={ProfileStats} 
          options={{headerShown: false}}  
        />
        <Stack.Screen
          name='GameModeSelect'
          component={GameModeSelect}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name='TimerSelect'
          component={TimerSelect}
          options={{headerShown: false}}
        />
        <Stack.Screen 
          name='Game' 
          component={Game} 
          options={{headerShown: false}} 
        />
        </Stack.Navigator>
      </GameSettingsProvider>
    </ProfileProvider>
  );
}

