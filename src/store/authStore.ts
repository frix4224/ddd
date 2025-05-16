
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase, logSupabaseError } from '../supabase/client';

// Define the user type
export interface User {
  id: string;
  email: string;
  name: string;
}

// Define the auth store state
interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

// Create the auth store
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      
      // Login action
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          
          if (error) {
            throw error;
          }
          
          if (data?.user) {
            // Fetch user profile data
            const { data: profileData, error: profileError } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();
              
            if (profileError) {
              console.error('Error fetching user profile:', profileError);
            }
            
            const user: User = {
              id: data.user.id,
              email: data.user.email || '',
              name: profileData?.name || 'User',
            };
            
            set({ user, isAuthenticated: true, isLoading: false });
          }
        } catch (error: any) {
          set({ error: logSupabaseError(error, 'login'), isLoading: false });
        }
      },
      
      // Signup action
      signup: async (email: string, password: string, name: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name,
              },
            },
          });
          
          if (error) {
            throw error;
          }
          
          if (data?.user) {
            // Check if email confirmation is required
            if (data.session === null) {
              set({ 
                error: 'Please check your email for a confirmation link', 
                isLoading: false 
              });
            } else {
              const user: User = {
                id: data.user.id,
                email: data.user.email || '',
                name: name,
              };
              
              set({ user, isAuthenticated: true, isLoading: false });
            }
          }
        } catch (error: any) {
          set({ error: logSupabaseError(error, 'signup'), isLoading: false });
        }
      },
      
      // Logout action
      logout: async () => {
        set({ isLoading: true });
        
        try {
          const { error } = await supabase.auth.signOut();
          
          if (error) {
            throw error;
          }
          
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error: any) {
          set({ 
            error: logSupabaseError(error, 'logout'), 
            isLoading: false 
          });
        }
      },
      
      // Clear error action
      clearError: () => {
        set({ error: null });
      },
      
      // Reset password action
      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: 'https://trias-development.com/reset-password',
          });
          
          if (error) {
            throw error;
          }
          
          set({ 
            isLoading: false, 
            error: 'Password reset link sent to your email' 
          });
        } catch (error: any) {
          set({ 
            error: logSupabaseError(error, 'reset password'), 
            isLoading: false 
          });
        }
      },
      
      // Update password action
      updatePassword: async (password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const { error } = await supabase.auth.updateUser({
            password,
          });
          
          if (error) {
            throw error;
          }
          
          set({ isLoading: false });
        } catch (error: any) {
          set({ 
            error: logSupabaseError(error, 'update password'), 
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'trias-auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

// Set up auth state listener
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session?.user) {
    // Fetch user profile data
    supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }
        
        if (data) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: data.name || 'User',
          };
          
          // Update the auth store
          useAuthStore.setState({ 
            user, 
            isAuthenticated: true, 
            isLoading: false 
          });
        }
      });
  } else if (event === 'SIGNED_OUT') {
    useAuthStore.setState({ 
      user: null, 
      isAuthenticated: false 
    });
  }
});
