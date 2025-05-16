
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { supabase, logSupabaseError } from '../supabase/client';
import { ThemeType, ThemeInfo, Question } from '../types/assessment';
import { useAuthStore } from './authStore';

// Define the answer type
export interface Answer {
  questionId: string;
  selectedOption: number; // Index of the selected option
}

// Define the assessment result type
export interface AssessmentResult {
  theme: ThemeType;
  score: number; // 0-100 score
  status: 'normal' | 'mild' | 'moderate' | 'severe';
}

// Define the assessment store state
interface AssessmentState {
  currentThemeIndex: number;
  currentQuestionIndex: number;
  answers: Answer[];
  language: 'en' | 'nl';
  isCompleted: boolean;
  results: AssessmentResult[];
  themes: ThemeInfo[];
  questions: Question[];
  currentAssessmentId: string | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchThemes: () => Promise<void>;
  fetchQuestions: () => Promise<void>;
  startAssessment: () => Promise<void>;
  answerQuestion: (questionId: string, optionIndex: number) => Promise<void>;
  nextQuestion: () => void;
  nextTheme: () => void;
  completeAssessment: () => Promise<void>;
  resetAssessment: () => void;
  setLanguage: (language: 'en' | 'nl') => void;
  fetchResults: () => Promise<void>;
  
  // Selectors
  getCurrentTheme: () => ThemeInfo | undefined;
  getCurrentQuestion: () => Question | undefined;
  getThemeQuestions: (theme: ThemeType) => Question[];
  getThemeAnswers: (theme: ThemeType) => Answer[];
}

