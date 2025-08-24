import { Tabs } from 'expo-router';
import { Calendar, Clock, Users } from 'lucide-react-native';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../../utils/AuthContext';
import CustomHeader from '../../components/CustomHeader';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!isLoading && !user) {
      router.replace('/login' as any);
    }
  }, [user, isLoading, router]);

  // Don't render tabs until authentication check is complete
  if (isLoading || !user) {
    return null;
  }
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorScheme === 'dark' ? '#4F8EF7' : '#0A84FF',
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#8E8E93' : '#8E8E93',
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF',
        },
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#FFFFFF',
        },
        headerTintColor: colorScheme === 'dark' ? '#FFFFFF' : '#000000',
        // Use custom header for all tabs
        header: ({ route, options }) => {
          // Get the title from the route options, with better fallback logic
          let title = options.headerTitle?.toString() || options.title;
          
          // If we still don't have a title, use a default based on the route
          if (!title) {
            switch (route.name) {
              case 'index':
                title = "Today's Sessions";
                break;
              case 'upcoming':
                title = 'Upcoming Sessions';
                break;
              case 'past':
                title = 'Past Sessions';
                break;
              case 'patients':
                title = 'Patient Management';
                break;
              default:
                title = "Today's Sessions";
            }
          }
          
          return <CustomHeader title={title} />;
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Today's Sessions",
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
          headerTitle: "Today's Sessions",
        }}
      />
      <Tabs.Screen
        name="upcoming"
        options={{
          title: 'Upcoming',
          tabBarIcon: ({ color, size }) => <Calendar size={size} color={color} />,
          headerTitle: 'Upcoming Sessions',
        }}
      />
      <Tabs.Screen
        name="past"
        options={{
          title: 'Past',
          tabBarIcon: ({ color, size }) => <Clock size={size} color={color} />,
          headerTitle: 'Past Sessions',
        }}
      />
      <Tabs.Screen
        name="patients"
        options={{
          title: 'Patients',
          tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          headerTitle: 'Patient Management',
        }}
      />
    </Tabs>
  );
}