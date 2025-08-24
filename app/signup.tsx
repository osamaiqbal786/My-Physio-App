import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  Image,
  ScrollView,
  useColorScheme,
  StatusBar,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../utils/AuthContext';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import OTPVerification from '../components/OTPVerification';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [errors, setErrors] = useState<{ 
    email?: string; 
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  
  const { register, isLoading } = useAuth();
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
    imagePlaceholderBg: isDarkMode ? '#444444' : '#E5E5EA',
  };

  const validateForm = () => {
    const newErrors: { 
      email?: string; 
      phoneNumber?: string;
      password?: string;
      confirmPassword?: string;
    } = {};
    let isValid = true;

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }

    // Phone number validation
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
      isValid = false;
    } else if (!/^\d{10}$/.test(phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
      isValid = false;
    }

    // Password validation
    if (!password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSignup = async () => {
    if (!validateForm()) return;

    // Send OTP first, then show verification screen
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.0.122:3000/api'}/otp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show OTP verification screen
        setShowOTPVerification(true);
      } else {
        Alert.alert('Error', data.message || 'Failed to send OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to send OTP. Please try again.');
    }
  };

  const handleOTPVerificationSuccess = async () => {
    console.log('🎉 OTP verification successful, starting registration...');
    try {
      console.log('📝 Registering user with email:', email);
      await register({
        email,
        phoneNumber,
        password,
        profileImage: profileImage || undefined,
      });
      console.log('✅ Registration successful, navigating to tabs');
      router.replace('/(tabs)' as any);
    } catch (error: any) {
      console.error('❌ Registration failed:', error);
      Alert.alert('Registration Failed', error.message || 'Failed to create account. Please try again.');
      setShowOTPVerification(false);
    }
  };

  const handleBackFromOTP = () => {
    setShowOTPVerification(false);
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'We need camera roll permission to upload an image');
      return;
    }

    try {
      // Show action sheet to choose between camera and gallery
      Alert.alert(
        "Choose Photo Source",
        "Where would you like to take a photo from?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "Camera",
            onPress: async () => {
              const { status } = await ImagePicker.requestCameraPermissionsAsync();
              if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need camera permission to take a photo');
                return;
              }
              
              const cameraResult = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 1,
                exif: false,
              });

              if (!cameraResult.canceled && cameraResult.assets && cameraResult.assets[0]) {
                setProfileImage(cameraResult.assets[0].uri);
                console.log("Camera image captured:", cameraResult.assets[0].uri);
              }
            }
          },
          {
            text: "Photo Library",
            onPress: async () => {
              const galleryResult = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: false,
                quality: 1,
                exif: false,
              });

              if (!galleryResult.canceled && galleryResult.assets && galleryResult.assets[0]) {
                setProfileImage(galleryResult.assets[0].uri);
                console.log("Gallery image selected:", galleryResult.assets[0].uri);
              }
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const navigateToLogin = () => {
    router.push('/login' as any);
  };

  // Show OTP verification if needed
  if (showOTPVerification) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <Stack.Screen 
          options={{ 
            title: 'Email Verification', 
            headerShown: true,
            headerStyle: {
              backgroundColor: theme.backgroundColor,
            },
            headerTintColor: theme.textColor,
          }} 
        />
        <OTPVerification
          email={email}
          onVerificationSuccess={handleOTPVerificationSuccess}
          onBack={handleBackFromOTP}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Stack.Screen 
        options={{ 
          title: 'Sign Up', 
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
          <Text style={[styles.title, { color: theme.textColor }]}>My Physio</Text>
          <Text style={[styles.subtitle, { color: theme.subtitleColor }]}>Create a new account</Text>

          <View style={[styles.form, { backgroundColor: theme.cardBackground, shadowColor: isDarkMode ? '#000000' : '#000000' }]}>
            <TouchableOpacity 
              style={styles.imageContainer} 
              onPress={pickImage}
              activeOpacity={0.7}
            >
              {profileImage ? (
                <Image 
                  source={{ uri: profileImage }} 
                  style={styles.profileImage} 
                  resizeMode="contain"
                  onError={(e) => {
                    console.error("Image loading error:", e.nativeEvent.error);
                    Alert.alert('Image Error', 'Failed to load the selected image.');
                    setProfileImage(null);
                  }}
                />
              ) : (
                <View style={[styles.imagePlaceholder, { backgroundColor: theme.imagePlaceholderBg }]}>
                  <Text style={[styles.imagePlaceholderText, { color: theme.textColor }]}>Add Photo</Text>
                </View>
              )}
            </TouchableOpacity>

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

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.textColor }]}>Phone Number</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: theme.inputBackground, 
                    borderColor: errors.phoneNumber ? theme.errorColor : theme.inputBorder,
                    color: theme.textColor
                  }
                ]}
                placeholder="Enter your phone number"
                placeholderTextColor={theme.placeholderColor}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                keyboardType="phone-pad"
              />
              {errors.phoneNumber ? <Text style={[styles.errorText, { color: theme.errorColor }]}>{errors.phoneNumber}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: theme.textColor }]}>Password</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    backgroundColor: theme.inputBackground, 
                    borderColor: errors.password ? theme.errorColor : theme.inputBorder,
                    color: theme.textColor
                  }
                ]}
                placeholder="Create a password"
                placeholderTextColor={theme.placeholderColor}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              {errors.password ? <Text style={[styles.errorText, { color: theme.errorColor }]}>{errors.password}</Text> : null}
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
                placeholder="Confirm your password"
                placeholderTextColor={theme.placeholderColor}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              {errors.confirmPassword ? <Text style={[styles.errorText, { color: theme.errorColor }]}>{errors.confirmPassword}</Text> : null}
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.primaryColor }]}
              onPress={handleSignup}
              disabled={isLoading}
              activeOpacity={0.7}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Continue to Verification</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: theme.subtitleColor }]}>Already have an account?</Text>
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
    paddingBottom: 40,
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
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  imagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontWeight: '500',
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