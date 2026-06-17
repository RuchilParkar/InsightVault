import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../src/components/common/AppHeader';
import { KnowledgeCard } from '../src/components/common/KnowledgeCard';
import { EmptyState } from '../src/components/common/EmptyState';
import { useKnowledgeStore } from '../src/store/useKnowledgeStore';
import { Heart } from 'lucide-react-native';

export default function FavoritesScreen() {
  const { items } = useKnowledgeStore();
  const router = useRouter();
  
  const favorites = items.filter(i => i.isFavorite);

  return (
    <View className="flex-1 bg-background">
      <AppHeader title="Favorites" />
      
      <ScrollView className="flex-1 px-4 mt-4" showsVerticalScrollIndicator={false}>
        {favorites.length === 0 ? (
          <EmptyState 
            title="No favorites yet"
            description="Tap the heart icon on any knowledge item to add it to your favorites."
            icon={<Heart color="#EF4444" size={32} />}
          />
        ) : (
          <View className="pb-24">
            {favorites.map((item, index) => (
              <KnowledgeCard key={item.id} item={item} index={index} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
