// src/components/common/KnowledgeCard.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Link2, Sparkles, Folder, Image as ImageIcon } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { KnowledgeItem } from '../../types/schemas';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { TagChip } from './TagChip';
import { useKnowledgeStore } from '../../store/useKnowledgeStore';

interface KnowledgeCardProps {
  item: KnowledgeItem;
  index: number;
}

export function KnowledgeCard({ item, index }: KnowledgeCardProps) {
  const router = useRouter();
  const { tags, itemTags } = useKnowledgeStore();

  const currentItemTags = itemTags
    .filter(it => it.itemId === item.id)
    .map(it => tags.find(t => t.id === it.tagId))
    .filter(Boolean);

  return (
    <Animated.View 
      entering={FadeInUp.delay(index * 100).springify().damping(14)}
      className="mb-4"
    >
      <Pressable 
        onPress={() => router.push(`/knowledge/${item.id}`)}
        android_ripple={{ color: 'rgba(255, 255, 255, 0.1)', borderless: false }}
        className="bg-card rounded-2xl border border-border overflow-hidden"
        accessibilityRole="button"
        accessibilityLabel={`View details for ${item.title}`}
      >
        {/* Cached Thumbnail */}
        {item.thumbnail ? (
          <Image
            source={{ uri: item.thumbnail }}
            className="w-full h-32 bg-surface"
            contentFit="cover"
            transition={300}
            cachePolicy="disk"
          />
        ) : item.domain ? (
          <View className="w-full h-16 bg-surface items-center justify-center border-b border-border/50">
            <ImageIcon color="#475569" size={24} />
          </View>
        ) : null}

        <View className="p-4">
          <View className="flex-row items-start justify-between mb-2">
            <Text 
              className="flex-1 text-textPrimary font-outfit text-lg font-semibold mr-4 leading-tight"
              numberOfLines={2}
            >
              {item.title}
            </Text>
            {item.isFavorite && (
              <Sparkles color="#38BDF8" size={18} />
            )}
          </View>

          {(item.shortSummary || item.aiSummary) && (
            <Text 
              className="text-textSecondary font-inter text-sm mb-3 leading-relaxed"
              numberOfLines={3}
            >
              {item.shortSummary || item.aiSummary}
            </Text>
          )}

          {currentItemTags.length > 0 && (
            <View className="flex-row flex-wrap mb-2">
              {currentItemTags.slice(0, 3).map((t: any) => (
                <View key={t.id} className="mr-2 mb-2 bg-surface px-2 py-1 rounded-md border border-border">
                  <Text className="text-textSecondary text-xs font-inter">{t.name}</Text>
                </View>
              ))}
              {currentItemTags.length > 3 && (
                <View className="mb-2 bg-surface px-2 py-1 rounded-md border border-border">
                  <Text className="text-textSecondary text-xs font-inter">+{currentItemTags.length - 3}</Text>
                </View>
              )}
            </View>
          )}

          <View className="flex-row items-center justify-between mt-2 pt-3 border-t border-border/50">
            <View className="flex-row items-center space-x-3">
              {item.domain && (
                <View className="flex-row items-center bg-surface px-2 py-1 rounded-md">
                  <Link2 color="#818CF8" size={14} />
                  <Text className="text-accent text-xs font-inter ml-1">{item.domain}</Text>
                </View>
              )}
            </View>
            <Text className="text-textSecondary text-xs font-inter">
              {new Date(item.createdAt).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  );
}
