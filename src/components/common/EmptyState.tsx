import React from 'react';
import { View, Text } from 'react-native';
import { Inbox } from 'lucide-react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <Animated.View 
      entering={FadeIn.duration(500)}
      className="flex-1 items-center justify-center p-8 mt-10"
    >
      <View className="w-20 h-20 bg-surface rounded-full items-center justify-center mb-6 border border-border">
        {icon || <Inbox color="#4F46E5" size={32} />}
      </View>
      <Text className="text-textPrimary font-outfit text-xl font-bold mb-3 text-center">
        {title}
      </Text>
      <Text className="text-textSecondary font-inter text-base text-center leading-relaxed">
        {description}
      </Text>
    </Animated.View>
  );
}
