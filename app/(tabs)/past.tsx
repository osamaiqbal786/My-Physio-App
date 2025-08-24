import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  Modal, 
  useColorScheme,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Plus, FileDown } from 'lucide-react-native';
import { Session, Patient } from '../../types';
import { getPastSessions, getCurrentUserPatients, deleteSession, getFilteredSessions, updateSession } from '../../utils/mongoStorage';
import SessionCard from '../../components/SessionCard';
import SessionForm from '../../components/SessionForm';
import SessionFilter from '../../components/SessionFilter';
import { exportSessionsToExcel } from '../../utils/exportUtils';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PaymentModal from '../../components/PaymentModal';

export default function PastScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFiltered, setIsFiltered] = useState(false);
  const [filterTitle, setFilterTitle] = useState('Past Sessions');
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [sessionToComplete, setSessionToComplete] = useState<Session | null>(null);

  // Get URL params
  const params = useLocalSearchParams();
  const patientId = params.patientId as string | undefined;
  const patientName = params.patientName as string | undefined;
  
  const router = useRouter();

  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const theme = {
    backgroundColor: isDarkMode ? '#1E1E1E' : '#F2F2F7',
    textColor: isDarkMode ? '#FFFFFF' : '#000000',
    cardBackground: isDarkMode ? '#2A2A2A' : 'white',
    inputBackground: isDarkMode ? '#333333' : 'white',
    borderColor: isDarkMode ? '#444444' : '#DDDDDD',
    primaryColor: '#0A84FF',
    errorColor: '#FF453A',
    placeholderColor: isDarkMode ? '#888888' : '#999999',
    modalBg: isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)',
    separatorColor: isDarkMode ? '#333333' : '#EFEFEF',
  };

  const loadPatients = async () => {
    try {
      const patientsList = await getCurrentUserPatients();
      setPatients(patientsList);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  const loadSessions = async (filters?: any) => {
    try {
      setLoading(true);
      
      // If patientId is provided from URL params, filter sessions by patient
      if (patientId && !filters) {
        setIsFiltered(true);
        setFilterTitle(`${patientName}'s Past Sessions`);
        
        const filter = {
          patientId: patientId
        };
        
        const filteredSessions = await getFilteredSessions(filter);
        // Filter to only include completed sessions
        const pastSessions = filteredSessions.filter(session => session.completed);
        // Sort sessions by date and time
        const sortedSessions = pastSessions.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateB.getTime() - dateA.getTime(); // Descending order for past sessions
        });
        
        setSessions(sortedSessions);
      } 
      // If filters are provided from the filter component
      else if (filters) {
        setIsFiltered(true);
        const filteredSessions = await getFilteredSessions(filters);
        // Filter to only include completed sessions
        const pastSessions = filteredSessions.filter(session => session.completed);
        setSessions(pastSessions);
      } 
      // No filters, show all past sessions
      else {
        setIsFiltered(false);
        setFilterTitle('Past Sessions');
        const pastSessions = await getPastSessions();
        setSessions(pastSessions);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (filters: any) => {
    setIsFiltered(true);
    loadSessions(filters);
  };

  const handleClearFilter = () => {
    setIsFiltered(false);
    // Clear URL params if they exist
    if (patientId) {
      router.setParams({});
    }
    loadSessions();
  };

  const handleDeleteSession = (sessionId: string) => {
    Alert.alert(
      'Delete Session',
      'Are you sure you want to delete this session?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSession(sessionId);
              loadSessions();
            } catch (error) {
              console.error('Error deleting session:', error);
              Alert.alert('Error', 'Failed to delete session');
            }
          }
        },
      ]
    );
  };

  const handleToggleComplete = async (session: Session, completed: boolean) => {
    // Only allow marking as complete, not reverting back to incomplete
    if (completed && !session.completed) {
      // If marking as complete, show payment modal
      setSessionToComplete(session);
      setPaymentModalVisible(true);
    } else if (!completed && session.completed) {
      // If trying to mark a completed session as incomplete, show an alert
      Alert.alert('Info', 'Completed sessions cannot be marked as incomplete. You can delete the session if needed.');
    }
  };

  const handlePaymentConfirm = async (amount: number) => {
    if (!sessionToComplete) return;
    
    try {
      const updatedSession = { 
        ...sessionToComplete, 
        completed: true,
        amount: amount
      };
      await updateSession(updatedSession);
      setPaymentModalVisible(false);
      setSessionToComplete(null);
      loadSessions();
    } catch (error) {
      console.error('Error updating session with payment:', error);
      Alert.alert('Error', 'Failed to update session payment');
    }
  };

  const handlePaymentCancel = () => {
    setPaymentModalVisible(false);
    setSessionToComplete(null);
  };

  useEffect(() => {
    loadPatients();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        await loadPatients();  // Load patients first
        loadSessions();        // Then load sessions
      };
      
      loadData();
    }, [patientId])
  );

  const handleExportSessions = async () => {
    try {
      setLoading(true);
      
      if (sessions.length === 0) {
        Alert.alert('No Data', 'There are no past sessions to export');
        setLoading(false);
        return;
      }
      
      // For all sessions, use "All Patients" as the name
      // For filtered sessions, use the patient name if available
      const exportName = patientName ? patientName : "All Patients";
      
      const success = await exportSessionsToExcel(sessions, exportName);
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
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textColor }]}>{filterTitle}</Text>
        <View style={styles.headerButtons}>
          {isFiltered && patientId && (
            <TouchableOpacity 
              style={[styles.clearFilterButton, { backgroundColor: theme.borderColor }]}
              onPress={handleClearFilter}
            >
              <Text style={[styles.clearFilterText, { color: theme.textColor }]}>Clear Filter</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.exportButton, { backgroundColor: theme.primaryColor }]}
            onPress={handleExportSessions}
            activeOpacity={0.7}
          >
            <FileDown size={16} color="white" style={styles.exportIcon} />
            <Text style={styles.exportButtonText}>Export</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SessionFilter 
        patients={patients}
        onApplyFilter={handleApplyFilter}
        onClearFilter={handleClearFilter}
      />

      {loading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.primaryColor} />
          <Text style={{ color: theme.textColor, marginTop: 10 }}>Loading sessions...</Text>
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={[styles.noSessionsText, { color: theme.textColor }]}>No past sessions found</Text>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SessionCard
              session={item}
              onEdit={() => Alert.alert('Info', 'Editing past sessions is not allowed')}
              onDelete={(sessionId) => handleDeleteSession(sessionId)} 
              onToggleComplete={(session, completed) => {
                // Only allow marking incomplete sessions as complete
                if (session.completed && !completed) {
                  Alert.alert('Info', 'Completed sessions cannot be marked as incomplete. You can delete the session if needed.');
                } else if (!session.completed && completed) {
                  handleToggleComplete(session, completed);
                }
              }}              
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {/* Payment Modal */}
      {sessionToComplete && (
        <PaymentModal
          visible={paymentModalVisible}
          session={sessionToComplete}
          onConfirm={handlePaymentConfirm}
          onCancel={handlePaymentCancel}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  clearFilterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  exportButton: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  exportIcon: {
    marginRight: 5,
  },
  exportButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'white',
  },
  listContent: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  noSessionsText: {
    fontSize: 16,
    opacity: 0.7,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});