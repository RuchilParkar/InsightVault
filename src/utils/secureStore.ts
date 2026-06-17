import * as SecureStore from 'expo-secure-store';

const API_KEY_KEY = 'GEMINI_API_KEY';

export async function saveApiKey(key: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(API_KEY_KEY, key);
  } catch (error) {
    console.error('Error saving API key securely:', error);
    throw error;
  }
}

export async function getApiKey(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(API_KEY_KEY);
  } catch (error) {
    console.error('Error getting API key securely:', error);
    return null;
  }
}

export async function deleteApiKey(): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(API_KEY_KEY);
  } catch (error) {
    console.error('Error deleting API key securely:', error);
    throw error;
  }
}
