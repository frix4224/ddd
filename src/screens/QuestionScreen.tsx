
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  StatusBar,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAssessmentStore } from '../store/assessmentStore';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

const QuestionScreen = ({ navigation }) => {
  const { 
    getCurrentTheme, 
    getCurrentQuestion, 
    answerQuestion, 
    nextQuestion,
    language,
    questions,
    themes,
  } = useAssessmentStore();
  
  const currentTheme = getCurrentTheme();
  const currentQuestion = getCurrentQuestion();
  
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const fadeAnim = new Animated.Value(0);
  
  useEffect(() => {
    // Reset selection and animate when question changes
    setSelectedOption(null);
    fadeAnim.setValue(0);
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [currentQuestion?.id]);
  
  // Debug logging
  useEffect(() => {
    console.log('Themes loaded:', themes.length);
    console.log('Questions loaded:', questions.length);
    console.log('Current theme:', currentTheme);
    console.log('Current question:', currentQuestion);
  }, [themes.length, questions.length, currentTheme, currentQuestion]);
  
  if (!currentTheme || !currentQuestion) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {language === 'en' 
              ? 'No questions available. Please try again later.' 
              : 'Geen vragen beschikbaar. Probeer het later opnieuw.'}
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.backButtonText}>
              {language === 'en' ? 'Back to Home' : 'Terug naar Home'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  const handleSelectOption = (optionIndex: number) => {
    setSelectedOption(optionIndex);
    
    // Save the answer
    answerQuestion(currentQuestion.id, optionIndex);
    
    // Automatically proceed to next question after a short delay
    setTimeout(() => {
      nextQuestion();
    }, 500);
  };
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}
        >
          <Feather name="x" size={24} color={COLORS.text} />
        </TouchableOpacity>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: currentTheme.color,
                  width: '50%', // This would be dynamic based on progress
                }
              ]} 
            />
          </View>
        </View>
      </View>
      
      <View style={styles.themeIndicator}>
        <View style={[styles.themeIcon, { backgroundColor: currentTheme.color }]}>
          <Feather name={currentTheme.icon as any} size={16} color="#FFFFFF" />
        </View>
        <Text style={styles.themeName}>{currentTheme.title[language]}</Text>
      </View>
      
      <Animated.View 
        style={[
          styles.questionContainer,
          { opacity: fadeAnim }
        ]}
      >
        <Text style={styles.questionText}>
          {currentQuestion.text[language]}
        </Text>
        
        <View style={styles.optionsContainer}>
          {currentQuestion.options[language].map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedOption === index && { 
                  backgroundColor: currentTheme.color,
                  borderColor: currentTheme.color,
                }
              ]}
              onPress={() => handleSelectOption(index)}
              disabled={selectedOption !== null}
            >
              <Text 
                style={[
                  styles.optionText,
                  selectedOption === index && { color: '#FFFFFF' }
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 16,
  },
  progressContainer: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  themeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  themeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  themeName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  questionText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 32,
    lineHeight: 30,
  },
  optionsContainer: {
    flex: 1,
  },
  optionButton: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: COLORS.card,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.text,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 18,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default QuestionScreen;
