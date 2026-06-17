import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { AppHeader } from '../../src/components/common/AppHeader';
import { Key, Download, Upload, Palette, Info, ChevronRight, CheckCircle, Database } from 'lucide-react-native';
import { getApiKey, saveApiKey } from '../../src/utils/secureStore';
import { exportDatabaseToJSON, importDatabaseFromJSON } from '../../src/services/backup';
import { useSQLiteContext } from 'expo-sqlite';
import { useKnowledgeStore } from '../../src/store/useKnowledgeStore';
import * as DocumentPicker from 'expo-document-picker';
import { logger } from '../../src/utils/logger';

interface SettingItemProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

function SettingItem({ icon, title, subtitle, onPress }: SettingItemProps) {
  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={onPress}
      className="flex-row items-center justify-between p-4 bg-surface rounded-xl border border-border mb-3"
    >
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 rounded-full bg-background items-center justify-center mr-3 border border-border">
          {icon}
        </View>
        <View className="flex-1">
          <Text className="text-textPrimary font-inter text-base font-medium">{title}</Text>
          {subtitle && (
            <Text className="text-textSecondary font-inter text-xs mt-0.5">{subtitle}</Text>
          )}
        </View>
      </View>
      <ChevronRight color="#94A3B8" size={20} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const { items } = useKnowledgeStore();
  const [hasKey, setHasKey] = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    checkKey();
  }, []);

  const checkKey = async () => {
    const key = await getApiKey();
    setHasKey(!!key);
  };

  const handleSaveKey = async () => {
    if (tempKey.trim()) {
      await saveApiKey(tempKey.trim());
      setHasKey(true);
      setIsEditingKey(false);
      setTempKey('');
      Alert.alert('Success', 'API Key saved securely.');
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    const uri = await exportDatabaseToJSON(db);
    setIsExporting(false);
    if (uri) {
      Alert.alert('Export Successful', `Backup saved to: \n${uri}`);
    } else {
      Alert.alert('Export Failed', 'An error occurred during export. Check logs.');
    }
  };

  const handleImport = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        Alert.alert(
          'Confirm Import',
          'Importing will replace all current data. Do you want to proceed?',
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Import', 
              style: 'destructive',
              onPress: async () => {
                const success = await importDatabaseFromJSON(db, result.assets[0].uri);
                if (success) {
                  Alert.alert('Import Successful', 'Please restart the app to apply changes.');
                } else {
                  Alert.alert('Import Failed', 'The backup file is invalid or corrupt.');
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      logger.error('APP', 'Document picker error', error);
    }
  };

  const pendingItemsCount = items.filter(i => i.processingStatus === 'pending' || i.processingStatus === 'failed').length;

  return (
    <View className="flex-1 bg-background">
      <AppHeader title="Settings" />
      
      <ScrollView className="flex-1 px-4 mt-6" showsVerticalScrollIndicator={false}>
        
        {/* API Key Section */}
        <Text className="text-textSecondary font-inter text-xs font-semibold uppercase tracking-wider mb-3 ml-2">
          AI Configuration
        </Text>
        {isEditingKey ? (
          <View className="bg-surface p-4 rounded-xl border border-primary mb-3">
            <Text className="text-textPrimary font-inter text-sm mb-2">Enter Gemini API Key:</Text>
            <TextInput
              value={tempKey}
              onChangeText={setTempKey}
              placeholder="AIzaSy..."
              placeholderTextColor="#475569"
              secureTextEntry
              className="bg-background text-textPrimary font-inter text-base px-4 py-3 rounded-xl border border-border mb-3"
            />
            <View className="flex-row justify-end space-x-3">
              <TouchableOpacity onPress={() => setIsEditingKey(false)} className="px-4 py-2">
                <Text className="text-textSecondary font-inter">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveKey} className="px-4 py-2 bg-primary rounded-lg">
                <Text className="text-white font-inter font-bold">Save Key</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <SettingItem 
            icon={hasKey ? <CheckCircle color="#10B981" size={20} /> : <Key color="#EF4444" size={20} />}
            title="Gemini API Key"
            subtitle={hasKey ? "Key configured securely" : "Missing required API Key"}
            onPress={() => setIsEditingKey(true)}
          />
        )}

        {/* Database Stats Section */}
        <Text className="text-textSecondary font-inter text-xs font-semibold uppercase tracking-wider mt-6 mb-3 ml-2">
          Database Health
        </Text>
        <SettingItem 
          icon={<Database color="#3B82F6" size={20} />}
          title="Storage Statistics"
          subtitle={`${items.length} Total Items (${pendingItemsCount} Pending AI)`}
          onPress={() => {}}
        />

        {/* Data Management Section */}
        <Text className="text-textSecondary font-inter text-xs font-semibold uppercase tracking-wider mt-6 mb-3 ml-2">
          Data Management
        </Text>
        <SettingItem 
          icon={<Download color="#4F46E5" size={20} />}
          title="Export Vault (Backup)"
          subtitle={isExporting ? "Exporting..." : "Save your knowledge as JSON"}
          onPress={handleExport}
        />
        <SettingItem 
          icon={<Upload color="#4F46E5" size={20} />}
          title="Import Backup"
          subtitle="Restore from a JSON file"
          onPress={handleImport}
        />

        <Text className="text-textSecondary font-inter text-xs font-semibold uppercase tracking-wider mt-6 mb-3 ml-2">
          Preferences
        </Text>
        <SettingItem 
          icon={<Palette color="#F59E0B" size={20} />}
          title="Theme"
          subtitle="Currently using Dark Mode"
          onPress={() => {}}
        />

        <Text className="text-textSecondary font-inter text-xs font-semibold uppercase tracking-wider mt-6 mb-3 ml-2">
          About
        </Text>
        <SettingItem 
          icon={<Info color="#94A3B8" size={20} />}
          title="About InsightVault"
          subtitle="Version 1.0.0 • SQLite v1"
          onPress={() => {}}
        />
        
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
