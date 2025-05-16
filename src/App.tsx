
import React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { Toaster } from 'sonner-native';
import RootNavigator from './navigation';
import { COLORS } from './constants/colors';

export default function App() {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Always extend the base theme from react.navigation.
    const navigationTheme = {
        ...(isDark ? DarkTheme : DefaultTheme),
        colors: {
            ...DefaultTheme.colors,
            primary: COLORS.primary,
            background: COLORS.background,
            card: COLORS.card,
            text: COLORS.text,
            border: COLORS.border,
        },
    };

    return (
        <SafeAreaProvider>
            <NavigationContainer theme={navigationTheme}>
                <StatusBar
                    style="dark"
                />
                <Toaster theme="light" richColors />
                <RootNavigator />
            </NavigationContainer>
        </SafeAreaProvider>
    );
}
