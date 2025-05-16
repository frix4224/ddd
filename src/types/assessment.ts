
// Define the theme type
export type ThemeType = 'general' | 'cognitive' | 'physical' | 'socialEmotional';

// Define the question interface
export interface Question {
  id: string;
  theme: ThemeType;
  text: {
    en: string;
    nl: string;
  };
  options: {
    en: string[];
    nl: string[];
  };
}

// Define the theme info interface
export interface ThemeInfo {
  id: ThemeType;
  title: {
    en: string;
    nl: string;
  };
  description: {
    en: string;
    nl: string;
  };
  icon: string; // Icon name from Feather icons
  color: string;
  tips: {
    en: string[];
    nl: string[];
  };
}
