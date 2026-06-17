import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
        <TouchableOpacity 
          onPress={() => router.push('/settings')}
          className="p-2 bg-surface rounded-full border border-border"
          accessibilityRole="button"
          accessibilityLabel="Settings"
        >
          <Settings color="#F8FAFC" size={20} strokeWidth={2.5} />
        </TouchableOpacity>
      )}
    </View>
  );
}
