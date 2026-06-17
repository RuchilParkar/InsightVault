import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { AppHeader } from '../../src/components/common/AppHeader';
import { extractMetadata } from '../../src/services/metadata';
import { enqueueAIProcessing } from '../../src/services/queue';
import { insertKnowledgeItem, checkDuplicate } from '../../src/database/queries';
import { useKnowledgeStore } from '../../src/store/useKnowledgeStore';
import { useSQLiteContext } from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { KnowledgeItem } from '../../src/types/schemas';
import { Link2, AlignLeft, HelpCircle } from 'lucide-react-native';

export default function AddKnowledgeScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const addItem = useKnowledgeStore(state => state.addItem);

  const [url, setUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [reasonSaved, setReasonSaved] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    // Validation
    if (!url.trim() && !notes.trim()) {
      Alert.alert('Error', 'Please provide either a URL or some notes.');
      return;
    }
    if (!reasonSaved.trim()) {
      Alert.alert('Required Field', 'Please tell us why you are saving this.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Duplicate Check
      const isDuplicate = await checkDuplicate(db, url.trim() || undefined, undefined);
      if (isDuplicate) {
        Alert.alert(
          'Possible Duplicate',
          'This item may already exist in your vault. Do you want to save it anyway?',
          [
            { text: 'Cancel', style: 'cancel', onPress: () => setIsSubmitting(false) },
            { text: 'Save Anyway', style: 'default', onPress: () => proceedToSave() }
          ]
        );
        return;
      }

      await proceedToSave();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to save knowledge.');
      setIsSubmitting(false);
    }
  };

  const proceedToSave = async () => {
    let metadata = {};
    if (url.trim()) {
      metadata = await extractMetadata(url.trim());
    }

    const newItem: KnowledgeItem = {
      id: Crypto.randomUUID(),
      title: metadata.title || (url ? new URL(url).hostname : 'Saved Note'),
      sourceUrl: url.trim() || undefined,
      description: notes.trim() || undefined,
      reasonSaved: reasonSaved.trim(),
      thumbnail: metadata.thumbnail,
      domain: metadata.domain,
      processingStatus: 'pending',
      isFavorite: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // 1. Save to DB
    await insertKnowledgeItem(db, newItem);

    // 2. Update local state
    addItem(newItem);

    // 3. Queue AI Processing (Async, non-blocking)
    enqueueAIProcessing(db, newItem);

    // 4. Navigate back immediately
    router.back();
  };

  return (
    <View className="flex-1 bg-background">
      <AppHeader title="Add Knowledge" />
      
      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        
        {/* URL Input */}
        <View className="mb-6">
          <View className="flex-row items-center mb-2">
            <Link2 color="#94A3B8" size={18} />
            <Text className="text-textSecondary font-inter text-sm font-medium ml-2">Source URL (Optional)</Text>
          </View>
          <TextInput
            value={url}
            onChangeText={setUrl}
            placeholder="https://..."
            placeholderTextColor="#475569"
            className="bg-surface text-textPrimary font-inter text-base px-4 py-3 rounded-xl border border-border"
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>

        {/* Notes Input */}
        <View className="mb-6">
          <View className="flex-row items-center mb-2">
            <AlignLeft color="#94A3B8" size={18} />
            <Text className="text-textSecondary font-inter text-sm font-medium ml-2">Notes (Optional)</Text>
          </View>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Write your thoughts..."
            placeholderTextColor="#475569"
            className="bg-surface text-textPrimary font-inter text-base px-4 py-3 rounded-xl border border-border h-32"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Reason Saved (Mandatory) */}
        <View className="mb-8">
          <View className="flex-row items-center mb-2">
            <HelpCircle color="#4F46E5" size={18} />
            <Text className="text-primary font-inter text-sm font-bold ml-2">Why are you saving this? *</Text>
          </View>
          <TextInput
            value={reasonSaved}
            onChangeText={setReasonSaved}
            placeholder="e.g. Portfolio inspiration, future project idea..."
            placeholderTextColor="#475569"
            className="bg-surface text-textPrimary font-inter text-base px-4 py-3 rounded-xl border border-primary/50"
            multiline
          />
          <Text className="text-textSecondary font-inter text-xs mt-2">
            Required. This context helps the AI extract the most relevant insights for you.
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={isSubmitting}
          className={`py-4 rounded-xl items-center ${isSubmitting ? 'bg-primary/50' : 'bg-primary'}`}
        >
          <Text className="text-white font-outfit font-bold text-lg">
            {isSubmitting ? 'Saving...' : 'Save Knowledge'}
          </Text>
        </TouchableOpacity>

        <View className="h-20" />
      </ScrollView>
    </View>
  );
}
