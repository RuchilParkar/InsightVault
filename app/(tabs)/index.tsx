import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { AppHeader } from '../../src/components/common/AppHeader';
import { StatCard } from '../../src/components/common/StatCard';
import { KnowledgeCard } from '../../src/components/common/KnowledgeCard';
import { FloatingActionButton } from '../../src/components/common/FloatingActionButton';
import { EmptyState } from '../../src/components/common/EmptyState';
import { Bookmark, Folder, Sparkles } from 'lucide-react-native';
import { AnalyticsWidget } from '../../src/components/home/AnalyticsWidget';
import { useKnowledgeStore } from '../../src/store/useKnowledgeStore';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { items, collections } = useKnowledgeStore();
  const router = useRouter();

  const favoriteCount = items.filter(item => item.isFavorite).length;

  return (
    <View className="flex-1 bg-background">
      <AppHeader title="InsightVault" showSettings />
      
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Quick Stats Section */}
        <View className="flex-row mt-6 mb-8">
          <StatCard 
            label="Saved" 
            value={items.length} 
            icon={<Bookmark color="#4F46E5" size={16} />}
          />
          <StatCard 
            label="Collections" 
            value={collections.length} 
            icon={<Folder color="#06B6D4" size={16} />}
          />
          <StatCard 
            label="Favorites" 
            value={favoriteCount} 
            icon={<Sparkles color="#F59E0B" size={16} />}
          />
        </View>

        {/* Analytics Widget */}
        <AnalyticsWidget />

        {/* Favorites Preview */}
        {favoriteCount > 0 && (
          <View className="mt-8">
            <Text className="text-textPrimary font-outfit text-xl font-semibold mb-4 flex-row items-center">
              <Sparkles color="#F59E0B" size={20} className="mr-2" /> Top Favorites
            </Text>
            {items.filter(i => i.isFavorite).slice(0, 3).map((item, index) => (
              <KnowledgeCard key={item.id} item={item} index={index} />
            ))}
          </View>
        )}

        <Text className="text-textPrimary font-outfit text-xl font-semibold mt-8 mb-4">
          Recently Added
        </Text>

        {items.length === 0 ? (
          <EmptyState 
            title="Your vault is empty"
            description="Tap the + button to save your first piece of knowledge from an article, video, or note."
          />
        ) : (
          <View className="pb-24">
            {items.slice(0, 5).map((item, index) => (
              <KnowledgeCard key={item.id} item={item} index={index} />
            ))}
          </View>
        )}
      </ScrollView>

      <FloatingActionButton onPress={() => router.push('/knowledge/add')} />
    </View>
  );
}
