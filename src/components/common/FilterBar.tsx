import React from 'react';
import { ScrollView, TouchableOpacity, Text } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

interface FilterBarProps {
  filters: string[];
  activeFilter: string;
  onSelectFilter: (filter: string) => void;
}

export function FilterBar({ filters, activeFilter, onSelectFilter }: FilterBarProps) {
  return (
    <Animated.View entering={FadeIn.duration(400)} className="mb-4">
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter}
            activeOpacity={0.7}
            onPress={() => onSelectFilter(filter)}
            className={`px-4 py-2 rounded-full border mr-3 ${
              activeFilter === filter 
                ? 'bg-primary border-primary' 
                : 'bg-surface border-border'
            }`}
          >
            <Text className={`font-inter text-sm font-medium ${
              activeFilter === filter ? 'text-white' : 'text-textSecondary'
            }`}>
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );
}
