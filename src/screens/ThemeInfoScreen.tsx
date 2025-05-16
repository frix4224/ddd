
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAssessmentStore } from '../store/assessmentStore';
import { COLORS } from '../constants/colors';
import { themes } from '../mocks/questions';

const ThemeInfoScreen = ({ route, navigation }) => {
  const { themeId } = route.params;
  const { language } = useAssessmentStore();
  
  const theme = themes.find(t => t.id === themeId);
  
  if (!theme) {
    return null;
  }
  
  const getImageForTheme = () => {
    switch (themeId) {
      case 'general':
        return 'https://magically.life/api/media/image?query=happy%20healthy%20child%20playing%20outdoors%20in%20sunlight';
      case 'cognitive':
        return 'https://magically.life/api/media/image?query=child%20focused%20on%20solving%20puzzle%20or%20reading%20book';
      case 'physical':
        return 'https://magically.life/api/media/image?query=child%20playing%20sports%20or%20physical%20activity%20outdoors';
      case 'socialEmotional':
        return 'https://magically.life/api/media/image?query=children%20playing%20together%20and%20sharing%20toys';
      default:
        return 'https://magically.life/api/media/image?query=happy%20child%20development%20milestone';
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Feather name="arrow-left" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{theme.title[language]}</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: getImageForTheme() }}
            style={styles.themeImage}
            resizeMode="cover"
          />
          <View style={[styles.iconOverlay, { backgroundColor: theme.color }]}>
            <Feather name={theme.icon as any} size={32} color="#FFFFFF" />
          </View>
        </View>
        
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>
            {language === 'en' ? 'About This Area' : 'Over Dit Gebied'}
          </Text>
          <Text style={styles.descriptionText}>
            {theme.description[language]}
          </Text>
        </View>
        
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>
            {language === 'en' ? 'Tips for Parents' : 'Tips voor Ouders'}
          </Text>
          
          {theme.tips[language].map((tip, index) => (
            <View key={index} style={styles.tipItem}>
              <View style={[styles.tipNumber, { backgroundColor: theme.color }]}>
                <Text style={styles.tipNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.resourcesSection}>
          <Text style={styles.sectionTitle}>
            {language === 'en' ? 'Additional Resources' : 'Aanvullende Bronnen'}
          </Text>
          
          <TouchableOpacity style={styles.resourceItem}>
            <Feather name="book-open" size={20} color={COLORS.primary} style={styles.resourceIcon} />
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>
                {language === 'en' ? 'Child Development Guide' : 'Gids voor Kinderontwikkeling'}
              </Text>
              <Text style={styles.resourceDescription}>
                {language === 'en' 
                  ? 'Comprehensive guide to child development milestones'
                  : 'Uitgebreide gids voor mijlpalen in de kinderontwikkeling'}
              </Text>
            </View>
            <Feather name="external-link" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.resourceItem}>
            <Feather name="video" size={20} color={COLORS.primary} style={styles.resourceIcon} />
            <View style={styles.resourceContent}>
              <Text style={styles.resourceTitle}>
                {language === 'en' ? 'Expert Video Series' : 'Expert Videoserie'}
              </Text>
              <Text style={styles.resourceDescription}>
                {language === 'en'
                  ? 'Watch videos from child development experts'
                  : 'Bekijk video\'s van experts in kinderontwikkeling'}
              </Text>
            </View>
            <Feather name="external-link" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  imageContainer: {
    height: 200,
    position: 'relative',
  },
  themeImage: {
    width: '100%',
    height: '100%',
  },
  iconOverlay: {
    position: 'absolute',
    bottom: -25,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  infoSection: {
    padding: 24,
    paddingTop: 40,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: COLORS.textLight,
    lineHeight: 24,
  },
  tipsSection: {
    padding: 24,
    paddingTop: 0,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tipNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    marginTop: 2,
  },
  tipNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tipText: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 24,
  },
  resourcesSection: {
    padding: 24,
    paddingTop: 0,
  },
  resourceItem: {
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
  resourceIcon: {
    marginRight: 16,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: COLORS.textLight,
  },
});

export default ThemeInfoScreen;
