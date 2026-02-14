import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppTheme } from './src/core/theme';
import { AppProvider } from './src/presentation/context/AppContext';
import { AppNavigator } from './src/presentation/navigation/AppNavigator';
import * as Font from 'expo-font';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync(MaterialCommunityIcons.font);
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  if (!appIsReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#6C63FF" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppProvider>
        <PaperProvider theme={AppTheme}>
          <StatusBar style="light" backgroundColor="#000" />
          <AppNavigator />
        </PaperProvider>
      </AppProvider>
    </SafeAreaProvider>
  );
}