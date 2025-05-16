
import React from 'react';
import { Platform, useColorScheme } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { COLORS } from '../constants/colors';

// Screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ThemeIntroScreen from '../screens/ThemeIntroScreen';
import QuestionScreen from '../screens/QuestionScreen';
import ResultsScreen from '../screens/ResultsScreen';
import ThemeInfoScreen from '../screens/ThemeInfoScreen';

// Define types for navigation
export type RootStackParamList = {
  Main: undefined;
  Login: undefined;
  ThemeIntro: undefined;
  Question: undefined;
  Results: undefined;
  ThemeInfo: { themeId: string };
};

export type MainTabsParamList = {
  Home: undefined;
  Profile: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

// Main tab navigator
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarIcon: ({focused, color, size}) => {
          let iconName: keyof typeof Feather.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Profile') {
            iconName = 'user';
          } else if (route.name === 'Settings') {
            iconName = 'settings';
          }

          return <Feather name={iconName} size={20} color={color}/>;
        },
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 72 : 60,
          paddingBottom: 8,
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          ...(Platform.OS === 'ios' ? {paddingBottom: 0} : {}),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen}/>
    </Tab.Navigator>
  );
};

// Root navigator
const RootNavigator = () => {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="ThemeIntro" component={ThemeIntroScreen} />
          <Stack.Screen name="Question" component={QuestionScreen} />
          <Stack.Screen name="Results" component={ResultsScreen} />
          <Stack.Screen name="ThemeInfo" component={ThemeInfoScreen} />
        </>
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  );
};

export default RootNavigator;
