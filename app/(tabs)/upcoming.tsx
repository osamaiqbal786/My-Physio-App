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
  ActivityIndicator,
  SafeAreaView,
  useSafeAreaInsets
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Plus } from 'lucide-react-native';
import { Session } from '../../types';
import { getUpcomingSessions, updateSession, deleteSession, getFilteredSessions } from '../../utils/mongoStorage';
import SessionCard from '../../components/SessionCard';
import SessionForm from '../../components/SessionForm';
import SessionFilter from '../../components/SessionFilter';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PaymentModal from '../../components/PaymentModal';

export default function UpcomingScreen() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | undefined>(undefined);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [sessionToComplete, setSessionToComplete] = useState<Session | null>(null);
  const [isFiltered, setIsFiltered] = useState(false);
  const [filterTitle, setFilterTitle] = useState('Upcoming Sessions');

  // Get URL params
  const params = useLocalSearchParams();
  const patientId = params.patientId as string | undefined;
  const patientName = params.patientName as string | undefined;
  
  const router = useRouter();

  // Get the device color scheme
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // Create theme object based on the color scheme
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

  const loadSessions = async () => {
    try {
      setLoading(true);
      
      // If patientId is provided, filter sessions by patient
      if (patientId) {
        setIsFiltered(true);
        setFilterTitle(`${patientName}'s Sessions`);
        
        const filter = {
          patientId: patientId
        };
        
        const filteredSessions = await getFilteredSessions(filter);
        // Sort sessions by date and time
        const sortedSessions = filteredSessions.sort((a, b) => {
          const dateA = new Date(`${a.date}T${a.time}`);
          const dateB = new Date(`${b.date}T${b.time}`);
          return dateA.getTime() - dateB.getTime();
        });
        
        setSessions(sortedSessions);
      } else {
        setIsFiltered(false);
        setFilterTitle('Upcoming Sessions');
        const upcomingSessions = await getUpcomingSessions();
        setSessions(upcomingSessions);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSessions();
    }, [patientId])
  );

  const handleAddSession = () => {
    setSelectedSession(undefined);
    setModalVisible(true);
  };

  const handleEditSession = (session: Session) => {
    setSelectedSession(session);
    setModalVisible(true);
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
    if (completed) {
      // Prevent marking upcoming sessions as complete
      Alert.alert(
        'Cannot Complete',
        'Upcoming sessions cannot be marked as complete. Please wait until the session date has passed.',
        [{ text: 'OK' }]
      );
    } else {
      // If marking as incomplete, just update the session
      try {
        const updatedSession = { ...session, completed, amount: undefined };
        await updateSession(updatedSession);
        loadSessions();
      } catch (error) {
        console.error('Error updating session completion status:', error);
        Alert.alert('Error', 'Failed to update session status');
      }
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

  const handleSaveSession = async (session: Session) => {
    setModalVisible(false);
    loadSessions();
  };

  // Group sessions by date
  const groupedSessions = sessions.reduce((groups: Record<string, Session[]>, session) => {
    const date = session.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(session);
    return groups;
  }, {});

  // Convert to array for FlatList
  const sessionsByDate = Object.keys(groupedSessions).map(date => ({
    date,
    sessions: groupedSessions[date]
  }));

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundColor }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textColor }]}>{filterTitle}</Text>
        {isFiltered ? (
          <TouchableOpacity 
            style={[styles.clearFilterButton, { backgroundColor: theme.borderColor }]}
            onPress={() => {
              // Clear the filter and reload sessions
              router.setParams({});
              setIsFiltered(false);
              setFilterTitle('Upcoming Sessions');
              loadSessions();
            }}
          >
            <Text style={[styles.clearFilterText, { color: theme.textColor }]}>Clear Filter</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: theme.primaryColor }]}
            onPress={handleAddSession}
          >
            <Plus size={24} color="white" />
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centerContent}>
          <Text style={{ color: theme.textColor }}>Loading sessions...</Text>
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={[styles.noSessionsText, { color: theme.textColor }]}>No upcoming sessions scheduled</Text>
          <TouchableOpacity 
            style={[styles.addSessionButton, { backgroundColor: theme.primaryColor }]}
            onPress={handleAddSession}
          >
            <Text style={styles.addSessionButtonText}>Add New Session</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SessionCard
              key={item.id}
              session={item}
              isUpcoming={true}
              onEdit={(session) => handleEditSession(session)}
              onDelete={(sessionId) => handleDeleteSession(sessionId)}
              onToggleComplete={(session, completed) => handleToggleComplete(session, completed)}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: theme.modalBg }]}>
          <SessionForm
            existingSession={selectedSession}
            onSave={handleSaveSession}
            onCancel={() => setModalVisible(false)}
          />
        </View>
      </Modal>

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
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSessionsText: {
    fontSize: 16,
    marginBottom: 20,
  },
  addSessionButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addSessionButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  dateGroup: {
    marginBottom: 20,
  },
  dateHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    padding: 10,
    borderRadius: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
  },
  clearFilterButton: {
    width: 100,
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearFilterText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});