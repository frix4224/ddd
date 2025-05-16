
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://gumfzpyevfyyubkvfxvo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1bWZ6cHlldmZ5eXVia3ZmeHZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU3MTU5MjAsImV4cCI6MjA2MTI5MTkyMH0.jy7AWjvXlr2VUvQGIUZHtGSwEcGGTc5r6Bt2RwWCxZM';

// Create a custom storage object that implements the Storage interface
const ExpoSecureStorage = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error('Error getting item from AsyncStorage:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('Error setting item in AsyncStorage:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from AsyncStorage:', error);
    }
  },
};

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    // Add headers for better compatibility in Expo Snack
    headers: {
      'X-Client-Info': 'expo-snack-react-native',
    },
  },
});

// Helper function to log errors
export const logSupabaseError = (error: any, operation: string) => {
  console.error(`Supabase ${operation} error:`, error.message);
  return error.message;
};
