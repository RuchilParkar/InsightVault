import React from 'react';
import { View, Text } from 'react-native';
import { useKnowledgeStore } from '../../store/useKnowledgeStore';
import Animated, { FadeIn } from 'react-native-reanimated';

export function AnalyticsWidget() {
  const { items, collections } = useKnowledgeStore();
  
  // Basic analytics processing
  const totalSaved = items.length;
  const favorites = items.filter(i => i.isFavorite).length;
  const collectionCount = collections.length;
  
  // Tag frequencies (simplified since tags aren't fully loaded into store in this MVP version)
  // For production, we'd query SQLite or Zustand state for tags
  
  return (
    <Animated.View entering={FadeIn.delay(300)} className="bg-surface rounded-2xl p-5 border border-border mt-6">
      <Text className="text-textPrimary font-outfit text-xl font-bold mb-4">Your Vault Stats</Text>
      
      <View className="flex-row justify-between mb-4">
        <View>
          <Text className="text-textSecondary font-inter text-xs font-semibold uppercase tracking-wider mb-1">Total Items</Text>
          <Text className="text-primary font-outfit text-2xl font-bold">{totalSaved}</Text>
        </View>
        <View>
          <Text className="text-textSecondary font-inter text-xs font-semibold uppercase tracking-wider mb-1">Favorites</Text>
          <Text className="text-accent font-outfit text-2xl font-bold">{favorites}</Text>
        </View>
        <View>
          <Text className="text-textSecondary font-inter text-xs font-semibold uppercase tracking-wider mb-1">Collections</Text>
          <Text className="text-emerald-400 font-outfit text-2xl font-bold">{collectionCount}</Text>
        </View>
      </View>

      {/* Lightweight graph visualization mock */}
      <View className="flex-row h-2 rounded-full overflow-hidden mt-2 bg-background">
        <View style={{ width: `${(favorites / (totalSaved || 1)) * 100}%` }} className="bg-accent h-full" />
        <View style={{ flex: 1 }} className="bg-primary h-full" />
      </View>
      <Text className="text-textSecondary font-inter text-xs mt-2 text-right">Knowledge Graph Density</Text>
    </Animated.View>
  );
}
