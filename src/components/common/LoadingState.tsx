import React from 'react';
import { View, ActivityIndicator } from 'react-native';

export function LoadingState() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <ActivityIndicator size="large" color="#4F46E5" />
    </View>
  );
}
