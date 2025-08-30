import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  useColorScheme,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Session } from '../types';
import { getPatientSessions, getPatientById } from '../utils/mongoStorage';
import { exportSessionsToExcel } from '../utils/exportUtils';
import SessionCard from '../components/SessionCard';
import { FileDown } from 'lucide-react-native';
import CustomHeader from '../components/CustomHeader';

export default function PatientSessionsScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPastSessions, setShowPastSessions] = useState(false);
  const [patientName, setPatientName] = useState('');
  const insets = useSafeAreaInsets();

  // Get URL params
  const params = useLocalSearchParams();
  const patientId = params.patientId as string;
  
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const theme = {
    backgroundColor: isDarkMode ? '#1E1E1E' : '#F2F2F7',
    textColor: isDarkMode ? '#FFFFFF' : '#000000',
    cardBackground: isDarkMode ? '#2A2A2A' : 'white',
    borderColor: isDarkMode ? '#444444' : '#DDDDDD',
    primaryColor: '#0A84FF',
    secondaryColor: '#5856D6',
    inactiveColor: isDarkMode ? '#444444' : '#E5E5EA',
    inactiveTextColor: isDarkMode ? '#888888' : '#8E8E93',
    modalBg: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
  };

  const loadPatientInfo = async () => {
    if (!patientId) return;
    
    try {
      const patient = await getPatientById(patientId);
      if (patient) {
        setPatientName(patient.name);
      }
    } catch (error) {
      console.error('Error loading patient info:', error);
    }
  };

  const loadSessions = async () => {
    if (!patientId) return;
    
    try {
      setLoading(true);
      
      // Use the new getPatientSessions function which filters by both patientId and userId
      const allSessions = await getPatientSessions(patientId);
      
      // Filter based on the selected tab (past or upcoming)
      const filteredByStatus = allSessions.filter(session => 
        showPastSessions ? session.completed : !session.completed
      );
      
      // Sort sessions by date and time
      const sortedSessions = filteredByStatus.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return showPastSessions 
          ? dateB.getTime() - dateA.getTime() // Descending for past
          : dateA.getTime() - dateB.getTime(); // Ascending for upcoming
      });
      
      setSessions(sortedSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatientInfo();
  }, [patientId]);

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [patientId, showPastSessions])
  );

  const handleExportSessions = async () => {
    if (!patientId || !patientName) return;
    
    try {
      setLoading(true);
      
      // Use the new getPatientSessions function
      const allSessions = await getPatientSessions(patientId);
      
      // Filter to only include completed sessions for export
      const pastSessions = allSessions.filter(session => session.completed);
      
      if (pastSessions.length === 0) {
        Alert.alert('No Data', 'There are no past sessions to export');
        setLoading(false);
        return;
      }
      
      const success = await exportSessionsToExcel(pastSessions, patientName);
      if (success) {
        Alert.alert('Success', 'Sessions exported successfully');
      } else {
        Alert.alert('Error', 'Failed to export sessions');
      }
    } catch (error) {
      console.error('Error exporting sessions:', error);
      Alert.alert('Error', 'Failed to export sessions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Hide default header */}
      <Stack.Screen 
        options={{ 
          headerShown: false 
        }} 
      />
      
      {/* Custom Header - hide profile dropdown */}
      <CustomHeader 
        title={patientName ? `${patientName}'s Sessions` : 'Patient Sessions'} 
        showBackButton={true}
        hideProfileDropdown={true}
      />
      
      {/* Main Content */}
      <View style={styles.contentContainer}>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              !showPastSessions ? 
                { backgroundColor: theme.primaryColor } : 
                { backgroundColor: theme.inactiveColor }
            ]}
            onPress={() => setShowPastSessions(false)}
            activeOpacity={0.7}
          >
            <Text 
              style={[
                styles.tabButtonText, 
                { color: !showPastSessions ? 'white' : theme.inactiveTextColor }
              ]}
            >
              Upcoming
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.tabButton, 
              showPastSessions ? 
                { backgroundColor: theme.secondaryColor } : 
                { backgroundColor: theme.inactiveColor }
            ]}
            onPress={() => setShowPastSessions(true)}
            activeOpacity={0.7}
          >
            <Text 
              style={[
                styles.tabButtonText, 
                { color: showPastSessions ? 'white' : theme.inactiveTextColor }
              ]}
            >
              Past
            </Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.actionsContainer}>
          {/* Export button - only show when viewing past sessions */}
          {showPastSessions && (
            <TouchableOpacity 
              style={[styles.exportButton, { backgroundColor: theme.secondaryColor }]}
              onPress={handleExportSessions}
              activeOpacity={0.7}
            >
              <FileDown size={16} color="white" style={styles.exportIcon} />
              <Text style={styles.exportButtonText}>Export to Excel</Text>
            </TouchableOpacity>
          )}
        </View>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={theme.primaryColor} />
          </View>
        ) : sessions.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={[styles.noSessionsText, { color: theme.textColor }]}>
              No {showPastSessions ? 'past' : 'upcoming'} sessions found
            </Text>
          </View>
        ) : (
          <FlatList
            data={sessions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => {
              // Create a modified session object with disabled action buttons
              const sessionWithDisabledActions = {
                ...item,
                // This will make the SessionCard not render action buttons
                disableActions: true
              };
              
              return (
                <SessionCard
                  session={sessionWithDisabledActions}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onToggleComplete={() => {}}
                />
              );
            }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={true}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
            removeClippedSubviews={true}
            scrollEnabled={true}
            bounces={true}
          />
        )}
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
    paddingTop: 16,
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  tabButtonText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSessionsText: {
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 40,
  },
  actionsContainer: {
    marginBottom: 15,
  },
  exportButton: {
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exportIcon: {
    marginRight: 8,
  },
  exportButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 