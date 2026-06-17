// app/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { Outfit_400Regular, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SQLiteProvider, useSQLiteContext } from 'expo-sqlite';
import { initDatabase, DB_NAME } from '../src/database/schema';
import { hydrateStore } from '../src/database/boot';
import { View, Text, ActivityIndicator } from 'react-native';
import '../global.css';

function AppInitializer({ children }: { children: React.ReactNode }) {
  const db = useSQLiteContext();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    async function load() {
      await hydrateStore(db);
      setIsHydrated(true);
    }
    load();
  }, [db]);

  if (!isHydrated) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter: Inter_400Regular,
    InterMedium: Inter_500Medium,
    InterSemiBold: Inter_600SemiBold,
    Outfit: Outfit_400Regular,
    OutfitSemiBold: Outfit_600SemiBold,
    OutfitBold: Outfit_700Bold,
  });

  if (!fontsLoaded) {
    return null; // Keep splash screen visible while fonts load
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" />
      <SQLiteProvider databaseName={DB_NAME} onInit={initDatabase}>
        <AppInitializer>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
          </Stack>
        </AppInitializer>
      </SQLiteProvider>
    </GestureHandlerRootView>
  );
}
