import { Redirect, Stack } from 'expo-router';

export default function Index() {
  // Always start with splash screen
  return (
    <>
      <Stack.Screen 
        options={{ 
          headerShown: false 
        }} 
      />
      <Redirect href="/splash" />
    </>
  );
}

 