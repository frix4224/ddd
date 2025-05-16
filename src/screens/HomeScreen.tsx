
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { useAssessmentStore } from '../store/assessmentStore';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user, logout } = useAuthStore();
  const { 
    startAssessment, 
    language, 
    setLanguage, 
    isCompleted, 
    results,
    themes,
    fetchThemes,
    fetchQuestions,
    fetchResults,
    isLoading,
    error,
  } = useAssessmentStore();
  
  useEffect(() => {
    // Fetch data when the component mounts
    const loadData = async () => {
      try {
        await fetchThemes();
        await fetchQuestions();
        await fetchResults();
        
        // Log data for debugging
        console.log('Data loaded successfully');
      } catch (err) {
        console.error('Error loading data:', err);
        Alert.alert(
          'Error',
          'Failed to load data. Please try again.',
          [{ text: 'OK' }]
        );
      }
    };
    
    loadData();
  }, []);
  
  const handleStartAssessment = async () => {
    await startAssessment();
    navigation.navigate('ThemeIntro');
  };
  
  const handleViewResults = () => {
    navigation.navigate('Results');
  };
  
  const handleToggleLanguage = () => {
    setLanguage(language === 'en' ? 'nl' : 'en');
  };
  
  if (isLoading && themes.length === 0) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {language === 'en' ? 'Hello' : 'Hallo'}, {user?.name}
          </Text>
          <Text style={styles.subtitle}>
            {language === 'en' ? 'Welcome to Trias Development' : 'Welkom bij Trias Ontwikkeling'}
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.languageButton}
            onPress={handleToggleLanguage}
          >
            <Text style={styles.languageText}>{language === 'en' ? 'NL' : 'EN'}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={logout}
          >
            <Feather name="log-out" size={20} color={COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroContainer}>
          <Image 
            source={{ uri: 'https://magically.life/api/media/image?query=happy%20diverse%20children%20playing%20and%20learning%20together%20with%20toys%20in%20a%20bright%20colorful%20room' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>
              {language === 'en' 
                ? 'Track Your Child\'s Development' 
                : 'Volg de Ontwikkeling van Uw Kind'}
            </Text>
            <Text style={styles.heroSubtitle}>
              {language === 'en'
                ? 'Simple assessment across four key areas'
                : 'Eenvoudige beoordeling op vier belangrijke gebieden'}
            </Text>
          </View>
        </View>
        
        <View style={styles.actionCard}>
          <Text style={styles.actionTitle}>
            {language === 'en' 
              ? 'Ready to start the assessment?' 
              : 'Klaar om de beoordeling te starten?'}
          </Text>
          <Text style={styles.actionDescription}>
            {language === 'en'
              ? 'This assessment will help you understand your child\'s development across four key areas.'
              : 'Deze beoordeling helpt u de ontwikkeling van uw kind te begrijpen op vier belangrijke gebieden.'}
          </Text>
          <TouchableOpacity 
            style={styles.startButton}
            onPress={handleStartAssessment}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.startButtonText}>
                  {language === 'en' ? 'Start Assessment' : 'Start Beoordeling'}
                </Text>
                <Feather name="arrow-right" size={20} color="#FFFFFF" />
              </>
            )}
          </TouchableOpacity>
          
          {isCompleted && (
            <TouchableOpacity 
              style={styles.resultsButton}
              onPress={handleViewResults}
            >
              <Text style={styles.resultsButtonText}>
                {language === 'en' ? 'View Previous Results' : 'Bekijk Vorige Resultaten'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        
        <Text style={styles.sectionTitle}>
          {language === 'en' ? 'Development Areas' : 'Ontwikkelingsgebieden'}
        </Text>
        
        <View style={styles.themesContainer}>
          {themes.map((theme) => (
            <TouchableOpacity 
              key={theme.id}
              style={styles.themeCard}
              onPress={() => navigation.navigate('ThemeInfo', { themeId: theme.id })}
            >
              <View style={[styles.themeIcon, { backgroundColor: theme.color }]}>
                <Feather name={theme.icon as any} size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.themeTitle}>{theme.title[language]}</Text>
              <Feather name="chevron-right" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textLight,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 12,
  },
  languageText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  logoutButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroContainer: {
    height: 200,
    marginHorizontal: 24,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  actionCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  actionDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 24,
    lineHeight: 20,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginBottom: 12,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  resultsButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  resultsButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginHorizontal: 24,
    marginBottom: 16,
  },
  themesContainer: {
    paddingHorizontal: 24,
  },
  themeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  themeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  themeTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
  },
});

export default HomeScreen;
