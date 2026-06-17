import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Share, Clipboard, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useKnowledgeStore } from '../../src/store/useKnowledgeStore';
import { useSQLiteContext } from 'expo-sqlite';
import { getRelatedKnowledge } from '../../src/services/related';
import { KnowledgeItem } from '../../src/types/schemas';
import { KnowledgeCard } from '../../src/components/common/KnowledgeCard';
import { TagChip } from '../../src/components/common/TagChip';
import Animated, { FadeIn, SlideInRight } from 'react-native-reanimated';
import { ChevronLeft, Share as ShareIcon, Copy, Trash2, Edit3, Heart, Link2, Folder, Clock, CheckCircle, AlertCircle } from 'lucide-react-native';

export default function KnowledgeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const db = useSQLiteContext();
  
  const { items, updateItem, removeItem, collections, tags, itemTags } = useKnowledgeStore();
  const item = items.find(i => i.id === id);
  
  const [related, setRelated] = useState<KnowledgeItem[]>([]);

  useEffect(() => {
    if (item) {
      getRelatedKnowledge(db, item).then(setRelated);
    }
  }, [item, db]);

  if (!item) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-textPrimary font-outfit text-xl">Item not found.</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4 p-3 bg-surface rounded-xl">
          <Text className="text-textPrimary font-inter">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const collectionName = collections.find(c => c.id === item.collectionId)?.name || 'Uncategorized';
  
  const currentItemTags = itemTags
    .filter(it => it.itemId === item.id)
    .map(it => tags.find(t => t.id === it.tagId))
    .filter(Boolean);

  const handleFavorite = async () => {
    const newState = !item.isFavorite;
    updateItem(item.id, { isFavorite: newState });
    await db.runAsync(`UPDATE knowledge_items SET is_favorite = ? WHERE id = ?`, [newState ? 1 : 0, item.id]);
  };

  const handleDelete = () => {
    Alert.alert('Delete Knowledge', 'Are you sure you want to permanently delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          await db.runAsync(`DELETE FROM knowledge_items WHERE id = ?`, [item.id]);
          removeItem(item.id);
          router.back();
        } 
      }
    ]);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out what I saved to my vault: ${item.title}\n\nSummary: ${item.shortSummary || item.description}\n\n${item.sourceUrl || ''}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCopy = () => {
    Clipboard.setString(item.detailedSummary || item.shortSummary || item.description || item.title);
    Alert.alert('Copied', 'Summary copied to clipboard');
  };

  const renderStatus = () => {
    switch (item.processingStatus) {
      case 'pending':
      case 'processing':
        return (
          <View className="flex-row items-center bg-accent/20 px-3 py-1.5 rounded-full mb-4 self-start">
            <Clock color="#06B6D4" size={14} />
            <Text className="text-accent font-inter text-xs ml-2">AI Processing...</Text>
          </View>
        );
      case 'failed':
        return (
          <View className="flex-row items-center bg-red-500/20 px-3 py-1.5 rounded-full mb-4 self-start">
            <AlertCircle color="#EF4444" size={14} />
            <Text className="text-red-500 font-inter text-xs ml-2">AI Processing Failed</Text>
          </View>
        );
      default:
        return null; // Completed, no need to show status
    }
  };

  return (
    <View className="flex-1 bg-background">
      {/* Custom Header */}
      <View className="flex-row items-center justify-between px-4 pt-14 pb-4 border-b border-border bg-background">
        <TouchableOpacity onPress={() => router.back()} className="p-2 bg-surface rounded-full">
          <ChevronLeft color="#F8FAFC" size={24} />
        </TouchableOpacity>
        <View className="flex-row space-x-3">
          <TouchableOpacity onPress={handleFavorite} className="p-2 bg-surface rounded-full">
            <Heart color={item.isFavorite ? "#EF4444" : "#F8FAFC"} fill={item.isFavorite ? "#EF4444" : "none"} size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare} className="p-2 bg-surface rounded-full">
            <ShareIcon color="#F8FAFC" size={20} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDelete} className="p-2 bg-surface rounded-full">
            <Trash2 color="#F8FAFC" size={20} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(400)} className="pt-6 pb-4">
          {renderStatus()}
          
          <Text className="text-textPrimary font-outfit text-3xl font-bold leading-tight mb-4">
            {item.title}
          </Text>

          <View className="flex-row flex-wrap mb-6 border-b border-border pb-6">
            <View className="flex-row items-center mr-4 mb-2">
              <Folder color="#94A3B8" size={14} />
              <Text className="text-textSecondary font-inter text-sm ml-1.5">{collectionName}</Text>
            </View>
            <View className="flex-row items-center mr-4 mb-2">
              <Clock color="#94A3B8" size={14} />
              <Text className="text-textSecondary font-inter text-sm ml-1.5">{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
            {item.domain && (
              <View className="flex-row items-center mb-2">
                <Link2 color="#94A3B8" size={14} />
                <Text className="text-textSecondary font-inter text-sm ml-1.5">{item.domain}</Text>
              </View>
            )}
          </View>

          {item.reasonSaved && (
            <View className="bg-card p-4 rounded-2xl mb-6 border border-border border-l-4 border-l-primary">
              <Text className="text-textSecondary font-inter text-xs font-bold uppercase tracking-wider mb-1">Reason Saved</Text>
              <Text className="text-textPrimary font-inter text-base italic">"{item.reasonSaved}"</Text>
            </View>
          )}

          {item.detailedSummary && (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-textPrimary font-outfit text-xl font-bold">Summary</Text>
                <TouchableOpacity onPress={handleCopy} className="p-2">
                  <Copy color="#94A3B8" size={16} />
                </TouchableOpacity>
              </View>
              <Text className="text-textSecondary font-inter text-base leading-relaxed">
                {item.detailedSummary}
              </Text>
            </View>
          )}

          {item.aiLearnings && (
            <View className="mb-8 bg-surface p-5 rounded-2xl border border-border">
              <Text className="text-textPrimary font-outfit text-xl font-bold mb-3">Key Learnings</Text>
              <Text className="text-textSecondary font-inter text-base leading-relaxed">
                {item.aiLearnings}
              </Text>
            </View>
          )}

          {/* Tags */}
          {currentItemTags.length > 0 && (
            <View className="mb-8 flex-row flex-wrap">
              {currentItemTags.map((t: any) => (
                <TagChip key={t.id} label={t.name} />
              ))}
            </View>
          )}
        </Animated.View>

        {related.length > 0 && (
          <Animated.View entering={SlideInRight.delay(200)} className="pt-6 border-t border-border mb-12">
            <Text className="text-textPrimary font-outfit text-xl font-bold mb-4">Related Knowledge</Text>
            {related.map((rel, index) => (
              <KnowledgeCard key={rel.id} item={rel} index={index} />
            ))}
          </Animated.View>
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
