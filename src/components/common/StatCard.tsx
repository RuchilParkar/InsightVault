import React from 'react';
import { View, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export function StatCard({ label, value, icon }: StatCardProps) {
  return (
    <Animated.View 
      entering={FadeIn.duration(400)}
      className="flex-1 bg-surface rounded-2xl p-4 border border-border mr-3 last:mr-0"
    >
      <View className="flex-row items-center mb-2">
        {icon && <View className="mr-2">{icon}</View>}
        <Text className="text-textSecondary font-inter text-xs font-medium uppercase tracking-wider">{label}</Text>
      </View>
      <Text className="text-textPrimary font-outfit text-2xl font-bold">{value}</Text>
    </Animated.View>
  );
}
