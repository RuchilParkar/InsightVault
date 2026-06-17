import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Plus } from 'lucide-react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

interface FloatingActionButtonProps {
  onPress: () => void;
}

export function FloatingActionButton({ onPress }: FloatingActionButtonProps) {
  return (
    <Animated.View
      entering={ZoomIn.duration(400).springify()}
      className="absolute bottom-6 right-6 shadow-lg shadow-primary/30"
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        className="w-14 h-14 bg-primary rounded-full items-center justify-center"
        accessibilityRole="button"
        accessibilityLabel="Add Knowledge"
      >
        <Plus color="#ffffff" size={28} strokeWidth={2.5} />
      </TouchableOpacity>
    </Animated.View>
  );
}
