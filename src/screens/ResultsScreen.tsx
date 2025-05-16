
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAssessmentStore } from '../store/assessmentStore';
import { COLORS } from '../constants/colors';
import { generatePdfReport, openPdfUrl } from '../services/reportService';

const { width } = Dimensions.get('window');

const ResultsScreen = ({ navigation }) => {
  const { results, language, resetAssessment, currentAssessmentId, themes } = useAssessmentStore();
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  const getStatusLabel = (status: string) => {
    const statusLabels = {
      normal: {
        en: 'Normal',
        nl: 'Normaal',
      },
      mild: {
        en: 'Mild Concern',
        nl: 'Lichte Zorg',
      },
      moderate: {
        en: 'Moderate Concern',
        nl: 'Matige Zorg',
      },
      severe: {
        en: 'Significant Concern',
        nl: 'Aanzienlijke Zorg',
      },
    };
    
    return statusLabels[status]?.[language] || status;
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return COLORS.success;
      case 'mild':
        return COLORS.info;
      case 'moderate':
        return COLORS.warning;
      case 'severe':
        return COLORS.error;
      default:
        return COLORS.textLight;
    }
  };
  
  const getThemeById = (themeId: string) => {
    return themes.find(theme => theme.id === themeId);
  };
  
  const handleStartNewAssessment = () => {
    resetAssessment();
    navigation.navigate('Home');
  };
  
  const handleGeneratePdf = async () => {
    if (!currentAssessmentId) {
      Alert.alert(
        language === 'en' ? 'Error' : 'Fout',
        language === 'en' 
          ? 'Assessment ID not found. Please try again.' 
          : 'Beoordelings-ID niet gevonden. Probeer het opnieuw.'
      );
      return;
    }
    
    setIsGeneratingPdf(true);
    
    try {
      // In Expo Snack, we're using a simulated PDF generation
      const { success, url, error } = await generatePdfReport(currentAssessmentId, language);
      
      if (!success || !url) {
        throw new Error(error || 'Failed to generate PDF');
      }
      
      // Show a message about the simulation in Expo Snack
      if (Platform.OS === 'web') {
        Alert.alert(
          language === 'en' ? 'PDF Report' : 'PDF Rapport',
          language === 'en'
            ? 'In this demo environment, we\'re simulating PDF generation. In a production app, this would generate and open a real PDF report.'
            : 'In deze demo-omgeving simuleren we PDF-generatie. In een productie-app zou dit een echt PDF-rapport genereren en openen.'
        );
      }
      
      // Open the PDF URL
      openPdfUrl(url);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      Alert.alert(
        language === 'en' ? 'Error' : 'Fout',
        language === 'en'
          ? 'Failed to generate PDF report. Please try again.'
          : 'Kan PDF-rapport niet genereren. Probeer het opnieuw.'
      );
    } finally {
      setIsGeneratingPdf(false);
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
        <Text style={styles.headerTitle}>
          {language === 'en' ? 'Assessment Results' : 'Beoordelingsresultaten'}
        </Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>
            {language === 'en' ? 'Overall Summary' : 'Algemene Samenvatting'}
          </Text>
          <Text style={styles.summaryText}>
            {language === 'en' 
              ? 'Based on your responses, here\'s an overview of your child\'s development in key areas.'
              : 'Op basis van uw antwoorden, hier is een overzicht van de ontwikkeling van uw kind in belangrijke gebieden.'}
          </Text>
          
          <TouchableOpacity 
            style={styles.pdfButton}
            onPress={handleGeneratePdf}
            disabled={isGeneratingPdf}
          >
            {isGeneratingPdf ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Feather name="file-text" size={18} color="#FFFFFF" style={styles.pdfIcon} />
                <Text style={styles.pdfButtonText}>
                  {language === 'en' ? 'Download PDF Report' : 'Download PDF-rapport'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        {results.map((result) => {
          const theme = getThemeById(result.theme);
          if (!theme) return null;
          
          return (
            <View key={result.theme} style={styles.resultCard}>
              <View style={styles.resultHeader}>
                <View style={[styles.themeIcon, { backgroundColor: theme.color }]}>
                  <Feather name={theme.icon as any} size={20} color="#FFFFFF" />
                </View>
                <View style={styles.resultHeaderText}>
                  <Text style={styles.themeTitle}>{theme.title[language]}</Text>
                  <View style={styles.statusContainer}>
                    <View 
                      style={[
                        styles.statusIndicator, 
                        { backgroundColor: getStatusColor(result.status) }
                      ]} 
                    />
                    <Text style={styles.statusText}>
                      {getStatusLabel(result.status)}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.scoreContainer}>
                <View style={styles.scoreBar}>
                  <View 
                    style={[
                      styles.scoreFill, 
                      { 
                        width: `${result.score}%`,
                        backgroundColor: getStatusColor(result.status),
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.scoreText}>{result.score}%</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.infoButton}
                onPress={() => navigation.navigate('ThemeInfo', { themeId: result.theme })}
              >
                <Text style={styles.infoButtonText}>
                  {language === 'en' ? 'View Tips & Information' : 'Bekijk Tips & Informatie'}
                </Text>
                <Feather name="chevron-right" size={16} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          );
        })}
        
        <View style={styles.disclaimerContainer}>
          <Feather name="info" size={20} color={COLORS.textLight} style={styles.disclaimerIcon} />
          <Text style={styles.disclaimerText}>
            {language === 'en'
              ? 'This assessment is not a diagnostic tool. If you have concerns about your child\'s development, please consult a healthcare professional.'
              : 'Deze beoordeling is geen diagnostisch hulpmiddel. Als u zorgen heeft over de ontwikkeling van uw kind, raadpleeg dan een zorgprofessional.'}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.newAssessmentButton}
          onPress={handleStartNewAssessment}
        >
          <Text style={styles.newAssessmentButtonText}>
            {language === 'en' ? 'Start New Assessment' : 'Start Nieuwe Beoordeling'}
          </Text>
        </TouchableOpacity>
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
    padding: 24,
    paddingBottom: 40,
  },
  summaryCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 16,
    color: COLORS.textLight,
    lineHeight: 24,
    marginBottom: 20,
  },
  pdfButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pdfIcon: {
    marginRight: 8,
  },
  pdfButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  resultCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  themeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  resultHeaderText: {
    flex: 1,
  },
  themeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    borderRadius: 4,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    width: 40,
    textAlign: 'right',
  },
  infoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
  },
  infoButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
  },
  disclaimerContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 24,
  },
  disclaimerIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
  },
  newAssessmentButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  newAssessmentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ResultsScreen;
