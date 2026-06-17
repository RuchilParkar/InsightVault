import React from 'react';
import { Text, TouchableOpacity } from 'react-native';

interface TagChipProps {
  label: string;
  onPress?: () => void;
  selected?: boolean;
}

export function TagChip({ label, onPress, selected = false }: TagChipProps) {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.7 : 1}
      onPress={onPress}
      disabled={!onPress}
      className={`px-3 py-1.5 rounded-full border mr-2 mb-2 ${
        selected ? 'bg-primary border-primary' : 'bg-surface border-border'
      }`}
    >
      <Text className={`font-inter text-sm ${selected ? 'text-white font-medium' : 'text-textSecondary'}`}>
        #{label}
      </Text>
    </TouchableOpacity>
  );
}
