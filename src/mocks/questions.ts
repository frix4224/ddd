
// Mock data for development assessment questions

export type ThemeType = 'general' | 'cognitive' | 'physical' | 'socialEmotional';

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

export const themes: ThemeInfo[] = [
  {
    id: 'general',
    title: {
      en: 'General Well-being',
      nl: 'Algemeen Welzijn',
    },
    description: {
      en: 'This section assesses your child\'s overall health, energy levels, and general happiness.',
      nl: 'Dit onderdeel beoordeelt de algemene gezondheid, energieniveau en geluk van uw kind.',
    },
    icon: 'heart',
    color: '#4A90E2',
    tips: {
      en: [
        'Establish consistent daily routines for meals, sleep, and play',
        'Ensure your child gets adequate sleep for their age',
        'Provide a balanced diet with plenty of fruits and vegetables',
      ],
      nl: [
        'Stel consistente dagelijkse routines in voor maaltijden, slaap en spel',
        'Zorg ervoor dat uw kind voldoende slaap krijgt voor zijn/haar leeftijd',
        'Zorg voor een uitgebalanceerd dieet met veel fruit en groenten',
      ],
    },
  },
  {
    id: 'cognitive',
    title: {
      en: 'Cognitive Development',
      nl: 'Cognitieve Ontwikkeling',
    },
    description: {
      en: 'This section evaluates your child\'s thinking, learning, problem-solving, and language skills.',
      nl: 'Dit onderdeel evalueert het denken, leren, probleemoplossend vermogen en taalvaardigheid van uw kind.',
    },
    icon: 'brain',
    color: '#BB6BD9',
    tips: {
      en: [
        'Read to your child daily and discuss the stories',
        'Engage in puzzles and games that encourage problem-solving',
        'Ask open-ended questions to stimulate thinking',
      ],
      nl: [
        'Lees dagelijks voor aan uw kind en bespreek de verhalen',
        'Doe puzzels en spellen die probleemoplossend denken stimuleren',
        'Stel open vragen om het denken te stimuleren',
      ],
    },
  },
  {
    id: 'physical',
    title: {
      en: 'Physical Development',
      nl: 'Fysieke Ontwikkeling',
    },
    description: {
      en: 'This section looks at your child\'s motor skills, coordination, and physical activity levels.',
      nl: 'Dit onderdeel kijkt naar de motorische vaardigheden, coördinatie en fysieke activiteit van uw kind.',
    },
    icon: 'activity',
    color: '#6FCF97',
    tips: {
      en: [
        'Encourage at least 60 minutes of physical activity daily',
        'Practice age-appropriate fine motor activities like drawing or building',
        'Ensure regular outdoor play time',
      ],
      nl: [
        'Stimuleer dagelijks minstens 60 minuten fysieke activiteit',
        'Oefen leeftijdsgeschikte fijne motoriek zoals tekenen of bouwen',
        'Zorg voor regelmatige buitenspeeltijd',
      ],
    },
  },
  {
    id: 'socialEmotional',
    title: {
      en: 'Social-Emotional Development',
      nl: 'Sociaal-Emotionele Ontwikkeling',
    },
    description: {
      en: 'This section assesses your child\'s ability to understand and manage emotions, relationships, and social interactions.',
      nl: 'Dit onderdeel beoordeelt het vermogen van uw kind om emoties, relaties en sociale interacties te begrijpen en te beheren.',
    },
    icon: 'users',
    color: '#F2994A',
    tips: {
      en: [
        'Help your child name and express their emotions',
        'Create opportunities for social interaction with peers',
        'Model healthy emotional responses and conflict resolution',
      ],
      nl: [
        'Help uw kind bij het benoemen en uiten van emoties',
        'Creëer mogelijkheden voor sociale interactie met leeftijdsgenoten',
        'Toon gezonde emotionele reacties en conflictoplossing',
      ],
    },
  },
];

