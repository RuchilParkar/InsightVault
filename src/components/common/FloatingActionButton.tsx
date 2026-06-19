import React from 'react';
import { Pressable } from 'react-native';
import { Plus } from 'lucide-react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

interface FloatingActionButtonProps {
  onPress: () => void;
}

export function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  return (
    <Animated.View
      entering={ZoomIn.duration(400).springify()}
      className="absolute bottom-28 right-6 shadow-lg shadow-primary/30"
    >
      <Pressable
        onPress={onPress}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.3)', borderless: true, radius: 28 }}
        className="w-14 h-14 bg-primary rounded-full items-center justify-center overflow-hidden"
        accessibilityRole="button"
        accessibilityLabel="Add Knowledge"
      >
        <Plus color="#ffffff" size={28} strokeWidth={2.5} />
      </Pressable>
    </Animated.View>
  );
}