// Create the assessment store
export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      currentThemeIndex: 0,
      currentQuestionIndex: 0,
      answers: [],
      language: 'en',
      isCompleted: false,
      results: [],
      themes: [],
      questions: [],
      currentAssessmentId: null,
      isLoading: false,
      error: null,
      
      // Fetch themes from Supabase
      fetchThemes: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase
            .from('themes')
            .select('*')
            .order('id');
            
          if (error) {
            throw error;
          }
          
          if (data) {
            const themes: ThemeInfo[] = data.map(theme => ({
              id: theme.id as ThemeType,
              title: theme.title,
              description: theme.description,
              icon: theme.icon,
              color: theme.color,
              tips: theme.tips,
            }));
            
            set({ themes, isLoading: false });
          }
        } catch (error: any) {
          set({ 
            error: logSupabaseError(error, 'fetch themes'), 
            isLoading: false 
          });
        }
      },
      
      // Fetch questions from Supabase
      fetchQuestions: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase
            .from('questions')
            .select('*')
            .order('id');
            
          if (error) {
            throw error;
          }
          
          if (data) {
            // Map database fields to app model
            const questions: Question[] = data.map(question => ({
              id: question.id,
              theme: question.theme_id as ThemeType, // Using theme_id from DB
              text: question.text,
              options: question.options,
            }));
            
            set({ questions, isLoading: false });
          }
        } catch (error: any) {
          set({ 
            error: logSupabaseError(error, 'fetch questions'), 
            isLoading: false 
          });
        }
      },
      
      // Start a new assessment
      startAssessment: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const { user } = useAuthStore.getState();
          
          if (!user) {
            throw new Error('User not authenticated');
          }
          
          // Create a new assessment in the database
          const { data, error } = await supabase
            .from('assessments')
            .insert({
              user_id: user.id,
              completed: false,
            })
            .select()
            .single();
            
          if (error) {
            throw error;
          }
          
          if (data) {
            set({
              currentAssessmentId: data.id,
              currentThemeIndex: 0,
              currentQuestionIndex: 0,
              answers: [],
              isCompleted: false,
              results: [],
              isLoading: false,
            });
          }
        } catch (error: any) {
          set({ 
            error: logSupabaseError(error, 'start assessment'), 
            isLoading: false 
          });
        }
      },
      
      // Answer a question
      answerQuestion: async (questionId: string, optionIndex: number) => {
        const state = get();
        
        if (!state.currentAssessmentId) {
          console.error('No active assessment');
          return;
        }
        
        // Update local state first for immediate UI feedback
        const existingAnswerIndex = state.answers.findIndex(a => a.questionId === questionId);
        
        if (existingAnswerIndex >= 0) {
          // Update existing answer
          const updatedAnswers = [...state.answers];
          updatedAnswers[existingAnswerIndex] = {
            questionId,
            selectedOption: optionIndex,
          };
          set({ answers: updatedAnswers });
        } else {
          // Add new answer
          set({
            answers: [
              ...state.answers,
              {
                questionId,
                selectedOption: optionIndex,
              },
            ],
          });
        }
        
        // Save to Supabase
        try {
          const { error } = await supabase
            .from('answers')
            .upsert({
              assessment_id: state.currentAssessmentId,
              question_id: questionId,
              selected_option: optionIndex,
            }, {
              onConflict: 'assessment_id,question_id',
            });
            
          if (error) {
            console.error('Error saving answer:', error);
          }
        } catch (error: any) {
          console.error('Error saving answer:', error);
        }
      },
      
      // Move to the next question
      nextQuestion: () => {
        const state = get();
        const themeQuestions = state.getThemeQuestions(state.getCurrentTheme()?.id as ThemeType);
        
        if (state.currentQuestionIndex < themeQuestions.length - 1) {
          set({ currentQuestionIndex: state.currentQuestionIndex + 1 });
        } else {
          // Move to next theme if we're at the last question
          state.nextTheme();
        }
      },
      
      // Move to the next theme
      nextTheme: () => {
        const state = get();
        
        if (state.currentThemeIndex < state.themes.length - 1) {
          set({
            currentThemeIndex: state.currentThemeIndex + 1,
            currentQuestionIndex: 0,
          });
        } else {
          // Complete assessment if we're at the last theme
          state.completeAssessment();
        }
      },
      
      // Complete the assessment and calculate results
      completeAssessment: async () => {
        const state = get();
        
        if (!state.currentAssessmentId) {
          console.error('No active assessment');
          return;
        }
        
        set({ isLoading: true });
        
        try {
          // Calculate results for each theme
          const results: AssessmentResult[] = [];
          
          for (const theme of state.themes) {
            const themeAnswers = state.getThemeAnswers(theme.id);
            const themeQuestions = state.getThemeQuestions(theme.id);
            
            if (themeAnswers.length === 0) continue;
            
            // Calculate average score (0-4 scale from options)
            const totalScore = themeAnswers.reduce((sum, answer) => {
              return sum + answer.selectedOption;
            }, 0);
            
            const avgScore = totalScore / themeAnswers.length;
            const normalizedScore = (avgScore / 4) * 100; // Convert to 0-100 scale
            const score = Math.round(normalizedScore);
            
            // Determine status based on score
            let status: 'normal' | 'mild' | 'moderate' | 'severe';
            if (normalizedScore >= 75) {
              status = 'normal';
            } else if (normalizedScore >= 50) {
              status = 'mild';
            } else if (normalizedScore >= 25) {
              status = 'moderate';
            } else {
              status = 'severe';
            }
            
            results.push({
              theme: theme.id,
              score,
              status,
            });
            
            // Save result to Supabase
            await supabase
              .from('results')
              .upsert({
                assessment_id: state.currentAssessmentId,
                theme_id: theme.id,
                score,
                status,
              }, {
                onConflict: 'assessment_id,theme_id',
              });
          }
          
          // Mark assessment as completed
          await supabase
            .from('assessments')
            .update({
              completed: true,
              completed_at: new Date().toISOString(),
            })
            .eq('id', state.currentAssessmentId);
          
          set({
            results,
            isCompleted: true,
            isLoading: false,
          });
        } catch (error: any) {
          set({ 
            error: logSupabaseError(error, 'complete assessment'), 
            isLoading: false 
          });
        }
      },
      
      // Reset the assessment
      resetAssessment: () => {
        set({
          currentThemeIndex: 0,
          currentQuestionIndex: 0,
          answers: [],
          isCompleted: false,
          results: [],
          currentAssessmentId: null,
        });
      },
      
      // Set the language
      setLanguage: (language: 'en' | 'nl') => {
        set({ language });
      },
      
      // Fetch previous assessment results
      fetchResults: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const { user } = useAuthStore.getState();
          
          if (!user) {
            throw new Error('User not authenticated');
          }
          
          // Find the most recent completed assessment
          const { data: assessmentData, error: assessmentError } = await supabase
            .from('assessments')
            .select('*')
            .eq('user_id', user.id)
            .eq('completed', true)
            .order('completed_at', { ascending: false })
            .limit(1)
            .single();
            
          if (assessmentError) {
            if (assessmentError.code === 'PGRST116') {
              // No results found
              set({ isLoading: false });
              return;
            }
            throw assessmentError;
          }
          
          if (assessmentData) {
            // Fetch results for this assessment
            const { data: resultsData, error: resultsError } = await supabase
              .from('results')
              .select('*')
              .eq('assessment_id', assessmentData.id);
              
            if (resultsError) {
              throw resultsError;
            }
            
            if (resultsData) {
              const results: AssessmentResult[] = resultsData.map(result => ({
                theme: result.theme_id as ThemeType,
                score: result.score,
                status: result.status as 'normal' | 'mild' | 'moderate' | 'severe',
              }));
              
              set({
                results,
                isCompleted: true,
                currentAssessmentId: assessmentData.id,
                isLoading: false,
              });
            }
          }
        } catch (error: any) {
          set({ 
            error: logSupabaseError(error, 'fetch results'), 
            isLoading: false 
          });
        }
      },
      
      // Get the current theme
      getCurrentTheme: () => {
        const state = get();
        return state.themes[state.currentThemeIndex];
      },
      
      // Get the current question
      getCurrentQuestion: () => {
        const state = get();
        const themeQuestions = state.getThemeQuestions(state.getCurrentTheme()?.id as ThemeType);
        return themeQuestions[state.currentQuestionIndex];
      },
      
      // Get questions for a specific theme
      getThemeQuestions: (theme: ThemeType) => {
        const state = get();
        return state.questions.filter(q => q.theme === theme);
      },
      
      // Get answers for a specific theme
      getThemeAnswers: (theme: ThemeType) => {
        const state = get();
        const themeQuestions = state.getThemeQuestions(theme);
        return state.answers.filter(a => 
          themeQuestions.some(q => q.id === a.questionId)
        );
      },
    }),
    {
      name: 'trias-assessment-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
