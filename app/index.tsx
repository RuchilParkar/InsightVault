import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { Layers } from 'lucide-react-native';

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View className="flex-1 bg-background items-center justify-center">
      <Animated.View 
        entering={FadeIn.duration(1000)} 
        exiting={FadeOut.duration(500)}
        className="items-center"
      >
        <View className="w-20 h-20 bg-primary/20 rounded-3xl items-center justify-center mb-6 border border-primary/30">
          <Layers color="#4F46E5" size={40} strokeWidth={2} />
        </View>
        <Text className="text-textPrimary font-outfit text-4xl font-bold tracking-tight mb-2">
          InsightVault
        </Text>
        <Text className="text-textSecondary font-inter text-base tracking-wide">
          Save less. Remember more.
        </Text>
      </Animated.View>
    </View>
  );
}