export const questions: Question[] = [
  {
    id: '1',
    theme: 'general',
    text: {
      en: 'How would you describe your child\'s overall energy level?',
      nl: 'Hoe zou u het algemene energieniveau van uw kind beschrijven?',
    },
    options: {
      en: ['Very low', 'Somewhat low', 'Normal', 'Somewhat high', 'Very high'],
      nl: ['Zeer laag', 'Enigszins laag', 'Normaal', 'Enigszins hoog', 'Zeer hoog'],
    },
  },
  {
    id: '2',
    theme: 'general',
    text: {
      en: 'How often does your child complain about physical discomfort?',
      nl: 'Hoe vaak klaagt uw kind over fysiek ongemak?',
    },
    options: {
      en: ['Never', 'Rarely', 'Sometimes', 'Often', 'Very often'],
      nl: ['Nooit', 'Zelden', 'Soms', 'Vaak', 'Zeer vaak'],
    },
  },
  {
    id: '3',
    theme: 'cognitive',
    text: {
      en: 'How well does your child follow multi-step instructions?',
      nl: 'Hoe goed volgt uw kind instructies met meerdere stappen?',
    },
    options: {
      en: ['Not at all', 'With difficulty', 'Moderately well', 'Well', 'Very well'],
      nl: ['Helemaal niet', 'Met moeite', 'Redelijk goed', 'Goed', 'Zeer goed'],
    },
  },
  {
    id: '4',
    theme: 'cognitive',
    text: {
      en: 'How curious is your child about learning new things?',
      nl: 'Hoe nieuwsgierig is uw kind naar het leren van nieuwe dingen?',
    },
    options: {
      en: ['Not curious', 'Slightly curious', 'Moderately curious', 'Very curious', 'Extremely curious'],
      nl: ['Niet nieuwsgierig', 'Licht nieuwsgierig', 'Matig nieuwsgierig', 'Zeer nieuwsgierig', 'Extreem nieuwsgierig'],
    },
  },
  {
    id: '5',
    theme: 'physical',
    text: {
      en: 'How would you rate your child\'s coordination compared to peers?',
      nl: 'Hoe beoordeelt u de coördinatie van uw kind in vergelijking met leeftijdsgenoten?',
    },
    options: {
      en: ['Much worse', 'Somewhat worse', 'About the same', 'Somewhat better', 'Much better'],
      nl: ['Veel slechter', 'Enigszins slechter', 'Ongeveer hetzelfde', 'Enigszins beter', 'Veel beter'],
    },
  },
  {
    id: '6',
    theme: 'physical',
    text: {
      en: 'How often does your child engage in physical activity?',
      nl: 'Hoe vaak doet uw kind aan lichamelijke activiteit?',
    },
    options: {
      en: ['Rarely', 'A few times a month', 'A few times a week', 'Daily', 'Multiple times daily'],
      nl: ['Zelden', 'Een paar keer per maand', 'Een paar keer per week', 'Dagelijks', 'Meerdere keren per dag'],
    },
  },
  {
    id: '7',
    theme: 'socialEmotional',
    text: {
      en: 'How well does your child manage frustration?',
      nl: 'Hoe goed kan uw kind omgaan met frustratie?',
    },
    options: {
      en: ['Very poorly', 'Poorly', 'Moderately well', 'Well', 'Very well'],
      nl: ['Zeer slecht', 'Slecht', 'Redelijk goed', 'Goed', 'Zeer goed'],
    },
  },
  {
    id: '8',
    theme: 'socialEmotional',
    text: {
      en: 'How comfortable is your child in social situations with peers?',
      nl: 'Hoe comfortabel is uw kind in sociale situaties met leeftijdsgenoten?',
    },
    options: {
      en: ['Very uncomfortable', 'Somewhat uncomfortable', 'Neutral', 'Somewhat comfortable', 'Very comfortable'],
      nl: ['Zeer oncomfortabel', 'Enigszins oncomfortabel', 'Neutraal', 'Enigszins comfortabel', 'Zeer comfortabel'],
    },
  },
];
