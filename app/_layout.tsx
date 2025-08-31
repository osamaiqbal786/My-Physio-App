import { Stack } from 'expo-router';
import { AuthProvider } from '../utils/AuthContext';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <Stack>
          <Stack.Screen 
            name="splash" 
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="index" 
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="login" 
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen name="signup" />
          <Stack.Screen name="forgot-password" />
          <Stack.Screen 
            name="(tabs)" 
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen 
            name="profile" 
            options={{
              headerShown: false
            }}
          />
          <Stack.Screen name="patient-sessions" />
          <Stack.Screen name="+not-found" />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}