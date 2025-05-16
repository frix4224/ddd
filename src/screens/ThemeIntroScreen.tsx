
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAssessmentStore } from '../store/assessmentStore';
import { COLORS } from '../constants/colors';

const ThemeIntroScreen = ({ navigation }) => {
  const { getCurrentTheme, language } = useAssessmentStore();
  const currentTheme = getCurrentTheme();
  
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.9);
  
  useEffect(() => {
    // Animate the intro screen
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
    
    // Auto-navigate to questions after a delay
    const timer = setTimeout(() => {
      navigation.navigate('Question');
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);
  
  if (!currentTheme) return null;
  
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Feather name="arrow-left" size={24} color={COLORS.text} />
      </TouchableOpacity>
      
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: currentTheme.color }]}>
          <Feather name={currentTheme.icon as any} size={40} color="#FFFFFF" />
        </View>
        
        <Text style={styles.title}>{currentTheme.title[language]}</Text>
        
        <Text style={styles.description}>
          {currentTheme.description[language]}
        </Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    paddingTop: Platform.OS === 'ios' ? 10 : 20,
  },
  backButton: {
    padding: 8,
    marginTop: 8,
    marginLeft: -8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: '80%',
  },
});

export default ThemeIntroScreen;
