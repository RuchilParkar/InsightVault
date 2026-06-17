import React from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  autoFocus?: boolean;
}

export function SearchBar({ 
  value, 
  onChangeText, 
  placeholder = "Search knowledge...", 
  onClear,
  autoFocus = false
}: SearchBarProps) {
  return (
    <View className="flex-row items-center bg-surface rounded-xl px-4 py-3 border border-border">
      <Search color="#94A3B8" size={20} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94A3B8"
        className="flex-1 ml-3 text-textPrimary font-inter text-base"
        autoFocus={autoFocus}
        returnKeyType="search"
      />
      {value.length > 0 && onClear && (
        <TouchableOpacity onPress={onClear} className="p-1" accessibilityRole="button" accessibilityLabel="Clear search">
          <X color="#94A3B8" size={18} />
        </TouchableOpacity>
      )}
    </View>
  );
}
