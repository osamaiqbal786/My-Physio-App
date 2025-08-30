import React from 'react';
import { Stack } from 'expo-router';
import CustomSplashScreen from '../components/CustomSplashScreen';

export default function SplashScreen() {
  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false 
        }} 
      />
      <CustomSplashScreen />
    </>
  );
}
