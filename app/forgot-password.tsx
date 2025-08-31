import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  useColorScheme,
  StatusBar,
  Platform,
  KeyboardAvoidingView,
  ScrollView
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useAuth } from '../utils/AuthContext';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import PasswordResetOTP from '../components/PasswordResetOTP';

// Platform-specific alert function
const showAlert = (title: string, message: string, onPress?: () => void) => {
  if (Platform.OS === 'web') {
    // Use browser's native alert on web
    if (onPress) {
      if (window.confirm(`${title}\n\n${message}\n\nClick OK to continue.`)) {
        onPress();
      }
    } else {
      window.alert(`${title}\n\n${message}`);
    }
  } else {
    // Use React Native Alert on mobile
    Alert.alert(title, message, onPress ? [{ text: 'OK', onPress }] : undefined);
  }
};

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ 
    email?: string; 
    newPassword?: string;
    confirmPassword?: string;
  }>({});
  const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');
  const [verifiedOTP, setVerifiedOTP] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  
  const { resetPassword, isLoading } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const insets = useSafeAreaInsets();

  // Define theme colors based on color scheme
  const theme = {
    backgroundColor: isDarkMode ? '#1E1E1E' : '#F5F5F5',
    cardBackground: isDarkMode ? '#2A2A2A' : '#FFFFFF',
    textColor: isDarkMode ? '#FFFFFF' : '#333333',
    subtitleColor: isDarkMode ? '#BBBBBB' : '#666666',
    inputBackground: isDarkMode ? '#3A3A3A' : '#FAFAFA',
    inputBorder: isDarkMode ? '#444444' : '#DDDDDD',
    placeholderColor: isDarkMode ? '#888888' : '#999999',
    primaryColor: '#0A84FF',
    errorColor: '#FF453A',
  };

  const validateEmail = () => {
    const newErrors: { email?: string } = {};
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validatePassword = () => {
    const newErrors: { newPassword?: string; confirmPassword?: string } = {};
    let isValid = true;

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
      isValid = false;
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
      isValid = false;
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleVerifyEmail = async () => {
    if (!validateEmail()) return;
    
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep('otp');
      } else {
        showAlert('Error', data.error || 'Failed to send reset code. Please try again.');
      }
    } catch (error) {
      showAlert('Error', 'Network error. Please try again.');
    }
  };

  const handleOTPVerificationSuccess = (otp: string) => {
    setVerifiedOTP(otp);
    setStep('password');
  };

  const handleBackFromOTP = () => {
    setStep('email');
  };

  const handleResetPassword = async () => {
    if (!validatePassword()) return;
    
    setIsResettingPassword(true);

    try {
      
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email, 
          otp: verifiedOTP, 
          newPassword 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert(
          'Success', 
          'Your password has been reset successfully. Please login with your new password.',
          () => router.replace('/login' as any)
        );
      } else {
        showAlert('Reset Failed', data.error || 'Failed to reset password. Please try again.');
      }
    } catch (error: any) {
      showAlert('Reset Failed', 'Network error. Please try again.');
    } finally {
      setIsResettingPassword(false);
    }
  };

  const navigateToLogin = () => {
    router.push('/login' as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Stack.Screen 
        options={{ 
          title: 'Forgot Password', 
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.backgroundColor,
          },
          headerTintColor: theme.textColor,
        }} 
      />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={[styles.title, { color: theme.textColor }]}>Rehabiri</Text>
          <Text style={[styles.subtitle, { color: theme.subtitleColor }]}>Reset Your Password</Text>

          <View style={[styles.form, { backgroundColor: theme.cardBackground, shadowColor: isDarkMode ? '#000000' : '#000000' }]}>
            {step === 'email' ? (
              <>
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: theme.textColor }]}>Email</Text>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        backgroundColor: theme.inputBackground, 
                        borderColor: errors.email ? theme.errorColor : theme.inputBorder,
                        color: theme.textColor
                      }
                    ]}
                    placeholder="Enter your email"
                    placeholderTextColor={theme.placeholderColor}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {errors.email ? <Text style={[styles.errorText, { color: theme.errorColor }]}>{errors.email}</Text> : null}
                </View>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: theme.primaryColor }]}
                  onPress={handleVerifyEmail}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Send Reset Code</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : step === 'otp' ? (
              <PasswordResetOTP
                email={email}
                onVerificationSuccess={handleOTPVerificationSuccess}
                onBack={handleBackFromOTP}
              />
            ) : (
              <>
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: theme.textColor }]}>New Password</Text>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        backgroundColor: theme.inputBackground, 
                        borderColor: errors.newPassword ? theme.errorColor : theme.inputBorder,
                        color: theme.textColor
                      }
                    ]}
                    placeholder="Enter new password"
                    placeholderTextColor={theme.placeholderColor}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                  />
                  {errors.newPassword ? <Text style={[styles.errorText, { color: theme.errorColor }]}>{errors.newPassword}</Text> : null}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: theme.textColor }]}>Confirm Password</Text>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        backgroundColor: theme.inputBackground, 
                        borderColor: errors.confirmPassword ? theme.errorColor : theme.inputBorder,
                        color: theme.textColor
                      }
                    ]}
                    placeholder="Confirm new password"
                    placeholderTextColor={theme.placeholderColor}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                  />
                  {errors.confirmPassword ? <Text style={[styles.errorText, { color: theme.errorColor }]}>{errors.confirmPassword}</Text> : null}
                </View>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: theme.primaryColor }]}
                  onPress={handleResetPassword}
                  disabled={isResettingPassword}
                  activeOpacity={0.7}
                >
                  {isResettingPassword ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Reset Password</Text>
                  )}
                </TouchableOpacity>
              </>
            )}

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: theme.subtitleColor }]}>Remember your password?</Text>
              <TouchableOpacity onPress={navigateToLogin} activeOpacity={0.7}>
                <Text style={[styles.loginLink, { color: theme.primaryColor }]}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Add extra padding at the bottom to ensure content is visible above keyboard */}
          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 20,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 30,
  },
  form: {
    borderRadius: 10,
    padding: 20,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 14,
    marginTop: 5,
  },
  button: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  bottomPadding: {
    height: 100, // Extra padding at the bottom
  },
}); 