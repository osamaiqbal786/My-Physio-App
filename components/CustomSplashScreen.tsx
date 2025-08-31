import React, { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, Animated, Dimensions, Text, useColorScheme } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../utils/AuthContext';

const { width, height } = Dimensions.get('window');

export default function CustomSplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const textAnim = useRef(new Animated.Value(0)).current;
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const [isReady, setIsReady] = useState(false);

  // Wait for color scheme to be detected before showing content
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Start animations with staggered timing
    Animated.sequence([
      // First: Image fade in and scale
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
      // Then: Text animation
      Animated.timing(textAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate after splash screen duration
    const timer = setTimeout(() => {
      if (!isLoading) {
        if (user) {
          router.replace('/(tabs)' as any);
        } else {
          // Navigate directly to login without showing intermediate screen
          router.replace('/login' as any);
        }
      }
    }, 3500); // Show splash for 3.5 seconds

    return () => clearTimeout(timer);
  }, [user, isLoading]);

  // Don't render until color scheme is detected
  if (!isReady) {
    return (
      <View style={[
        styles.container, 
        { backgroundColor: isDarkMode ? '#00143f' : '#FFFFFF' }
      ]} />
    );
  }

  return (
    <View style={[
      styles.container, 
      { backgroundColor: isDarkMode ? '#00143f' : '#FFFFFF' }
    ]}>
      <Animated.View
        style={[
          styles.imageContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Image
          source={isDarkMode 
            ? require('../assets/images/rehabiri-dark.png')
            : require('../assets/images/rehabiri-light.png')
          }
          style={styles.splashImage}
          resizeMode="contain"
        />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.textContainer,
          {
            opacity: textAnim,
            transform: [
              {
                translateY: textAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={[
          styles.tagline, 
          { color: isDarkMode ? '#FFFFFF' : '#001741' }
        ]}>
          From Sessions to Solutions
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: width * 0.8,
    height: height * 0.4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashImage: {
    width: '100%',
    height: '100%',
  },
  tagline: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 5,
  },
});
