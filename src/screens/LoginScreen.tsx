
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { COLORS } from '../constants/colors';

const LoginScreen = ({ navigation }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isResetPassword, setIsResetPassword] = useState(false);
  
  const { login, signup, resetPassword, isLoading, error, clearError } = useAuthStore();
  
  const handleAuth = async () => {
    if (isResetPassword) {
      await resetPassword(email);
      return;
    }
    
    if (isLogin) {
      await login(email, password);
    } else {
      await signup(email, password, name);
    }
  };
  
  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    clearError();
  };
  
  const toggleResetPassword = () => {
    setIsResetPassword(!isResetPassword);
    clearError();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image 
              source={{ uri: 'https://magically.life/api/media/image?query=child%20development%20logo%20with%20colorful%20blocks%20and%20a%20simple%20icon' }}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.appTitle}>Trias Development</Text>
            <Text style={styles.appSubtitle}>Child Development Assessment</Text>
          </View>
          
          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>
              {isResetPassword 
                ? 'Reset Password'
                : isLogin 
                  ? 'Welcome Back' 
                  : 'Create Account'}
            </Text>
            <Text style={styles.instructionText}>
              {isResetPassword
                ? 'Enter your email to receive a password reset link'
                : isLogin
                  ? 'Sign in to your account to continue'
                  : 'Fill in your details to create an account'}
            </Text>
            
            {error && (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={16} color={COLORS.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            {!isLogin && !isResetPassword && (
              <View style={styles.inputContainer}>
                <Feather name="user" size={20} color={COLORS.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  value={name}
                  onChangeText={(text) => {
                    setName(text);
                    if (error) clearError();
                  }}
                  autoCapitalize="words"
                />
              </View>
            )}
            
            <View style={styles.inputContainer}>
              <Feather name="mail" size={20} color={COLORS.textLight} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (error) clearError();
                }}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            {!isResetPassword && (
              <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color={COLORS.textLight} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (error) clearError();
                  }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity 
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Feather 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color={COLORS.textLight} 
                  />
                </TouchableOpacity>
              </View>
            )}
            
            {isLogin && !isResetPassword && (
              <TouchableOpacity 
                style={styles.forgotPasswordLink}
                onPress={toggleResetPassword}
              >
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={styles.authButton}
              onPress={handleAuth}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.authButtonText}>
                  {isResetPassword
                    ? 'Send Reset Link'
                    : isLogin 
                      ? 'Sign In' 
                      : 'Sign Up'}
                </Text>
              )}
            </TouchableOpacity>
            
            {isResetPassword ? (
              <TouchableOpacity 
                style={styles.toggleAuthMode}
                onPress={toggleResetPassword}
              >
                <Text style={styles.toggleAuthText}>
                  Back to login
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.toggleAuthMode}
                onPress={toggleAuthMode}
              >
                <Text style={styles.toggleAuthText}>
                  {isLogin 
                    ? 'Don\'t have an account? Sign Up' 
                    : 'Already have an account? Sign In'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  appSubtitle: {
    fontSize: 16,
    color: COLORS.textLight,
  },
  formContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 24,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEEEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    padding: 12,
  },
  input: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: COLORS.text,
  },
  passwordToggle: {
    padding: 12,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: COLORS.primary,
    fontSize: 14,
  },
  authButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  toggleAuthMode: {
    alignItems: 'center',
  },
  toggleAuthText: {
    color: COLORS.primary,
    fontSize: 14,
  },
});

export default LoginScreen;
