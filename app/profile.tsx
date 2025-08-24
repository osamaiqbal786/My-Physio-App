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
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../utils/AuthContext';
import CustomHeader from '../components/CustomHeader';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const { user, updateUserProfile, isLoading } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [email, setEmail] = useState(user?.email || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [profileImage, setProfileImage] = useState<string | null>(user?.profileImage || null);
  const [isEditing, setIsEditing] = useState(false);
  const [errors, setErrors] = useState<{ 
    email?: string; 
    phoneNumber?: string;
  }>({});

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const theme = {
    backgroundColor: isDarkMode ? '#1E1E1E' : '#F2F2F7',
    textColor: isDarkMode ? '#FFFFFF' : '#000000',
    cardBackground: isDarkMode ? '#2A2A2A' : 'white',
    borderColor: isDarkMode ? '#444444' : '#DDDDDD',
    primaryColor: '#0A84FF',
    errorColor: '#FF453A',
    placeholderColor: isDarkMode ? '#888888' : '#999999',
  };

  // Calculate header height including status bar
  const headerHeight = 56; // Match the header height in CustomHeader
  const statusBarHeight = Platform.OS === 'ios' ? Math.max(insets.top, 20) : StatusBar.currentHeight || 0;
  const totalHeaderHeight = headerHeight + statusBarHeight;

  const validateForm = () => {
    const newErrors: { 
      email?: string; 
      phoneNumber?: string;
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

    setErrors(newErrors);
    return isValid;
  };

  const handleUpdateProfile = async () => {
    if (!validateForm()) return;

    try {
      await updateUserProfile({
        email,
        phoneNumber,
        profileImage: profileImage || undefined,
      });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error: any) {
      Alert.alert('Update Failed', error.message || 'Failed to update profile. Please try again.');
    }
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
                allowsEditing: false, // Don't force cropping
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

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundColor }]} edges={['top', 'bottom', 'left', 'right']}>
        <Text style={[styles.title, { color: theme.textColor }]}>Not Logged In</Text>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primaryColor }]}
          onPress={() => router.replace('/login' as any)}
        >
          <Text style={styles.buttonText}>Go to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Custom Header */}
      <CustomHeader title="My Profile" showBackButton={true} />
      
      {/* Main Content */}
      <View style={[styles.contentContainer, { paddingTop: 16 }]}>
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { backgroundColor: theme.cardBackground, borderColor: theme.borderColor }]}>
            <View style={styles.imageContainer}>
              <TouchableOpacity 
                onPress={isEditing ? pickImage : undefined}
                disabled={!isEditing}
                activeOpacity={0.8}
              >
                {profileImage ? (
                  <Image 
                    source={{ uri: profileImage }} 
                    style={styles.profileImage} 
                    resizeMode="contain"
                    onError={(e) => {
                      console.error("Profile image loading error:", e.nativeEvent.error);
                      Alert.alert('Image Error', 'Failed to load the profile image.');
                      setProfileImage(null);
                    }}
                  />
                ) : (
                  <View style={[styles.imagePlaceholder, { backgroundColor: theme.primaryColor }]}>
                    <Text style={styles.imagePlaceholderText}>
                      {isEditing ? 'Add Photo' : 'No Photo'}
                    </Text>
                  </View>
                )}
                {isEditing && (
                  <View style={[styles.editImageBadge, { backgroundColor: theme.primaryColor }]}>
                    <Text style={styles.editImageText}>Edit</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {isEditing ? (
              <>
                <View style={styles.inputContainer}>
                  <Text style={[styles.label, { color: theme.textColor }]}>Email</Text>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        backgroundColor: theme.cardBackground, 
                        borderColor: errors.email ? theme.errorColor : theme.borderColor,
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
                        backgroundColor: theme.cardBackground, 
                        borderColor: errors.phoneNumber ? theme.errorColor : theme.borderColor,
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

                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.button, styles.cancelButton, { borderColor: theme.borderColor }]}
                    onPress={() => {
                      setIsEditing(false);
                      setEmail(user.email);
                      setPhoneNumber(user.phoneNumber);
                      setProfileImage(user.profileImage || null);
                    }}
                    disabled={isLoading}
                  >
                    <Text style={[styles.cancelButtonText, { color: theme.textColor }]}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: theme.primaryColor }]}
                    onPress={handleUpdateProfile}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.buttonText}>Save Changes</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <View style={styles.infoContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textColor }]}>Email</Text>
                  <Text style={[styles.infoValue, { color: theme.textColor }]}>{user.email}</Text>
                </View>

                <View style={styles.infoContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textColor }]}>Phone Number</Text>
                  <Text style={[styles.infoValue, { color: theme.textColor }]}>{user.phoneNumber}</Text>
                </View>

                <View style={styles.infoContainer}>
                  <Text style={[styles.infoLabel, { color: theme.textColor }]}>Account Created</Text>
                  <Text style={[styles.infoValue, { color: theme.textColor }]}>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: theme.primaryColor }]}
                  onPress={() => setIsEditing(true)}
                >
                  <Text style={styles.buttonText}>Edit Profile</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 30, // Extra padding at the bottom for better scrolling experience
  },
  card: {
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: 'white',
    fontWeight: 'bold',
  },
  editImageBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editImageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  inputContainer: {
    marginBottom: 16,
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
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginVertical: 10,
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  infoContainer: {
    marginBottom: 16,
  },
  infoLabel: {
    fontSize: 14,
    marginBottom: 4,
    opacity: 0.7,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
}); 