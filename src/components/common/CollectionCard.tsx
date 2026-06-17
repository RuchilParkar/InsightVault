import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Folder } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Collection } from '../../types/schemas';
import { useRouter } from 'expo-router';

interface CollectionCardProps {
  collection: Collection;
  itemCount: number;
  index: number;
}

export function CollectionCard({ collection, itemCount, index }: CollectionCardProps) {
  const router = useRouter();

  return (
    <Animated.View 
      entering={FadeInUp.delay(index * 50).springify()}
      className="flex-1 m-2"
    >
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => router.push(`/collections/${collection.id}`)}
        className="bg-card rounded-2xl p-4 border border-border h-32 justify-between"
        accessibilityRole="button"
        accessibilityLabel={`Collection ${collection.name} with ${itemCount} items`}
      >
        <View className="w-10 h-10 rounded-full bg-surface items-center justify-center mb-2">
          <Folder color="#4F46E5" size={20} />
        </View>
        <View>
          <Text 
            className="text-textPrimary font-outfit font-semibold text-base mb-1"
            numberOfLines={1}
          >
            {collection.name}
          </Text>
          <Text className="text-textSecondary font-inter text-xs">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
