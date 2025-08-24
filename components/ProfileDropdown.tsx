import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  Animated,
  useColorScheme,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { User, ChevronDown, LogOut, Settings } from 'lucide-react-native';
import { useAuth } from '../utils/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileDropdown() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownAnimation = useRef(new Animated.Value(0)).current;
  const insets = useSafeAreaInsets();
  
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const theme = {
    backgroundColor: isDarkMode ? '#1E1E1E' : '#F2F2F7',
    cardBackground: isDarkMode ? '#2A2A2A' : 'white',
    textColor: isDarkMode ? '#FFFFFF' : '#000000',
    borderColor: isDarkMode ? '#444444' : '#DDDDDD',
    primaryColor: '#0A84FF',
    modalBg: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
  };

  useEffect(() => {
    if (isOpen) {
      Animated.timing(dropdownAnimation, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(dropdownAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen, dropdownAnimation]);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login' as any);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigateToProfile = () => {
    setIsOpen(false);
    router.push('/profile' as any);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  // Calculate dropdown position based on header height and safe area
  const headerHeight = 56; // Match the header height
  const statusBarHeight = Platform.OS === 'ios' ? Math.max(insets.top, 20) : 0;
  const dropdownTopPosition = headerHeight + statusBarHeight;

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.profileButton} 
        onPress={toggleDropdown}
        activeOpacity={0.7}
      >
        {user?.profileImage ? (
          <Image 
            source={{ uri: user.profileImage }} 
            style={styles.profileImage} 
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.profilePlaceholder, { backgroundColor: theme.primaryColor }]}>
            <User size={16} color="white" />
          </View>
        )}
        <ChevronDown 
          size={16} 
          color={isDarkMode ? 'white' : 'black'} 
          style={{ marginLeft: 4, transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }} 
        />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="none"
        onRequestClose={closeDropdown}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={closeDropdown}
        >
          <Animated.View 
            style={[
              styles.dropdown,
              { 
                backgroundColor: theme.cardBackground,
                borderColor: theme.borderColor,
                opacity: dropdownAnimation,
                transform: [
                  {
                    translateY: dropdownAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-20, 0],
                    }),
                  },
                ],
                top: dropdownTopPosition,
              },
            ]}
          >
            <View style={styles.userInfo}>
              {user?.profileImage ? (
                <Image 
                  source={{ uri: user.profileImage }} 
                  style={styles.dropdownProfileImage} 
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.dropdownProfilePlaceholder, { backgroundColor: theme.primaryColor }]}>
                  <User size={24} color="white" />
                </View>
              )}
              <View style={styles.userTextContainer}>
                <Text style={[styles.userName, { color: theme.textColor }]}>{user?.email}</Text>
                <Text style={[styles.userPhone, { color: theme.textColor }]}>{user?.phoneNumber}</Text>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.borderColor }]} />

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={navigateToProfile}
              activeOpacity={0.7}
            >
              <Settings size={20} color={isDarkMode ? 'white' : 'black'} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: theme.textColor }]}>Profile Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.menuItem} 
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <LogOut size={20} color={isDarkMode ? 'white' : 'black'} style={styles.menuIcon} />
              <Text style={[styles.menuText, { color: theme.textColor }]}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 2000,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    zIndex: 2000,
  },
  profileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  profilePlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  dropdown: {
    position: 'absolute',
    left: 16,
    width: 250,
    borderRadius: 12,
    borderWidth: 1,
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
    paddingVertical: 8,
    zIndex: 3000,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  dropdownProfileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  dropdownProfilePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  userPhone: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuText: {
    fontSize: 16,
  },
}); 