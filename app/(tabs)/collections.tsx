import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { AppHeader } from '../../src/components/common/AppHeader';
import { CollectionCard } from '../../src/components/common/CollectionCard';
import { EmptyState } from '../../src/components/common/EmptyState';
import { useKnowledgeStore } from '../../src/store/useKnowledgeStore';

export default function CollectionsScreen() {
  const { collections, items } = useKnowledgeStore();

  const getCollectionItemCount = (collectionId: string) => {
    return items.filter(item => item.collectionId === collectionId).length;
  };

  return (
    <View className="flex-1 bg-background">
      <AppHeader title="Collections" />
      
      <ScrollView className="flex-1 px-2 mt-4" showsVerticalScrollIndicator={false}>
        {collections.length === 0 ? (
          <EmptyState 
            title="No collections yet"
            description="Create your first collection to organize your knowledge."
          />
        ) : (
          <View className="flex-row flex-wrap pb-24">
            {collections.map((collection, index) => (
              <View key={collection.id} className="w-1/2 p-2">
                <CollectionCard 
                  collection={collection} 
                  itemCount={getCollectionItemCount(collection.id)}
                  index={index}
                />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
