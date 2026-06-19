import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Settings } from 'lucide-react-native';
import { useRouter } from 'expo-router';

interface AppHeaderProps {
  title: string;
  showSettings?: boolean;
}

export function AppHeader({ title, showSettings = false }: AppHeaderProps) {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-between px-6 pt-12 pb-4 bg-background border-b border-border">
      <Text className="text-textPrimary font-outfit text-2xl font-bold tracking-tight">
        {title}
      </Text>
      {showSettings && (
        <Pressable 
          onPress={() => router.push('/settings')}
          android_ripple={{ color: 'rgba(255, 255, 255, 0.2)', borderless: true, radius: 20 }}
          className="p-2 bg-card rounded-full border border-border overflow-hidden"
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Settings color="#F8FAFC" size={20} strokeWidth={2.5} />
        </Pressable>
      )}
    </View>
  );
}
